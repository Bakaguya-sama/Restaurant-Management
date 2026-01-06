const InvoiceService = require('../../../application_layer/invoice/invoice.service');
const ReservationService = require('../../../application_layer/reservation/reservation.service');
const CustomerService = require('../../../application_layer/customer/customer.service');
const RatingService = require('../../../application_layer/rating/rating.service');
const inventoryService = require('../../../application_layer/inventory/inventory.service');
const { OrderDetail, Invoice, Order, Dish, Ingredient } = require('../../../models');

class DashboardController {
  constructor() {
    this.invoiceService = new InvoiceService();
    this.reservationService = new ReservationService();
    this.customerService = new CustomerService();
    this.ratingService = new RatingService();
  }

  /**
   * Get dashboard statistics by date range
   * Query params: range (today, week, month), page (for invoice list), limit (items per page)
   */
  async getDashboardStatistics(req, res) {
    try {
      const { range = 'week', page = 1, limit = 5 } = req.query;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (range) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Fetch all statistics
      const invoiceStats = await this.getInvoiceStatsByRange(startDate, endDate, parseInt(page), parseInt(limit));
      const topDishes = await this.getTopDishes(startDate, endDate, 5);
      const lowDishes = await this.getLowDishes(startDate, endDate, 2);
      const damagedItems = []; // Empty for now - need inventory log
      const reservationStats = await this.getReservationStats(startDate, endDate);
      const newCustomers = await this.getNewCustomers(startDate, endDate);

      res.status(200).json({
        success: true,
        data: {
          invoices: invoiceStats,
          topDishes,
          lowDishes,
          damagedItems,
          bookings: reservationStats,
          newCustomers
        }
      });
    } catch (error) {
      console.error('Dashboard statistics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch dashboard statistics'
      });
    }
  }

  /**
   * Get inventory alerts (low stock and expiring items)
   */
  async getInventoryAlerts(req, res) {
    try {
      // Get all batches
      const allBatches = await inventoryService.listInventory({ lowStock: false, expiring: false });
      
      const now = new Date();
      const alerts = [];
      
      for (const batch of allBatches || []) {
        const quantity = batch.quantity || 0;
        const minimumQuantity = batch.minimumQuantity || 0;
        
        let status = 'ok';
        let daysUntilExpiry = null;
        
        // Check expiry status (if has expiry date)
        if (batch.expiryDate) {
          const expiryDate = new Date(batch.expiryDate);
          daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry < 0) {
            status = 'expired'; // Hết hạn
          } else if (daysUntilExpiry <= 7) {
            status = 'expiring'; // Sắp hết hạn (trong 7 ngày)
          }
        }
        
        // Check low stock status (based on quantity vs minimum)
        if (quantity <= minimumQuantity) {
          status = 'low'; // Sắp hết (số lượng thấp)
        }
        
        // Only include alerts (skip items that are ok)
        if (status === 'ok') continue;

        alerts.push({
          name: batch.name || 'Unknown',
          current: quantity,
          minimum: minimumQuantity,
          expiryDate: batch.expiryDate || null,
          status,
          daysUntilExpiry
        });
      }
      
      // Sort by urgency: expired first, then expiring soon, then low
      alerts.sort((a, b) => {
        const statusOrder = { expired: 0, expiring: 1, low: 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return a.daysUntilExpiry - b.daysUntilExpiry;
      });

      res.status(200).json({
        success: true,
        data: alerts.slice(0, 20) // Limit to top 20 most urgent
      });
    } catch (error) {
      console.error('Inventory alerts error:', error);
      res.status(200).json({
        success: true,
        data: []
      });
    }
  }

  /**
   * Get customer statistics
   */
  async getCustomerStatistics(req, res) {
    try {
      const stats = await this.customerService.getCustomerStatistics();
      
      res.status(200).json({
        success: true,
        data: stats || { total: 0, vip: 0, new: 0, returning: 0, avgSpending: 0 }
      });
    } catch (error) {
      console.error('Customer statistics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch customer statistics'
      });
    }
  }

  /**
   * Get recent feedback
   */
  async getRecentFeedback(req, res) {
    try {
      const { limit = 5, range = 'week' } = req.query;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (range) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }
      
      const ratings = await this.ratingService.getAllRatings({ 
        limit: parseInt(limit),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

      const feedback = (ratings || []).map(rating => ({
        customer: rating.customer_id?.full_name || 'Anonymous',
        comment: rating.comment || rating.description || '',
        date: rating.rating_date ? new Date(rating.rating_date).toISOString().split('T')[0] : 
              (rating.created_at ? new Date(rating.created_at).toISOString().split('T')[0] : null),
        rating: rating.rating || rating.score || 0
      }));

      res.status(200).json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Recent feedback error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch feedback'
      });
    }
  }

  // Helper methods
  async getInvoiceStatsByRange(startDate, endDate, page = 1, limit = 5) {
    try {
      const skip = (page - 1) * limit;
      
      // Get total count for pagination
      const totalCount = await Invoice.countDocuments({
        payment_status: 'paid',
        invoice_date: {
          $gte: startDate,
          $lte: endDate
        }
      });
      
      const invoices = await Invoice.find({
        payment_status: 'paid',
        invoice_date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .populate('customer_id', 'full_name')
      .populate('order_id')
      .sort({ invoice_date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

      const totalRevenue = await Invoice.aggregate([
        {
          $match: {
            payment_status: 'paid',
            invoice_date: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total_amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      // Get order details for each invoice to count items
      const list = await Promise.all((invoices || []).map(async (inv) => {
        let totalItems = 0;
        
        if (inv.order_id?._id) {
          // Query OrderDetail to count total items for this order
          const orderDetails = await OrderDetail.find({ 
            order_id: inv.order_id._id,
            status: { $ne: 'cancelled' }
          }).lean();
          
          totalItems = orderDetails.reduce((sum, detail) => sum + (detail.quantity || 0), 0);
        }
        
        return {
          id: inv.invoice_number || inv._id.toString(),
          date: inv.invoice_date ? inv.invoice_date.toISOString().replace('T', ' ').substring(0, 16) : '',
          customer: inv.customer_id?.full_name || 'Guest',
          items: totalItems,
          total: inv.total_amount || 0,
          status: inv.payment_status || 'pending'
        };
      }));

      return {
        count: totalRevenue[0]?.count || 0,
        revenue: totalRevenue[0]?.total || 0,
        list,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Error getting invoice stats:', error);
      return { count: 0, revenue: 0, list: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: limit } };
    }
  }

  async getTopDishes(startDate, endDate, limit = 5) {
    try {
      const topDishes = await OrderDetail.aggregate([
        {
          $lookup: {
            from: 'orders',
            localField: 'order_id',
            foreignField: '_id',
            as: 'order'
          }
        },
        { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
        {
          $match: {
            'order.order_date': {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $lookup: {
            from: 'dishes',
            localField: 'dish_id',
            foreignField: '_id',
            as: 'dish'
          }
        },
        { $unwind: { path: '$dish', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$dish_id',
            name: { $first: '$dish.name' },
            sold: { $sum: '$quantity' },
            revenue: { $sum: { $multiply: ['$quantity', '$unit_price'] } }
          }
        },
        { $match: { name: { $ne: null } } },
        { $sort: { sold: -1 } },
        { $limit: limit }
      ]);

      return topDishes || [];
    } catch (error) {
      console.error('Error getting top dishes:', error);
      return [];
    }
  }

  async getLowDishes(startDate, endDate, limit = 2) {
    try {
      const lowDishes = await OrderDetail.aggregate([
        {
          $lookup: {
            from: 'orders',
            localField: 'order_id',
            foreignField: '_id',
            as: 'order'
          }
        },
        { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
        {
          $match: {
            'order.order_date': {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $lookup: {
            from: 'dishes',
            localField: 'dish_id',
            foreignField: '_id',
            as: 'dish'
          }
        },
        { $unwind: { path: '$dish', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$dish_id',
            name: { $first: '$dish.name' },
            sold: { $sum: '$quantity' },
            revenue: { $sum: { $multiply: ['$quantity', '$unit_price'] } }
          }
        },
        { $match: { name: { $ne: null } } },
        { $sort: { sold: 1 } },
        { $limit: limit }
      ]);

      return lowDishes || [];
    } catch (error) {
      console.error('Error getting low dishes:', error);
      return [];
    }
  }

  async getReservationStats(startDate, endDate) {
    try {
      const reservations = await this.reservationService.getAllReservations({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

      const totalGuests = (reservations || []).reduce((sum, res) => sum + (res.number_of_guests || 0), 0);

      return {
        count: reservations?.length || 0,
        guests: totalGuests
      };
    } catch (error) {
      console.error('Error getting reservation stats:', error);
      return { count: 0, guests: 0 };
    }
  }

  async getNewCustomers(startDate, endDate) {
    try {
      const newCustomers = await this.customerService.getAllCustomers({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

      return newCustomers?.length || 0;
    } catch (error) {
      console.error('Error getting new customers:', error);
      return 0;
    }
  }
}

module.exports = DashboardController;
