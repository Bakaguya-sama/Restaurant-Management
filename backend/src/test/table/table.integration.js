const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const { Table, Location, Floor } = require('../../models');
const mongoose = require('mongoose');

describe('Table Integration Tests', () => {
  let createdTableId;
  let locationId;
  let floorId;

  beforeAll(async () => {
    await connectDB();

    
    const floor = new Floor({
      floor_name: `Test Floor ${Date.now()}`,
      floor_number: Math.floor(Math.random() * 1000),
      description: 'Test floor'
    });
    const savedFloor = await floor.save();
    floorId = savedFloor._id.toString();

    const location = new Location({
      name: `Test Location ${Date.now()}`,
      floor_id: floorId,
      description: 'Test location'
    });
    const savedLocation = await location.save();
    locationId = savedLocation._id.toString();
  });

  afterAll(async () => {
    if (createdTableId) {
      await Table.findByIdAndDelete(createdTableId);
    }
    if (locationId) {
      await Location.findByIdAndDelete(locationId);
    }
    if (floorId) {
      await Floor.findByIdAndDelete(floorId);
    }
    await mongoose.connection.close();
  });

  describe('POST /api/v1/tables - Create Table', () => {
    it('should create a new table successfully', async () => {
      const newTable = {
        number: Math.floor(Math.random() * 100),
        area: locationId,
        seats: 4,
        description: 'Standard dining table'
      };

      const response = await request(app)
        .post('/api/v1/tables')
        .send(newTable)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.number).toBe(newTable.number.toString());
      expect(response.body.data.seats).toBe(newTable.seats);
      expect(response.body.data.status).toBe('free');

      createdTableId = response.body.data.id;
    });

    it('should fail when creating table without number', async () => {
      const invalidTable = {
        area: locationId,
        seats: 4
      };

      const response = await request(app)
        .post('/api/v1/tables')
        .send(invalidTable)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when creating table without area', async () => {
      const invalidTable = {
        number: Math.floor(Math.random() * 100),
        seats: 4
      };

      const response = await request(app)
        .post('/api/v1/tables')
        .send(invalidTable)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when creating table without seats', async () => {
      const invalidTable = {
        number: 10,
        area: locationId
      };

      const response = await request(app)
        .post('/api/v1/tables')
        .send(invalidTable)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when creating table with non-existent location', async () => {
      const fakeLocationId = new mongoose.Types.ObjectId();
      const newTable = {
        number: Math.floor(Math.random() * 100),
        area: fakeLocationId.toString(),
        seats: 4
      };

      const response = await request(app)
        .post('/api/v1/tables')
        .send(newTable)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Location not found');
    });

    it('should fail when creating table with duplicate number', async () => {
      const tableNumber = Math.floor(Math.random() * 10000);
      const firstTable = {
        number: tableNumber,
        area: locationId,
        seats: 4
      };

      
      const firstResponse = await request(app)
        .post('/api/v1/tables')
        .send(firstTable)
        .expect(201);

      const firstTableId = firstResponse.body.data.id;

      
      const response = await request(app)
        .post('/api/v1/tables')
        .send(firstTable)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');

      
      await Table.findByIdAndDelete(firstTableId);
    });
  });

  describe('GET /api/v1/tables - Get All Tables', () => {
    it('should retrieve all tables successfully', async () => {
      const response = await request(app)
        .get('/api/v1/tables')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter tables by status', async () => {
      const response = await request(app)
        .get('/api/v1/tables?status=free')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter tables by location', async () => {
      const response = await request(app)
        .get(`/api/v1/tables?location=${locationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/tables/:id - Get Table by ID', () => {
    beforeEach(async () => {
      const table = new Table({
        table_number: Math.floor(Math.random() * 10000),
        location_id: locationId,
        capacity: 4,
        status: 'free'
      });
      const savedTable = await table.save();
      createdTableId = savedTable._id.toString();
    });

    it('should retrieve table by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/tables/${createdTableId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdTableId);
      expect(response.body.data).toHaveProperty('number');
      expect(response.body.data).toHaveProperty('seats');
      expect(response.body.data).toHaveProperty('status');
    });

    it('should return 404 for non-existent table', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/v1/tables/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Table not found');
    });
  });

  describe('GET /api/v1/tables/location/:locationId - Get Tables by Location', () => {
    it('should retrieve tables by location successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/tables/location/${locationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent location', async () => {
      const fakeLocationId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/v1/tables/location/${fakeLocationId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/tables/status/:status - Get Tables by Status', () => {
    it('should retrieve tables by status successfully', async () => {
      const response = await request(app)
        .get('/api/v1/tables/status/free')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail with invalid status', async () => {
      const response = await request(app)
        .get('/api/v1/tables/status/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/tables/:id - Update Table', () => {
    beforeEach(async () => {
      const table = new Table({
        table_number: Math.floor(Math.random() * 10000),
        location_id: locationId,
        capacity: 4,
        status: 'free'
      });
      const savedTable = await table.save();
      createdTableId = savedTable._id.toString();
    });

    it('should update table successfully', async () => {
      const updateData = {
        number: Math.floor(Math.random() * 100),
        area: locationId,
        seats: 6
      };

      const response = await request(app)
        .put(`/api/v1/tables/${createdTableId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.seats).toBe(updateData.seats);
    });

    it('should return 404 when updating non-existent table', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        number: 10,
        area: locationId,
        seats: 4
      };

      const response = await request(app)
        .put(`/api/v1/tables/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/tables/:id/status - Update Table Status', () => {
    beforeEach(async () => {
      const table = new Table({
        table_number: Math.floor(Math.random() * 10000),
        location_id: locationId,
        capacity: 4,
        status: 'free'
      });
      const savedTable = await table.save();
      createdTableId = savedTable._id.toString();
    });

    it('should change table status to occupied', async () => {
      const response = await request(app)
        .patch(`/api/v1/tables/${createdTableId}/status`)
        .send({ status: 'occupied' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('occupied');
    });

    it('should change table status to reserved', async () => {
      const response = await request(app)
        .patch(`/api/v1/tables/${createdTableId}/status`)
        .send({ status: 'reserved' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('reserved');
    });

    it('should change table status to dirty', async () => {
      const response = await request(app)
        .patch(`/api/v1/tables/${createdTableId}/status`)
        .send({ status: 'dirty' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('dirty');
    });

    it('should change table status to broken with reason', async () => {
      const response = await request(app)
        .patch(`/api/v1/tables/${createdTableId}/status`)
        .send({ status: 'broken', brokenReason: 'Leg is broken' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('broken');
    });

    it('should fail when changing to broken without reason', async () => {
      const response = await request(app)
        .patch(`/api/v1/tables/${createdTableId}/status`)
        .send({ status: 'broken' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('brokenReason is required');
    });

    it('should clear brokenReason when changing from broken to other status', async () => {
      
      await request(app)
        .patch(`/api/v1/tables/${createdTableId}/status`)
        .send({ status: 'broken', brokenReason: 'Leg is broken' });

      
      const response = await request(app)
        .patch(`/api/v1/tables/${createdTableId}/status`)
        .send({ status: 'free' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('free');
      
    });

    it('should fail with invalid status', async () => {
      const response = await request(app)
        .patch(`/api/v1/tables/${createdTableId}/status`)
        .send({ status: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent table', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/api/v1/tables/${fakeId}/status`)
        .send({ status: 'occupied' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/tables/:id - Delete Table', () => {
    let tableIdForDelete;

    beforeEach(async () => {
      const table = new Table({
        table_number: Math.floor(Math.random() * 1000000),
        location_id: locationId,
        capacity: 4,
        status: 'free'
      });
      const savedTable = await table.save();
      tableIdForDelete = savedTable._id.toString();
    });

    afterEach(async () => {
      if (tableIdForDelete) {
        try {
          await Table.findByIdAndDelete(tableIdForDelete);
        } catch (error) {
          
        }
        tableIdForDelete = null;
      }
    });

    it('should delete table successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/tables/${tableIdForDelete}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(tableIdForDelete);

      
      const getResponse = await request(app)
        .get(`/api/v1/tables/${tableIdForDelete}`)
        .expect(404);

      tableIdForDelete = null;
    });

    it('should return 404 when deleting non-existent table', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/tables/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/tables/statistics/summary - Get Table Statistics', () => {
    it('should retrieve table status summary successfully', async () => {
      const response = await request(app)
        .get('/api/v1/tables/status/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      const data = response.body.data;
      
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('free');
      expect(data).toHaveProperty('occupied');
      expect(data).toHaveProperty('reserved');
      expect(data).toHaveProperty('dirty');
      expect(data).toHaveProperty('broken');
    });
  });
});
