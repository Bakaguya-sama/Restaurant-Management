class CustomerEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.full_name = data.full_name;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.date_of_birth = data.date_of_birth;
    this.membership_level = data.membership_level || 'regular';
    this.points = data.points || 0;
    this.total_spent = data.total_spent || 0;
    this.image_url = data.image_url;
    this.isBanned = data.isBanned || false;
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

    const validLevels = ['regular', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];
    if (this.membership_level && !validLevels.includes(this.membership_level)) {
      errors.push('Invalid membership level');
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

  canUpgradeMembership() {
    const thresholds = {
      regular: 0,
      bronze: 1000000,
      silver: 5000000,
      gold: 15000000,
      platinum: 30000000,
      diamond: 50000000
    };

    for (const [level, threshold] of Object.entries(thresholds).reverse()) {
      if (this.total_spent >= threshold && this.membership_level !== level) {
        return level;
      }
    }

    return null;
  }

  toJSON() {
    return {
      id: this.id,
      full_name: this.full_name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      date_of_birth: this.date_of_birth,
      membership_level: this.membership_level,
      points: this.points,
      total_spent: this.total_spent,
      image_url: this.image_url,
      isBanned: this.isBanned,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = CustomerEntity;
