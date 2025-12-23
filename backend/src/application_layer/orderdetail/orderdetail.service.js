const OrderDetailRepository = require('../../infrastructure_layer/orderdetail/orderdetail.repository');
const OrderDetailEntity = require('../../domain_layer/orderdetail/orderdetail.entity');
const { Dish, DishIngredient, Ingredient, Order, StockImportDetail, StockExport, StockExportDetail } = require('../../models');

class OrderDetailService {
  constructor() {
    this.orderDetailRepository = new OrderDetailRepository();
  }

  /**
   * Calculate remaining quantity for a batch
   * @param {ObjectId} batchId - Batch ID
   * @returns {Promise<number>} - Remaining quantity
   */
  async getBatchRemainingQuantity(batchId) {
    const batch = await StockImportDetail.findById(batchId);
    if (!batch) return 0;

    // Calculate total exported from this batch
    const exports = await StockExportDetail.find({ batch_id: batchId });
    const totalExported = exports.reduce((sum, e) => sum + (e.quantity || 0), 0);
    
    return batch.quantity - totalExported;
  }

  /**
   * Get batches with remaining quantity calculated dynamically
   * @param {ObjectId} ingredientId
   * @param {Date} today
   * @returns {Promise<Array>} - Batches with remaining quantity
   */
  async getBatchesWithRemaining(ingredientId, today) {
    const batches = await StockImportDetail.find({
      ingredient_id: ingredientId,
      $or: [
        { expiry_date: { $exists: false } },
        { expiry_date: null },
        { expiry_date: { $gte: today } }
      ]
    }).sort({ expiry_date: 1, _id: 1 });

    // Calculate remaining for each batch
    const batchesWithRemaining = [];
    for (const batch of batches) {
      const remaining = await this.getBatchRemainingQuantity(batch._id);
      if (remaining > 0) {
        batchesWithRemaining.push({
          ...batch.toObject(),
          remainingQuantity: remaining
        });
      }
    }

    return batchesWithRemaining;
  }

