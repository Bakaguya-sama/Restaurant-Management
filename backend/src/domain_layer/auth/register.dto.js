class CustomerRegisterRequest {
  constructor(full_name, phone, password, username, email = null, address = null, date_of_birth = null) {
    this.full_name = full_name;
    this.phone = phone;
    this.password = password;
    this.username = username;
    this.email = email;
    this.address = address;
    this.date_of_birth = date_of_birth;
    this.role = 'customer';
  }
}

class StaffRegisterRequest {
  constructor(full_name, phone, email, password, username, role, address = null, date_of_birth = null) {
    this.full_name = full_name;
    this.phone = phone;
    this.email = email;
    this.password = password;
    this.username = username;
    this.role = role;
    this.address = address;
    this.date_of_birth = date_of_birth;
  }
}

class AuthResponse {
  constructor(accessToken, refreshToken, user) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}

module.exports = {
  CustomerRegisterRequest,
  StaffRegisterRequest,
  AuthResponse
};
