const { connectTestDB, disconnectTestDB, clearCollections } = require('../utils/db');
const { createCustomer, createTable } = require('../utils/factories');
const request = require('supertest');

let app;
let customer;
let table1;
let table2;
let createdId;

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

describe('Reservation API', () => {
  describe('POST /api/v1/reservations - Create Reservation', () => {
    it('creates a reservation with initial table', async () => {
      const res = await request(app)
        .post('/api/v1/reservations')
        .send({
          customer_id: customer._id,
          reservation_date: new Date().toISOString(),
          reservation_time: '18:00',
          details: [{ table_id: table1._id }],
          number_of_guests: 2
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      createdId = res.body.data.id;
    });

    it('returns 400 when details are missing', async () => {
      const res = await request(app)
        .post('/api/v1/reservations')
        .send({
          customer_id: customer._id,
          reservation_date: new Date().toISOString(),
          reservation_time: '19:00',
          number_of_guests: 2
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/reservations - List Reservations', () => {
    it('lists all reservations', async () => {
      const res = await request(app).get('/api/v1/reservations');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('filters by customer_id', async () => {
      const res = await request(app).get(`/api/v1/reservations?customer_id=${customer._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/reservations/:id - Get Reservation', () => {
    it('gets reservation by id', async () => {
      const res = await request(app).get(`/api/v1/reservations/${createdId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/reservations/:id/add-table - Add Table', () => {
    it('adds an additional table to the reservation', async () => {
      const res = await request(app)
        .post(`/api/v1/reservations/${createdId}/add-table`)
        .send({ table_id: table2._id });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('is tolerant when adding the same table/time slot again', async () => {
      const res = await request(app)
        .post(`/api/v1/reservations/${createdId}/add-table`)
        .send({ table_id: table2._id });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/reservations/:id/remove-table/:tableId - Remove Table', () => {
    it('removes a table from the reservation', async () => {
      const res = await request(app)
        .delete(`/api/v1/reservations/${createdId}/remove-table/${table2._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/reservations/:id - Update Reservation', () => {
    it('updates number_of_guests', async () => {
      const res = await request(app)
        .put(`/api/v1/reservations/${createdId}`)
        .send({ number_of_guests: 3 });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('cancels the reservation', async () => {
      const res = await request(app)
        .put(`/api/v1/reservations/${createdId}`)
        .send({ status: 'cancelled' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/reservations/:id - Delete Reservation', () => {
    it('deletes a reservation', async () => {
      const res = await request(app).delete(`/api/v1/reservations/${createdId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
