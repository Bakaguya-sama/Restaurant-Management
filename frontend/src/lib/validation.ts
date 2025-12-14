/**
 * Validation utility functions for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: "Email không được để trống" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Email không đúng định dạng" };
  }

  return { isValid: true };
}

/**
 * Validate Vietnamese phone number
 * Format: 0[3|5|7|8|9]XXXXXXXX or +84[3|5|7|8|9]XXXXXXXX
 */
export function validateVietnamesePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: "Số điện thoại không được để trống" };
  }

  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
    return {
      isValid: false,
      error: "Số điện thoại không đúng định dạng (VD: 0912345678)",
    };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 * Minimum 6 characters
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Mật khẩu không được để trống" };
  }

  if (password.length < 6) {
    return { isValid: false, error: "Mật khẩu phải có ít nhất 6 ký tự" };
  }

  return { isValid: true };
}

/**
 * Validate password confirmation matches
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (password !== confirmPassword) {
    return { isValid: false, error: "Mật khẩu xác nhận không khớp" };
  }

  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(
  value: string,
  fieldName: string
): ValidationResult {
  if (!value || value.trim() === "") {
    return { isValid: false, error: `${fieldName} không được để trống` };
  }

  return { isValid: true };
}

/**
 * Validate number within range
 */
export function validateNumberRange(
  value: number | string,
  min?: number,
  max?: number,
  fieldName: string = "Giá trị"
): ValidationResult {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} phải là số` };
  }

  if (min !== undefined && numValue < min) {
    return {
      isValid: false,
      error: `${fieldName} phải lớn hơn hoặc bằng ${min}`,
    };
  }

  if (max !== undefined && numValue > max) {
    return {
      isValid: false,
      error: `${fieldName} phải nhỏ hơn hoặc bằng ${max}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(
  value: number | string,
  fieldName: string = "Giá trị"
): ValidationResult {
  return validateNumberRange(value, 0.01, undefined, fieldName);
}

/**
 * Validate integer
 */
export function validateInteger(
  value: number | string,
  fieldName: string = "Giá trị"
): ValidationResult {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} phải là số` };
  }

  if (!Number.isInteger(numValue)) {
    return { isValid: false, error: `${fieldName} phải là số nguyên` };
  }

  return { isValid: true };
}

/**
 * Validate date is not in the past
 */
export function validateFutureDate(
  dateString: string,
  fieldName: string = "Ngày"
): ValidationResult {
  if (!dateString) {
    return { isValid: false, error: `${fieldName} không được để trống` };
  }

  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return {
      isValid: false,
      error: `${fieldName} không được là ngày trong quá khứ`,
    };
  }

  // Check if date is within 3 months from today
  const threeMonthsFromNow = new Date(today);
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  if (selectedDate > threeMonthsFromNow) {
    return {
      isValid: false,
      error: `${fieldName} chỉ có thể đặt trong vòng 3 tháng tới`,
    };
  }

  return { isValid: true };
}
