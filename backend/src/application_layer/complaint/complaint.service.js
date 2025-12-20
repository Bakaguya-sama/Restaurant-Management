const ComplaintRepository = require('../../infrastructure_layer/complaint/complaint.repository');
const ComplaintEntity = require('../../domain_layer/complaint/complaint.entity');
const { User } = require('../../models');

class ComplaintService {
  constructor() {
    this.complaintRepository = new ComplaintRepository();
  }

  async getAllComplaints(filters) {
    return await this.complaintRepository.findAll(filters);
  }

  async getComplaintById(id) {
    return await this.complaintRepository.findById(id);
  }

  async createComplaint(data) {
    const complaintEntity = new ComplaintEntity(data);
    const validation = complaintEntity.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const customer = await User.findById(data.customer_id);
    if (!customer || customer.role !== 'customer') {
      throw new Error('Customer not found');
    }

    return await this.complaintRepository.create(data);
  }

  async updateComplaint(id, updateData) {
    const existingComplaint = await this.complaintRepository.findById(id);

    if (existingComplaint.status === 'closed') {
      throw new Error('Cannot update a closed complaint');
    }

    const updatedData = { ...existingComplaint, ...updateData };
    const complaintEntity = new ComplaintEntity(updatedData);
    const validation = complaintEntity.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return await this.complaintRepository.update(id, updateData);
  }

  async updateComplaintStatus(id, status) {
    const existingComplaint = await this.complaintRepository.findById(id);

    if (existingComplaint.status === 'closed') {
      throw new Error('Cannot update status of a closed complaint');
    }

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    return await this.complaintRepository.updateStatus(id, status);
  }

  async assignComplaintToStaff(id, staffId) {
    const existingComplaint = await this.complaintRepository.findById(id);

    if (existingComplaint.status === 'closed') {
      throw new Error('Cannot assign a closed complaint');
    }

    const staff = await User.findById(staffId);
    if (!staff || !['waiter', 'cashier', 'manager'].includes(staff.role)) {
      throw new Error('Staff not found');
    }

    return await this.complaintRepository.assignToStaff(id, staffId);
  }

  async resolveComplaint(id, resolution) {
    const existingComplaint = await this.complaintRepository.findById(id);

    if (existingComplaint.status === 'closed') {
      throw new Error('Complaint is already closed');
    }

    if (!resolution || resolution.trim().length === 0) {
      throw new Error('Resolution is required');
    }

    return await this.complaintRepository.resolve(id, resolution);
  }

  async deleteComplaint(id) {
    return await this.complaintRepository.delete(id);
  }

  async getComplaintStatistics() {
    return await this.complaintRepository.getStatistics();
  }
}

module.exports = ComplaintService;
