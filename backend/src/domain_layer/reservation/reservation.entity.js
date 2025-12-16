  // (Không cần bổ sung gì thêm, validate đã đủ cho các nghiệp vụ mở rộng)
class ReservationEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.customer_id = data.customer_id;
    this.reservation_date = data.reservation_date;
    this.reservation_time = data.reservation_time;
    this.number_of_guests = data.number_of_guests;
    this.status = data.status;
    this.special_requests = data.special_requests;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  validate() {
    const errors = [];
    if (!this.customer_id) {
      errors.push('customer_id is required');
    }
    if (!this.reservation_date) {
      errors.push('reservation_date is required');
    }
    if (!this.reservation_time) {
      errors.push('reservation_time is required');
    }
    if (this.number_of_guests === undefined || this.number_of_guests === null) {
      errors.push('number_of_guests is required');
    } else if (typeof this.number_of_guests !== 'number' || this.number_of_guests <= 0) {
      errors.push('number_of_guests must be a positive number');
    }
    if (this.status && !['pending', 'confirmed', 'cancelled', 'completed'].includes(this.status)) {
      errors.push('status must be one of: pending, confirmed, cancelled, completed');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  canCancel() {
    return ['pending', 'confirmed'].includes(this.status);
  }

  isCompleted() {
    return this.status === 'completed';
  }
}

module.exports = ReservationEntity;