  async updateOrderTotalsAndNotes(orderId) {
    try {
      // Get all order details for this order
      const orderDetails = await this.orderDetailRepository.findByOrderId(orderId);
      
      // Filter out cancelled items
      const activeDetails = orderDetails.filter(detail => detail.status !== 'cancelled');
      
      // Calculate subtotal from active order details only
      const subtotal = activeDetails.reduce((sum, detail) => sum + detail.line_total, 0);
      
      // Calculate tax (assuming 10% tax rate, adjust as needed)
      const taxRate = 0; // Change to 0.1 for 10% tax if needed
      const tax = subtotal * taxRate;
      const total_amount = subtotal + tax;
      
      // Build notes from active order details with dish names and special instructions
      const dishIds = activeDetails.map(detail => detail.dish_id);
      const dishes = await Dish.find({ _id: { $in: dishIds } });
      const dishMap = {};
      dishes.forEach(dish => {
        dishMap[dish._id.toString()] = dish.name;
      });
      
      const notesLines = activeDetails.map(detail => {
        const dishName = dishMap[detail.dish_id.toString()] || 'Unknown Dish';
        let line = `${detail.quantity}x ${dishName}`;
        if (detail.special_instructions && detail.special_instructions.trim() !== '') {
          line += ` (${detail.special_instructions})`;
        }
        console.log(`Detail: ${dishName}, special_instructions: "${detail.special_instructions}"`);
        return line;
      });
      
      const notes = notesLines.length > 0 ? notesLines.join(', ') : '';
      
      console.log(`Building notes for order ${orderId}: ${notes}`);
      
      // Update the order
      await Order.findByIdAndUpdate(orderId, {
        subtotal,
        tax,
        total_amount,
        notes
      });
      
      console.log(`Updated order ${orderId}: subtotal=${subtotal}, tax=${tax}, total=${total_amount}, notes="${notes}"`);
    } catch (error) {
      console.error('Error updating order totals and notes:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  async deductIngredientsForDish(dishId, quantity, orderId = null) {
    try {
      // Get all ingredients required for this dish
      const dishIngredients = await DishIngredient.find({ dish_id: dishId });
      
      if (dishIngredients.length === 0) {
        console.log(`No ingredients found for dish ${dishId}`);
        return;
      }

      // ========== BƯỚC 1: KIỂM TRA ĐỦ TẤT CẢ NGUYÊN LIỆU TRƯỚC KHI TRỪ ==========
      // So sánh với đầu ngày hôm nay (00:00:00) để lô hết hạn trong ngày vẫn dùng được
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const insufficientIngredients = [];
      
      for (const dishIngredient of dishIngredients) {
        const requiredQuantity = dishIngredient.quantity_required * quantity;
        
        // Find the ingredient
        const ingredient = await Ingredient.findById(dishIngredient.ingredient_id);
        if (!ingredient) {
          console.warn(`Ingredient ${dishIngredient.ingredient_id} not found`);
          continue;
        }

        // Check if total stock is sufficient
        if (ingredient.quantity_in_stock < requiredQuantity) {
          insufficientIngredients.push({
            name: ingredient.name,
            required: requiredQuantity,
            available: ingredient.quantity_in_stock,
            unit: ingredient.unit
          });
          continue;
        }

        // Check if available batches (not expired) are sufficient
        const availableBatches = await this.getBatchesWithRemaining(dishIngredient.ingredient_id, today);
        const totalAvailableInBatches = availableBatches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
        
        if (totalAvailableInBatches < requiredQuantity) {
          insufficientIngredients.push({
            name: ingredient.name,
            required: requiredQuantity,
            available: totalAvailableInBatches,
            unit: ingredient.unit
          });
        }
      }

      // Nếu có bất kỳ nguyên liệu nào không đủ, báo lỗi và KHÔNG TRỪ gì cả
      if (insufficientIngredients.length > 0) {
        const errorMsg = insufficientIngredients.map(item => 
          `${item.name}: cần ${item.required}${item.unit}, chỉ còn ${item.available}${item.unit}`
        ).join('; ');
        throw new Error(`Không đủ nguyên liệu để làm món. ${errorMsg}`);
      }

      // ========== BƯỚC 2: TẤT CẢ ĐỦ → BẮT ĐẦU TRỪ NGUYÊN LIỆU ==========
      // Create a stock export record for tracking
      const exportNumber = `EXP-COOKING-${Date.now()}`;
      const stockExport = new StockExport({
        export_number: exportNumber,
        staff_id: null,
        export_date: new Date(),
        total_cost: 0,
        notes: `Xuất nguyên liệu cho món ăn (Order: ${orderId || 'N/A'})`,
        status: 'completed'
      });
      await stockExport.save();

      let totalCost = 0;

      // Deduct each ingredient
      for (const dishIngredient of dishIngredients) {
        const requiredQuantity = dishIngredient.quantity_required * quantity;
        
        // Find the ingredient
        const ingredient = await Ingredient.findById(dishIngredient.ingredient_id);
        if (!ingredient) {
          console.warn(`Ingredient ${dishIngredient.ingredient_id} not found`);
          continue;
        }

        // Trừ từ StockImportDetail theo FIFO (sắp hết hạn trước)
        let remainingQty = requiredQuantity;
        
        // Lấy các lô nhập kho còn số lượng (tính động), chưa hết hạn
        const batches = await this.getBatchesWithRemaining(dishIngredient.ingredient_id, today);

        // Trừ từng lô cho đến khi đủ số lượng
        for (const batch of batches) {
          if (remainingQty <= 0) break;
          
          const deductQty = Math.min(batch.remainingQuantity, remainingQty);
          remainingQty -= deductQty;
          
          // ⭐ THAY ĐỔI: KHÔNG trừ batch.quantity nữa
          // Chỉ tạo StockExportDetail để ghi lại đã xuất
          const exportDetail = new StockExportDetail({
            export_id: stockExport._id,
            ingredient_id: dishIngredient.ingredient_id,
            batch_id: batch._id, // ⭐ Link to batch
            quantity: deductQty,
            unit_price: batch.unit_price,
            line_total: deductQty * batch.unit_price
          });
          await exportDetail.save();
          
          totalCost += deductQty * batch.unit_price;
          
          console.log(`  Trừ ${deductQty} ${ingredient.unit} từ lô ${batch._id} (còn lại: ${batch.remainingQuantity - deductQty})`);
        }

        // Update ingredient stock
        const newQuantity = ingredient.quantity_in_stock - requiredQuantity;
        await Ingredient.findByIdAndUpdate(
          dishIngredient.ingredient_id,
          { 
            quantity_in_stock: newQuantity,
            stock_status: newQuantity === 0 ? 'out_of_stock' : newQuantity < ingredient.minimum_quantity ? 'low_stock' : 'available'
          }
        );

        console.log(`✓ Đã trừ ${requiredQuantity} ${ingredient.unit} của ${ingredient.name} cho món ${dishId}`);
      }

      // Cập nhật tổng chi phí xuất kho
      stockExport.total_cost = totalCost;
      await stockExport.save();

      console.log(`✓ Hoàn tất trừ nguyên liệu. Mã xuất kho: ${exportNumber}, Tổng chi phí: ${totalCost}`);
      
    } catch (error) {
      console.error('Error deducting ingredients:', error);
      throw error;
    }
  }

  async getOrderDetails(orderId) {
    const details = await this.orderDetailRepository.findByOrderId(orderId);
    return details.map(detail => this.formatOrderDetailResponse(detail));
  }

  async addItemToOrder(orderId, itemData) {
    const dish = await Dish.findById(itemData.dish_id);
    if (!dish) {
      throw new Error('Dish not found');
    }

    const existingItem = await this.orderDetailRepository.findByOrderIdAndDishId(orderId, itemData.dish_id);
    if (existingItem) {
      throw new Error('This dish is already in the order');
    }

    const lineTotal = itemData.quantity * itemData.unit_price;

    const created = await this.orderDetailRepository.create({
      order_id: orderId,
      dish_id: itemData.dish_id,
      quantity: itemData.quantity,
      unit_price: itemData.unit_price,
      line_total: lineTotal,
      special_instructions: itemData.special_instructions,
      status: 'pending'
    });

    // Update order totals and notes after adding item
    await this.updateOrderTotalsAndNotes(orderId);

    return this.formatOrderDetailResponse(created);
  }

  async updateOrderItem(orderId, detailId, updateData) {
    const detail = await this.orderDetailRepository.findById(detailId);
    if (!detail || detail.order_id.toString() !== orderId.toString()) {
      throw new Error('Order detail not found in this order');
    }

    const oldStatus = detail.status;
    const newStatus = updateData.status;

    const updatedDetail = { ...detail.toObject(), ...updateData };
    
    if (updateData.quantity && updateData.unit_price) {
      updatedDetail.line_total = updateData.quantity * updateData.unit_price;
    } else if (updateData.quantity) {
      updatedDetail.line_total = updateData.quantity * detail.unit_price;
    } else if (updateData.unit_price) {
      updatedDetail.line_total = detail.quantity * updateData.unit_price;
    }

    // Check if status is changing to 'preparing' - deduct ingredients
    if (newStatus && newStatus === 'preparing' && oldStatus !== 'preparing') {
      console.log(`Order detail ${detailId} status changing from ${oldStatus} to ${newStatus}. Deducting ingredients...`);
      await this.deductIngredientsForDish(detail.dish_id, detail.quantity, orderId);
    }

    const updated = await this.orderDetailRepository.update(detailId, {
      quantity: updateData.quantity,
      unit_price: updateData.unit_price,
      line_total: updatedDetail.line_total,
      special_instructions: updateData.special_instructions,
      status: updateData.status
    });

    console.log(`Updated order detail ${detailId}, special_instructions: "${updated.special_instructions}"`);

    // Update order totals and notes after updating item
    await this.updateOrderTotalsAndNotes(orderId);

    return this.formatOrderDetailResponse(updated);
  }

  async removeOrderItem(orderId, detailId) {
    const detail = await this.orderDetailRepository.findById(detailId);
    if (!detail || detail.order_id.toString() !== orderId.toString()) {
      throw new Error('Order detail not found in this order');
    }

    const result = await this.orderDetailRepository.delete(detailId);
    
    // Update order totals and notes after removing item
    await this.updateOrderTotalsAndNotes(orderId);
    
    return result;
  }

  formatOrderDetailResponse(detail) {
    const entity = new OrderDetailEntity(detail);
    return entity.formatResponse();
  }
}

module.exports = OrderDetailService;
