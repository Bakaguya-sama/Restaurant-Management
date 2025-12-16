const { Violation } = require('../../models');
const ViolationEntity = require('../../domain_layer/violation/violation.entity');

class ViolationRepository {
  async findAll(filters = {}) {
    const query = {};

    if (filters.customer_id) {
      query.customer_id = filters.customer_id;
    }

    if (filters.violation_type) {
      query.violation_type = filters.violation_type;
    }

    if (filters.start_date && filters.end_date) {
      query.violation_date = {
        $gte: new Date(filters.start_date),
        $lte: new Date(filters.end_date)
      };
    }

    const violations = await Violation.find(query)
      .populate('customer_id', 'full_name email phone membership_level')
      .sort({ violation_date: -1 })
      .lean();

    return violations.map(v => new ViolationEntity(v).toJSON());
  }

  async findById(id) {
    const violation = await Violation.findById(id)
      .populate('customer_id', 'full_name email phone membership_level')
      .lean();

    if (!violation) {
      throw new Error('Violation not found');
    }

    return new ViolationEntity(violation).toJSON();
  }

  async findByCustomerId(customerId) {
    const violations = await Violation.find({ customer_id: customerId })
      .sort({ violation_date: -1 })
      .lean();

    return violations.map(v => new ViolationEntity(v).toJSON());
  }

  async create(data) {
    const violation = new Violation(data);
    await violation.save();

    return new ViolationEntity(violation).toJSON();
  }

  async update(id, updateData) {
    const violation = await Violation.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true, runValidators: true }
    )
      .populate('customer_id', 'full_name email phone membership_level')
      .lean();

    if (!violation) {
      throw new Error('Violation not found');
    }

    return new ViolationEntity(violation).toJSON();
  }

  async delete(id) {
    const result = await Violation.findByIdAndDelete(id);

    if (!result) {
      throw new Error('Violation not found');
    }

    return { message: 'Violation deleted successfully' };
  }

  async getStatistics() {
    const total = await Violation.countDocuments();

    const byType = await Violation.aggregate([
      {
        $group: {
          _id: '$violation_type',
          count: { $sum: 1 }
        }
      }
    ]);

    const topViolators = await Violation.aggregate([
      {
        $group: {
          _id: '$customer_id',
          violation_count: { $sum: 1 }
        }
      },
      {
        $sort: { violation_count: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $project: {
          customer_name: '$customer.full_name',
          customer_email: '$customer.email',
          violation_count: 1
        }
      }
    ]);

    return {
      total,
      by_type: byType,
      top_violators: topViolators
    };
  }

  async getTopViolators(limit = 10) {
    return await Violation.aggregate([
      {
        $group: {
          _id: '$customer_id',
          total_violations: { $sum: 1 }
        }
      },
      {
        $sort: { total_violations: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $project: {
          customer_id: '$_id',
          customer_name: '$customer.full_name',
          customer_email: '$customer.email',
          total_violations: 1,
          _id: 0
        }
      }
    ]);
  }
}

module.exports = ViolationRepository;
