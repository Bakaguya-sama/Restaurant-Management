const OrderDetailRepository = require('../../infrastructure_layer/orderdetail/orderdetail.repository');
const OrderDetailEntity = require('../../domain_layer/orderdetail/orderdetail.entity');
const { Dish, DishIngredient, Ingredient, Order } = require('../../models');

class OrderDetailService {
  constructor() {
    this.orderDetailRepository = new OrderDetailRepository();
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

  async deductIngredientsForDish(dishId, quantity) {
    try {
      // Get all ingredients required for this dish
      const dishIngredients = await DishIngredient.find({ dish_id: dishId });
      
      if (dishIngredients.length === 0) {
        console.log(`No ingredients found for dish ${dishId}`);
        return;
      }

      // Deduct each ingredient
      for (const dishIngredient of dishIngredients) {
        const requiredQuantity = dishIngredient.quantity_required * quantity;
        
        // Find the ingredient and reduce its stock
        const ingredient = await Ingredient.findById(dishIngredient.ingredient_id);
        if (!ingredient) {
          console.warn(`Ingredient ${dishIngredient.ingredient_id} not found`);
          continue;
        }

        const newQuantity = ingredient.quantity_in_stock - requiredQuantity;
        
        if (newQuantity < 0) {
          throw new Error(`Không đủ nguyên liệu ${ingredient.name}. Còn lại: ${ingredient.quantity_in_stock}, cần: ${requiredQuantity}`);
        }

        // Update ingredient stock
        await Ingredient.findByIdAndUpdate(
          dishIngredient.ingredient_id,
          { 
            quantity_in_stock: newQuantity,
            stock_status: newQuantity === 0 ? 'out_of_stock' : newQuantity < 10 ? 'low_stock' : 'available'
          }
        );

        console.log(`Deducted ${requiredQuantity} ${ingredient.unit} of ${ingredient.name} for dish ${dishId}`);
      }
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
      await this.deductIngredientsForDish(detail.dish_id, detail.quantity);
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
