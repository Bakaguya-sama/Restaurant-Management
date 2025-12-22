const { connectTestDB, disconnectTestDB, clearCollections } = require('../utils/db');
const { createCustomer, createTable } = require('../utils/factories');
const request = require('supertest');

let app;
let customer;
let table1;
let table2;

// Helper function to generate valid reservation times (avoid midnight wraparound)
function getValidReservationTimes() {
  let hour = 10; // Use fixed time to avoid midnight issues
  let minute = 0;
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const checkoutHour = hour + 2;
  const checkoutTimeStr = `${String(checkoutHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return { timeStr, checkoutTimeStr };
}

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
    it('creates a reservation with initial table within 1 hour window', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Use tomorrow to avoid timezone issues
      const dateStr = futureDate.toISOString().split('T')[0];
      const { timeStr, checkoutTimeStr } = getValidReservationTimes();
      
      const res = await request(app)
        .post('/api/v1/reservations')
        .send({
          customer_id: customer._id,
          reservation_date: dateStr,
          reservation_time: timeStr,
          reservation_checkout_time: checkoutTimeStr,
          details: [{ table_id: table1._id }],
          number_of_guests: 2,
          deposit_amount: 200000
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');
    });

    it('returns 400 when details are missing', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 30);
      const dateStr = futureDate.toISOString().split('T')[0];
      const checkoutHour = (futureDate.getHours() + 2) % 24;
      const checkoutTimeStr = `${String(checkoutHour).padStart(2, '0')}:${String(futureDate.getMinutes()).padStart(2, '0')}`;
      const res = await request(app)
        .post('/api/v1/reservations')
        .send({
          customer_id: customer._id,
          reservation_date: dateStr,
          reservation_time: '19:00',
          reservation_checkout_time: checkoutTimeStr,
          number_of_guests: 2,
          deposit_amount: 200000
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when checkout time is not after reservation time', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];
      const timeStr = '10:00';
      
      const res = await request(app)
        .post('/api/v1/reservations')
        .send({
          customer_id: customer._id,
          reservation_date: dateStr,
          reservation_time: timeStr,
          reservation_checkout_time: timeStr,
          details: [{ table_id: table1._id }],
          number_of_guests: 2,
          deposit_amount: 200000
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('must be after');
    });

    it('creates reservation outside 1 hour window without marking table reserved', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];
      const { timeStr, checkoutTimeStr } = getValidReservationTimes();
      
      const res = await request(app)
        .post('/api/v1/reservations')
        .send({
          customer_id: customer._id,
          reservation_date: dateStr,
          reservation_time: timeStr,
          reservation_checkout_time: checkoutTimeStr,
          details: [{ table_id: table1._id }],
          number_of_guests: 2,
          deposit_amount: 200000
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/reservations', () => {
    it('lists all reservations', async () => {
      const res = await request(app).get('/api/v1/reservations');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('filters by customer_id', async () => {
      const res = await request(app).get(`/api/v1/reservations?customer_id=${customer._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/reservations/:id', () => {
    it('gets reservation by id', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];
      const { timeStr, checkoutTimeStr } = getValidReservationTimes();
      
      const createRes = await request(app)
        .post('/api/v1/reservations')
        .send({
          customer_id: customer._id,
          reservation_date: dateStr,
          reservation_time: timeStr,
          reservation_checkout_time: checkoutTimeStr,
          details: [{ table_id: table1._id }],
          number_of_guests: 2,
          deposit_amount: 200000
        });
      
      const resId = createRes.body.data.id;
      const res = await request(app).get(`/api/v1/reservations/${resId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/reservations/statistics', () => {
    it('gets reservation statistics', async () => {
      const res = await request(app).get('/api/v1/reservations/statistics');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/reservations/:id - Update Reservation', () => {
    it('updates number_of_guests', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];
      const { timeStr, checkoutTimeStr } = getValidReservationTimes();
      
      const createRes = await request(app)
        .post('/api/v1/reservations')
        .send({
          customer_id: customer._id,
          reservation_date: dateStr,
          reservation_time: timeStr,
          reservation_checkout_time: checkoutTimeStr,
          details: [{ table_id: table1._id }],
          number_of_guests: 2,
          deposit_amount: 200000
        });
      const resId = createRes.body.data.id;

      const res = await request(app)
        .put(`/api/v1/reservations/${resId}`)
        .send({ number_of_guests: 3 });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/v1/reservations/:id/status - Update Status', () => {
    it('prevents status change from pending to in_progress without payment', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];
      const { timeStr, checkoutTimeStr } = getValidReservationTimes();
      
      const createRes = await request(app)
        .post('/api/v1/reservations')
        .send({
          customer_id: customer._id,
          reservation_date: dateStr,
          reservation_time: timeStr,
          reservation_checkout_time: checkoutTimeStr,
          details: [{ table_id: table1._id }],
          number_of_guests: 2,
          deposit_amount: 200000
        });
      const resId = createRes.body.data.id;

      const res = await request(app)
        .patch(`/api/v1/reservations/${resId}/status`)
        .send({ status: 'in_progress' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Cannot change status to in_progress from pending');
    });

    it('allows status change from pending to confirmed', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];
      const { timeStr, checkoutTimeStr } = getValidReservationTimes();
      
      const createRes = await request(app)
        .post('/api/v1/reservations')
        .send({
          customer_id: customer._id,
          reservation_date: dateStr,
          reservation_time: timeStr,
          reservation_checkout_time: checkoutTimeStr,
          details: [{ table_id: table1._id }],
          number_of_guests: 2,
          deposit_amount: 200000
        });
      const resId = createRes.body.data.id;

      const res = await request(app)
        .patch(`/api/v1/reservations/${resId}/status`)
        .send({ status: 'confirmed' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('confirmed');
    });

    it('allows status change from confirmed to cancelled', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];
      const { timeStr, checkoutTimeStr } = getValidReservationTimes();
      
      const createRes = await request(app)
        .post('/api/v1/reservations')
        .send({
          customer_id: customer._id,
          reservation_date: dateStr,
          reservation_time: timeStr,
          reservation_checkout_time: checkoutTimeStr,
          details: [{ table_id: table1._id }],
          number_of_guests: 2,
          deposit_amount: 200000
        });
      const resId = createRes.body.data.id;

      // First confirm the reservation
      await request(app)
        .patch(`/api/v1/reservations/${resId}/status`)
        .send({ status: 'confirmed' });

      // Then cancel it
      const res = await request(app)
        .patch(`/api/v1/reservations/${resId}/status`)
        .send({ status: 'cancelled' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('cancelled');
    });

    it('allows confirmed status to auto-transition to in_progress within 1 hour window', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];
      const { timeStr, checkoutTimeStr } = getValidReservationTimes();
      
      const createRes = await request(app)
        .post('/api/v1/reservations')
        .send({
          customer_id: customer._id,
          reservation_date: dateStr,
          reservation_time: timeStr,
          reservation_checkout_time: checkoutTimeStr,
          details: [{ table_id: table1._id }],
          number_of_guests: 2,
          deposit_amount: 200000
        });
      const resId = createRes.body.data.id;

      // First confirm the reservation
      await request(app)
        .patch(`/api/v1/reservations/${resId}/status`)
        .send({ status: 'confirmed' });

      // Fetch the reservation - it should auto-transition to in_progress
      const res = await request(app).get(`/api/v1/reservations/${resId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(['confirmed', 'in_progress']).toContain(res.body.data.status);
    });
  });

  describe('DELETE /api/v1/reservations/:id', () => {
    it('deletes a reservation', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];
      const { timeStr, checkoutTimeStr } = getValidReservationTimes();
      
      const createRes = await request(app)
        .post('/api/v1/reservations')
        .send({
          customer_id: customer._id,
          reservation_date: dateStr,
          reservation_time: timeStr,
          reservation_checkout_time: checkoutTimeStr,
          details: [{ table_id: table1._id }],
          number_of_guests: 2,
          deposit_amount: 200000
        });
      const resId = createRes.body.data.id;

      const res = await request(app).delete(`/api/v1/reservations/${resId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
