class ReservationDetailEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.reservation_id = data.reservation_id;
    this.table_id = data.table_id;
  }

  validate() {
    const errors = [];
    if (!this.reservation_id) {
      errors.push('reservation_id is required');
    }
    if (!this.table_id) {
      errors.push('table_id is required');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isSameTable(other) {
    return String(this.table_id) === String(other.table_id);
  }
}

module.exports = ReservationDetailEntity;
