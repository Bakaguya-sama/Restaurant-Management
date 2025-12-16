class ComplaintEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.customer_id = data.customer_id;
    this.subject = data.subject;
    this.description = data.description;
    this.category = data.category;
    this.status = data.status;
    this.priority = data.priority;
    this.assigned_to_staff_id = data.assigned_to_staff_id;
    this.resolution = data.resolution;
    this.created_at = data.created_at;
    this.resolved_at = data.resolved_at;
  }

  validate() {
    const errors = [];

    if (!this.customer_id) {
      errors.push('Customer ID is required');
    }

    if (!this.subject || this.subject.trim().length === 0) {
      errors.push('Subject is required');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }

    const validCategories = ['food', 'service', 'cleanliness', 'other'];
    if (this.category && !validCategories.includes(this.category)) {
      errors.push('Invalid category');
    }

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (this.status && !validStatuses.includes(this.status)) {
      errors.push('Invalid status');
    }

    const validPriorities = ['low', 'medium', 'high'];
    if (this.priority && !validPriorities.includes(this.priority)) {
      errors.push('Invalid priority');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isOpen() {
    return this.status === 'open';
  }

  isResolved() {
    return this.status === 'resolved' || this.status === 'closed';
  }

  canBeResolved() {
    return this.status === 'in_progress' && this.resolution && this.resolution.trim().length > 0;
  }

  toJSON() {
    return {
      id: this.id,
      customer_id: this.customer_id,
      subject: this.subject,
      description: this.description,
      category: this.category,
      status: this.status,
      priority: this.priority,
      assigned_to_staff_id: this.assigned_to_staff_id,
      resolution: this.resolution,
      created_at: this.created_at,
      resolved_at: this.resolved_at
    };
  }
}

module.exports = ComplaintEntity;
