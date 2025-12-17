const { Complaint } = require('../../models');
const ComplaintEntity = require('../../domain_layer/complaint/complaint.entity');

class ComplaintRepository {
  async findAll(filters = {}) {
    const query = {};

    if (filters.customer_id) {
      query.customer_id = filters.customer_id;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.assigned_to_staff_id) {
      query.assigned_to_staff_id = filters.assigned_to_staff_id;
    }

    const complaints = await Complaint.find(query)
      .populate('customer_id', 'full_name email phone')
      .populate('assigned_to_staff_id', 'full_name email role')
      .sort({ created_at: -1 })
      .lean();

    return complaints.map(c => new ComplaintEntity(c).toJSON());
  }

  async findById(id) {
    const complaint = await Complaint.findById(id)
      .populate('customer_id', 'full_name email phone')
      .populate('assigned_to_staff_id', 'full_name email role')
      .lean();

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    return new ComplaintEntity(complaint).toJSON();
  }

  async create(data) {
    const complaint = new Complaint(data);
    await complaint.save();

    return new ComplaintEntity(complaint).toJSON();
  }

  async update(id, updateData) {
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true, runValidators: true }
    )
      .populate('customer_id', 'full_name email phone')
      .populate('assigned_to_staff_id', 'full_name email role')
      .lean();

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    return new ComplaintEntity(complaint).toJSON();
  }

  async updateStatus(id, status) {
    const updateData = { status };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('customer_id', 'full_name email phone')
      .populate('assigned_to_staff_id', 'full_name email role')
      .lean();

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    return new ComplaintEntity(complaint).toJSON();
  }

  async assignToStaff(id, staffId) {
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { assigned_to_staff_id: staffId, status: 'in_progress' },
      { new: true, runValidators: true }
    )
      .populate('customer_id', 'full_name email phone')
      .populate('assigned_to_staff_id', 'full_name email role')
      .lean();

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    return new ComplaintEntity(complaint).toJSON();
  }

  async resolve(id, resolution) {
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { 
        resolution,
        status: 'resolved',
        resolved_at: new Date()
      },
      { new: true, runValidators: true }
    )
      .populate('customer_id', 'full_name email phone')
      .populate('assigned_to_staff_id', 'full_name email role')
      .lean();

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    return new ComplaintEntity(complaint).toJSON();
  }

  async delete(id) {
    const result = await Complaint.findByIdAndDelete(id);

    if (!result) {
      throw new Error('Complaint not found');
    }

    return { message: 'Complaint deleted successfully' };
  }

  async getStatistics() {
    const total = await Complaint.countDocuments();
    const open = await Complaint.countDocuments({ status: 'open' });
    const in_progress = await Complaint.countDocuments({ status: 'in_progress' });
    const resolved = await Complaint.countDocuments({ status: 'resolved' });
    const closed = await Complaint.countDocuments({ status: 'closed' });

    const byCategory = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const byPriority = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      total,
      open,
      in_progress,
      resolved,
      closed,
      by_category: byCategory,
      by_priority: byPriority
    };
  }
}

module.exports = ComplaintRepository;
