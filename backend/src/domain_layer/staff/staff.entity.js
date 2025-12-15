class StaffEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.full_name = data.full_name;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.date_of_birth = data.date_of_birth;
    this.hire_date = data.hire_date;
    this.is_active = data.is_active;
    this.role = data.role;
    this.image_url = data.image_url;
    this.username = data.username;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  validate() {
    const errors = [];

    if (!this.full_name || this.full_name.trim().length === 0) {
      errors.push('Full name is required');
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Valid email is required');
    }

    if (!this.phone || this.phone.trim().length === 0) {
      errors.push('Phone is required');
    }

    if (!this.role || !['waiter', 'cashier', 'manager'].includes(this.role)) {
      errors.push('Valid role is required (waiter, cashier, or manager)');
    }

    if (!this.username || this.username.trim().length === 0) {
      errors.push('Username is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toJSON() {
    return {
      id: this.id,
      full_name: this.full_name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      date_of_birth: this.date_of_birth,
      hire_date: this.hire_date,
      is_active: this.is_active,
      role: this.role,
      image_url: this.image_url,
      username: this.username,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = StaffEntity;
