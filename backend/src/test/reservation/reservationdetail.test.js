const { connectTestDB, disconnectTestDB, clearCollections } = require('../utils/db');
const { createCustomer, createTable, createReservation } = require('../utils/factories');
const request = require('supertest');

let app;
let customer;
let table1;
let table2;
let reservation;
let createdDetailId;

beforeAll(async () => {
  await connectTestDB();
  await clearCollections();
  app = require('../../../server');
  customer = await createCustomer();
  table1 = await createTable();
  table2 = await createTable();
  const { reservation: resv } = await createReservation({ customer, table: table1, number_of_guests: 2 });
  reservation = resv;
});

afterAll(async () => {
  await clearCollections();
  await disconnectTestDB();
});

describe('ReservationDetail API', () => {
  describe('POST /api/v1/reservation-details - Create Detail', () => {
    it('creates a reservation detail', async () => {
      const res = await request(app)
        .post('/api/v1/reservation-details')
        .send({
          reservation_id: reservation._id,
          table_id: table2._id
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      createdDetailId = res.body.data.id;
    });
  });

  describe('GET /api/v1/reservation-details - List Details', () => {
    it('lists all reservation details', async () => {
      const res = await request(app).get('/api/v1/reservation-details');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/reservation-details/:id - Get Detail', () => {
    it('gets reservation detail by id', async () => {
      const res = await request(app).get(`/api/v1/reservation-details/${createdDetailId}`);
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
      const res = await request(app)
        .put(`/api/v1/reservation-details/${createdDetailId}`)
        .send({ table_id: table1._id });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/reservation-details/:id - Delete Detail', () => {
    it('deletes reservation detail', async () => {
      const res = await request(app).delete(`/api/v1/reservation-details/${createdDetailId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
