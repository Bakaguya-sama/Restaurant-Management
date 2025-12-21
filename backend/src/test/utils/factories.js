const { Customer, Floor, Location, Table, Reservation, ReservationDetail } = require('../../models');

async function createCustomer(overrides = {}) {
  const customer = new Customer({
    full_name: 'Test User',
    email: `test${Date.now()}@example.com`,
    phone: '0900000000',
    password_hash: 'hash',
    role: 'customer',
    username: `testuser${Date.now()}`,
    is_active: true,
    ...overrides,
  });
  return await customer.save();
}

async function createFloor(overrides = {}) {
  const floor = new Floor({
    floor_name: `Floor ${Date.now()}`,
    floor_number: Math.floor(Math.random() * 1000) + 1,
    ...overrides,
  });
  return await floor.save();
}

async function createLocation(overrides = {}) {
  const floor = overrides.floor || (await createFloor());
  const location = new Location({
    name: `Loc ${Date.now()}`,
    floor_id: floor._id,
    ...overrides,
  });
  return await location.save();
}

async function createTable(overrides = {}) {
  const location = overrides.location || (await createLocation());
  const table = new Table({
    table_number: Math.floor(Math.random() * 1000) + 1,
    location_id: location._id,
    capacity: overrides.capacity || 4,
    status: overrides.status || 'free',
    ...overrides,
  });
  return await table.save();
}

async function createReservation({ customer, table, number_of_guests = 2, date = new Date(), time = '18:00', checkoutTime = '20:00' }) {
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
  const reservation = new Reservation({
    customer_id: customer._id,
    reservation_date: dateStr,
    reservation_time: time,
    reservation_checkout_time: checkoutTime,
    number_of_guests,
    status: 'pending',
  });
  const saved = await reservation.save();
  const detail = new ReservationDetail({
    reservation_id: saved._id,
    table_id: table._id,
    reservation_date: dateStr,
    reservation_time: time,
  });
  await detail.save();
  return { reservation: saved, detail };
}

module.exports = { createCustomer, createFloor, createLocation, createTable, createReservation };