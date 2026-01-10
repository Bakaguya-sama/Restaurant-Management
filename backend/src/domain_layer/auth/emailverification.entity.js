class EmailVerificationEntity {
  constructor(data) {
    this.email = data.email;
    this.token = data.token;
    this.expires_at = data.expires_at;
    this.is_verified = data.is_verified || false;
    this.verified_at = data.verified_at || null;
  }

  isExpired() {
    return new Date() > this.expires_at;
  }

  canVerify() {
    return !this.is_verified && !this.isExpired();
  }

  validate() {
    const errors = [];
    
    if (!this.email || !this.email.includes('@')) {
      errors.push('Invalid email format');
    }
    
    if (!this.token) {
      errors.push('Verification token is required');
    }
    
    if (!this.expires_at) {
      errors.push('Expiration time is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = EmailVerificationEntity;
