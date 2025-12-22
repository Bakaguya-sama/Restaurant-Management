const { Customer } = require('../../models');

class InvoicePointsService {
  calculatePointsEarned(totalAmount) {
    if (!totalAmount || totalAmount <= 0) {
      return 0;
    }
    return Math.floor(totalAmount / 10000);
  }

  async validatePointsForRedeeming(customerId, pointsToUse) {
    if (!customerId || pointsToUse <= 0) {
      return { isValid: true, message: 'No points to redeem' };
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return { isValid: false, message: 'Customer not found' };
    }

    if (customer.points < pointsToUse) {
      return { 
        isValid: false, 
        message: `Customer has only ${customer.points} points, requested ${pointsToUse}` 
      };
    }

    return { isValid: true, message: 'Points validation successful' };
  }

 
  async redeemCustomerPoints(customerId, pointsUsed) {
    if (!customerId || pointsUsed <= 0) {
      return null;
    }

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { points: -pointsUsed } },
      { new: true }
    );

    return customer;
  }

 
  async awardCustomerPoints(customerId, pointsEarned) {
    if (!customerId || pointsEarned <= 0) {
      return null;
    }

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { points: pointsEarned } },
      { new: true }
    );

    return customer;
  }

  
  async getCustomerPointsBalance(customerId) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return null;
    }

    return customer.points;
  }
}

module.exports = InvoicePointsService;
