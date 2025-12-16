class RatingReplyEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.rating_id = data.rating_id;
    this.staff_id = data.staff_id;
    this.reply_text = data.reply_text;
    this.reply_date = data.reply_date || new Date();
  }

  validate() {
    const errors = [];

    if (!this.rating_id) {
      errors.push('Rating ID is required');
    }

    if (!this.staff_id) {
      errors.push('Staff ID is required');
    }

    if (!this.reply_text || this.reply_text.trim() === '') {
      errors.push('Reply text is required');
    }

    if (this.reply_text && this.reply_text.length > 1000) {
      errors.push('Reply text must not exceed 1000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  hasContent() {
    return this.reply_text && this.reply_text.trim().length > 0;
  }

  isRecent() {
    const hoursSinceReply = (Date.now() - new Date(this.reply_date).getTime()) / (1000 * 60 * 60);
    return hoursSinceReply < 24;
  }

  toJSON() {
    return {
      id: this.id,
      rating_id: this.rating_id,
      staff_id: this.staff_id,
      reply_text: this.reply_text,
      reply_date: this.reply_date
    };
  }
}

module.exports = RatingReplyEntity;
