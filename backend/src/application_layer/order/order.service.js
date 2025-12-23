const OrderRepository = require('../../infrastructure_layer/order/order.repository');
const OrderDetailRepository = require('../../infrastructure_layer/orderdetail/orderdetail.repository');
const OrderDetailService = require('../../application_layer/orderdetail/orderdetail.service');
const OrderEntity = require('../../domain_layer/order/order.entity');
const { Table, User, Order, DishIngredient, Ingredient, StockImportDetail, StockExport, StockExportDetail } = require('../../models');
const mongoose = require('mongoose');

class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.orderDetailRepository = new OrderDetailRepository();
    this.orderDetailService = new OrderDetailService();
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

  async getAllOrders(filters = {}) {
    return await this.orderRepository.findAll(filters);
  }

  async getOrderById(id) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  /**
   * Validate and deduct ingredients for order items
   * @param {Array} orderItems - Array of {dish_id, quantity}
   * @returns {Promise<Object>} - {isValid, insufficientItems, exportDetails}
   */
  async validateAndPrepareInventoryDeduction(orderItems) {
    const insufficientItems = [];
    const deductionPlan = []; // Store what to deduct
    // So sánh với đầu ngày hôm nay để lô hết hạn trong ngày vẫn dùng được
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of orderItems) {
      // Get dish ingredients
      const dishIngredients = await DishIngredient.find({ dish_id: item.dish_id }).populate('ingredient_id');
      
      for (const dishIng of dishIngredients) {
        const ingredient = dishIng.ingredient_id;
        const requiredQty = dishIng.quantity_required * item.quantity;

        // Use SELECT FOR UPDATE pattern - lock ingredient row
        const ing = await Ingredient.findById(ingredient._id);
        if (!ing) {
          throw { status: 404, message: `Ingredient ${ingredient.name} not found` };
        }

        // Check if sufficient total stock
        if (ing.quantity_in_stock < requiredQty) {
          insufficientItems.push({
            ingredientName: ing.name,
            required: requiredQty,
            available: ing.quantity_in_stock,
            unit: ing.unit
          });
          continue; // Skip to next ingredient
        }

        // ========== KIỂM TRA THÊM: Có đủ trong các lô chưa hết hạn không? ==========
        const availableBatches = await this.getBatchesWithRemaining(ing._id, today);
        const totalAvailableInBatches = availableBatches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
        
        if (totalAvailableInBatches < requiredQty) {
          insufficientItems.push({
            ingredientName: ing.name,
            required: requiredQty,
            available: totalAvailableInBatches,
            unit: ing.unit
          });
          continue; // Skip to next ingredient
        }

        // All checks passed - add to deduction plan
        deductionPlan.push({
          ingredient_id: ing._id,
          ingredientName: ing.name,
          quantity: requiredQty,
          unit: ing.unit,
          unit_price: ing.unit_price
        });
      }
    }

    return {
      isValid: insufficientItems.length === 0,
      insufficientItems,
      deductionPlan
    };
  }

  /**
   * Execute inventory deduction using FIFO and transaction
   * @param {Array} deductionPlan - Array of {ingredient_id, quantity, unit_price}
   * @param {String} orderId - Order ID for logging
   * @param {Object} session - MongoDB session for transaction
   */
  async executeInventoryDeduction(deductionPlan, orderId, session) {
    // Create StockExport record
    const exportNumber = `EXP-ORDER-${Date.now()}`;
    const stockExport = new StockExport({
      export_number: exportNumber,
      export_date: new Date(),
      notes: `Auto deduction for order ${orderId}`,
      status: 'completed'
    });
    
    // Save with or without session
    if (session) {
      await stockExport.save({ session });
    } else {
      await stockExport.save();
    }

    let totalCost = 0;

    for (const plan of deductionPlan) {
      // Deduct from batches using FIFO (First Expired First Out)
      let remainingQty = plan.quantity;
      // So sánh với đầu ngày hôm nay
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Lấy các lô còn số lượng (tính động), chưa hết hạn
      const batches = await this.getBatchesWithRemaining(plan.ingredient_id, today);

      for (const batch of batches) {
        if (remainingQty <= 0) break;
        
        const deductQty = Math.min(batch.remainingQuantity, remainingQty);
        remainingQty -= deductQty;
        
        // ⭐ THAY ĐỔI: KHÔNG trừ batch.quantity nữa
        // Chỉ tạo StockExportDetail để ghi lại đã xuất
        const exportDetail = new StockExportDetail({
          export_id: stockExport._id,
          ingredient_id: plan.ingredient_id,
          batch_id: batch._id, // ⭐ Link to batch
          quantity: deductQty,
          unit_price: batch.unit_price,
          line_total: deductQty * batch.unit_price
        });
        
        if (session) {
          await exportDetail.save({ session });
        } else {
          await exportDetail.save();
        }
        
        totalCost += deductQty * batch.unit_price;
      }

      if (remainingQty > 0) {
        throw { 
          status: 500, 
          message: `Failed to deduct ${plan.ingredientName}: batch quantity insufficient` 
        };
      }

      // Update ingredient total
      let ingredientQuery = Ingredient.findById(plan.ingredient_id);
      if (session) {
        ingredientQuery = ingredientQuery.session(session);
      }
      
      const ingredient = await ingredientQuery;
      ingredient.quantity_in_stock -= plan.quantity;
      
      if (session) {
        await ingredient.save({ session });
      } else {
        await ingredient.save();
      }
    }

    // Update total cost
    stockExport.total_cost = totalCost;
    
    if (session) {
      await stockExport.save({ session });
    } else {
      await stockExport.save();
    }

    return stockExport;
  }

  async createOrder(orderData) {
    const orderEntity = new OrderEntity(orderData);
    const validation = orderEntity.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const existingOrder = await this.orderRepository.findByOrderNumber(orderData.order_number);
    if (existingOrder) {
      throw new Error('Order with this order_number already exists');
    }

    const orderType = orderData.order_type;
    
    if (orderType === 'dine-in-customer' || orderType === 'dine-in-waiter') {
      if (!orderData.table_id) {
        throw new Error('table_id is required for dine-in orders');
      }
      const table = await Table.findById(orderData.table_id);
      if (!table) {
        throw new Error('Table not found');
      }
    }

    if (orderType === 'dine-in-customer' || orderType === 'takeaway-customer') {
      if (!orderData.customer_id) {
        throw new Error('customer_id is required for customer orders');
      }
      const customer = await User.findById(orderData.customer_id);
      if (!customer || customer.role !== 'customer') {
        throw new Error('Customer not found');
      }
    }

    if (orderType === 'dine-in-waiter' || orderType === 'takeaway-staff') {
      if (!orderData.staff_id) {
        throw new Error('staff_id is required for staff orders');
      }
      const staff = await User.findById(orderData.staff_id);
      if (!staff || !['waiter', 'cashier', 'manager'].includes(staff.role)) {
        throw new Error('Staff not found');
      }
    }

    // Running without transaction for standalone MongoDB
    // TODO: Enable transactions when using replica set in production
    
    try {
      // Step 1: Validate inventory (if orderItems provided)
      if (orderData.orderItems && orderData.orderItems.length > 0) {
        const validation = await this.validateAndPrepareInventoryDeduction(orderData.orderItems);
        
        if (!validation.isValid) {
          const insufficientList = validation.insufficientItems.map(item => 
            `${item.ingredientName}: cần ${item.required}${item.unit}, còn ${item.available}${item.unit}`
          ).join('; ');
          
          throw { 
            status: 400, 
            message: 'INSUFFICIENT_INVENTORY',
            details: insufficientList,
            insufficientItems: validation.insufficientItems
          };
        }

        // Step 2: Create order
        const order = await this.orderRepository.create(orderData);

        // Step 3: Create OrderDetails for each item
        const orderDetailService = new OrderDetailService();
        for (const item of orderData.orderItems) {
          // Get dish price
          const Dish = require('../../models').Dish;
          const dish = await Dish.findById(item.dish_id);
          if (!dish) {
            throw new Error(`Dish not found: ${item.dish_id}`);
          }

          const itemData = {
            dish_id: item.dish_id,
            quantity: item.quantity,
            unit_price: dish.price,
            special_instructions: item.special_instructions || null
          };

          await orderDetailService.addItemToOrder(order._id, itemData);
        }

        // Step 4: Deduct inventory (without transaction)
        await this.executeInventoryDeduction(validation.deductionPlan, order._id, null);

        return order;
      } else {
        // No items to validate, just create order
        const order = await this.orderRepository.create(orderData);
        return order;
      }
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(id, updateData) {
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    const validStatuses = ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
    if (updateData.status && !validStatuses.includes(updateData.status)) {
      throw new Error('Invalid status');
    }

    if (updateData.subtotal !== undefined && updateData.subtotal < 0) {
      throw new Error('subtotal cannot be negative');
    }

    if (updateData.tax !== undefined && updateData.tax < 0) {
      throw new Error('tax cannot be negative');
    }

    if (updateData.total_amount !== undefined && updateData.total_amount < 0) {
      throw new Error('total_amount cannot be negative');
    }

    return await this.orderRepository.update(id, updateData);
  }

  async deleteOrder(id) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    await this.orderDetailRepository.deleteByOrderId(id);
    return await this.orderRepository.delete(id);
  }

  async getOrdersByTableId(tableId) {
    return await this.orderRepository.findByTableId(tableId);
  }

  async getOrdersByCustomerId(customerId) {
    return await this.orderRepository.findByCustomerId(customerId);
  }

  async getOrderStatistics(filters = {}) {
    return await this.orderRepository.getOrderStatistics(filters);
  }

  async getOrderDetails(orderId) {
    return await this.orderDetailService.getOrderDetails(orderId);
  }

  async addItemToOrder(orderId, itemData) {
    return await this.orderDetailService.addItemToOrder(orderId, itemData);
  }

  async updateOrderItem(orderId, detailId, updateData) {
    return await this.orderDetailService.updateOrderItem(orderId, detailId, updateData);
  }

  async removeOrderItem(orderId, detailId) {
    return await this.orderDetailService.removeOrderItem(orderId, detailId);
  }

  async calculateOrderTotal(orderId) {
    const orderDetails = await this.orderDetailRepository.findByOrderId(orderId);
    const subtotal = orderDetails.reduce((sum, detail) => sum + detail.line_total, 0);
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + tax;

    await this.orderRepository.update(orderId, {
      subtotal,
      tax,
      total_amount: totalAmount
    });

    return { subtotal, tax, total_amount: totalAmount };
  }

  formatOrderResponse(order) {
    const entity = new OrderEntity(order);
    return entity.formatResponse();
  }
}

module.exports = OrderService;
