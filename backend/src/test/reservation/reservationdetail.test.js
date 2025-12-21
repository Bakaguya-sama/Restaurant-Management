const { connectTestDB, disconnectTestDB, clearCollections } = require('../utils/db');
const { createCustomer, createTable, createReservation } = require('../utils/factories');
const request = require('supertest');

let app;
let customer;
let table1;
let table2;

beforeAll(async () => {
  await connectTestDB();
  await clearCollections();
  app = require('../../../server');
  customer = await createCustomer();
  table1 = await createTable();
  table2 = await createTable();
});

afterAll(async () => {
  await clearCollections();
  await disconnectTestDB();
});

describe('ReservationDetail API', () => {
  describe('GET /api/v1/reservation-details', () => {
    it('lists all reservation details', async () => {
      const res = await request(app).get('/api/v1/reservation-details');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('filters by reservation_id', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 30);
      const { reservation } = await createReservation({ customer, table: table1, number_of_guests: 2, date: futureDate });
      
      const res = await request(app).get(`/api/v1/reservation-details?reservation_id=${reservation._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('filters by table_id', async () => {
      const res = await request(app).get(`/api/v1/reservation-details?table_id=${table1._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/reservation-details/reservation/:reservationId - Dedicated Reservation Filter', () => {
    it('gets details filtered by reservation id', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 30);
      const { reservation } = await createReservation({ customer, table: table1, number_of_guests: 2, date: futureDate });
      
      const res = await request(app).get(`/api/v1/reservation-details/reservation/${reservation._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data[0].reservation_id).toBe(reservation._id.toString());
      }
    });
  });

  describe('GET /api/v1/reservation-details/table/:tableId - Dedicated Table Filter', () => {
    it('gets details filtered by table id', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 30);
      const { detail } = await createReservation({ customer, table: table1, number_of_guests: 2, date: futureDate });
      
      const res = await request(app).get(`/api/v1/reservation-details/table/${table1._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data[0].table_id).toBe(table1._id.toString());
      }
    });
  });

  describe('GET /api/v1/reservation-details/:id', () => {
    it('gets existing reservation detail by id', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 30);
      const { detail } = await createReservation({ customer, table: table1, number_of_guests: 2, date: futureDate });
      
      const res = await request(app).get(`/api/v1/reservation-details/${detail._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent detail', async () => {
      const res = await request(app).get('/api/v1/reservation-details/507f1f77bcf86cd799439011');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/reservation-details/:id - Update Detail', () => {
    it('updates reservation detail', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 30);
      const { detail } = await createReservation({ customer, table: table1, number_of_guests: 2, date: futureDate });

      const res = await request(app)
        .put(`/api/v1/reservation-details/${detail._id}`)
        .send({ table_id: table2._id });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/reservation-details/:id - Delete Detail', () => {
    it('deletes reservation detail', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 30);
      const { detail } = await createReservation({ customer, table: table1, number_of_guests: 2, date: futureDate });

      const res = await request(app).delete(`/api/v1/reservation-details/${detail._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
