const ViolationRepository = require('../../infrastructure_layer/violation/violation.repository');
const ViolationEntity = require('../../domain_layer/violation/violation.entity');
const { Customer } = require('../../models');

class ViolationService {
  constructor() {
    this.violationRepository = new ViolationRepository();
  }

  async getAllViolations(filters) {
    return await this.violationRepository.findAll(filters);
  }

  async getViolationById(id) {
    return await this.violationRepository.findById(id);
  }

  async getViolationsByCustomerId(customerId) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    return await this.violationRepository.findByCustomerId(customerId);
  }

  async createViolation(data) {
    const violationEntity = new ViolationEntity(data);
    const validation = violationEntity.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const customer = await Customer.findById(data.customer_id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    return await this.violationRepository.create(data);
  }

  async updateViolation(id, updateData) {
    await this.violationRepository.findById(id);

    const updatedData = { ...updateData };
    const violationEntity = new ViolationEntity({ ...updatedData, customer_id: 'temp' });
    const validation = violationEntity.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return await this.violationRepository.update(id, updateData);
  }

  async deleteViolation(id) {
    return await this.violationRepository.delete(id);
  }

  async getViolationStatistics() {
    return await this.violationRepository.getStatistics();
  }

  async getTopViolators(limit) {
    return await this.violationRepository.getTopViolators(limit);
  }
}

module.exports = ViolationService;
