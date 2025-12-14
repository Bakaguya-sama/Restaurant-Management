const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const { Floor } = require('../../models');
const mongoose = require('mongoose');

describe('Floor Integration Tests', () => {
  let createdFloorId;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    if (createdFloorId) {
      await Floor.findByIdAndDelete(createdFloorId);
    }
    await mongoose.connection.close();
  });

  describe('POST /api/v1/floors - Create Floor', () => {
    it('should create a new floor successfully', async () => {
      const newFloor = {
        name: `Ground Floor ${Date.now()}`,
        level: Math.floor(Math.random() * 100000),
        description: 'Main entrance and dining area'
      };

      const response = await request(app)
        .post('/api/v1/floors')
        .send(newFloor)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newFloor.name);
      expect(response.body.data.level).toBe(newFloor.level);
      expect(response.body.data.description).toBe(newFloor.description);

      createdFloorId = response.body.data.id;
    });

    it('should fail when creating floor without name', async () => {
      const invalidFloor = {
        level: 1,
        description: 'Test floor'
      };

      const response = await request(app)
        .post('/api/v1/floors')
        .send(invalidFloor)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('name and level are required');
    });

    it('should fail when creating floor without level', async () => {
      const invalidFloor = {
        name: 'Test Floor',
        description: 'Test floor'
      };

      const response = await request(app)
        .post('/api/v1/floors')
        .send(invalidFloor)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('name and level are required');
    });

    it('should fail when creating floor with duplicate name', async () => {
      const floorName = `Unique Floor ${Date.now()}`;
      const firstFloor = {
        name: floorName,
        level: Math.floor(Math.random() * 10000),
        description: 'First floor'
      };

      
      const firstResponse = await request(app)
        .post('/api/v1/floors')
        .send(firstFloor)
        .expect(201);

      const firstFloorId = firstResponse.body.data.id;

      
      const response = await request(app)
        .post('/api/v1/floors')
        .send(firstFloor)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');

      
      await Floor.findByIdAndDelete(firstFloorId);
    });

    it('should fail when creating floor with duplicate level', async () => {
      const uniqueLevel = Math.floor(Math.random() * 10000);
      const firstFloor = {
        name: `Floor ${Date.now()}`,
        level: uniqueLevel,
        description: 'First floor'
      };

      
      const firstResponse = await request(app)
        .post('/api/v1/floors')
        .send(firstFloor)
        .expect(201);

      const firstFloorId = firstResponse.body.data.id;

      
      const duplicateLevelFloor = {
        name: `Floor ${Date.now() + 1}`,
        level: uniqueLevel,
        description: 'Duplicate level'
      };

      const response = await request(app)
        .post('/api/v1/floors')
        .send(duplicateLevelFloor)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');

      
      await Floor.findByIdAndDelete(firstFloorId);
    });
  });

  describe('GET /api/v1/floors - Get All Floors', () => {
    it('should retrieve all floors successfully', async () => {
      const response = await request(app)
        .get('/api/v1/floors')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/v1/floors/:id - Get Floor by ID', () => {
    beforeEach(async () => {
      const floor = new Floor({
        floor_name: `Floor ${Date.now()}`,
        floor_number: Math.floor(Math.random() * 1000),
        description: 'Test floor'
      });
      const savedFloor = await floor.save();
      createdFloorId = savedFloor._id.toString();
    });

    it('should retrieve floor by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/floors/${createdFloorId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdFloorId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('level');
    });

    it('should return 404 for non-existent floor ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/v1/floors/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Floor not found');
    });
  });

  describe('PUT /api/v1/floors/:id - Update Floor', () => {
    beforeEach(async () => {
      const floor = new Floor({
        floor_name: `Floor ${Date.now()}`,
        floor_number: Math.floor(Math.random() * 1000),
        description: 'Test floor'
      });
      const savedFloor = await floor.save();
      createdFloorId = savedFloor._id.toString();
    });

    it('should update floor successfully', async () => {
      const updateData = {
        name: `Updated Floor ${Date.now()}`,
        level: Math.floor(Math.random() * 100000),
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/v1/floors/${createdFloorId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.level).toBe(updateData.level);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should fail when updating floor without name', async () => {
      const invalidUpdateData = {
        level: 99
      };

      const response = await request(app)
        .put(`/api/v1/floors/${createdFloorId}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when updating non-existent floor', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Test',
        level: 1
      };

      const response = await request(app)
        .put(`/api/v1/floors/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/floors/:id - Delete Floor', () => {
    let floorIdForDelete;

    beforeEach(async () => {
      const floor = new Floor({
        floor_name: `Floor ${Date.now()}-${Math.random()}`,
        floor_number: Math.floor(Math.random() * 1000000),
        description: 'Test floor'
      });
      const savedFloor = await floor.save();
      floorIdForDelete = savedFloor._id.toString();
    });

    afterEach(async () => {
      if (floorIdForDelete) {
        try {
          await Floor.findByIdAndDelete(floorIdForDelete);
        } catch (error) {
          
        }
        floorIdForDelete = null;
      }
    });

    it('should delete floor successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/floors/${floorIdForDelete}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(floorIdForDelete);

      
      const getResponse = await request(app)
        .get(`/api/v1/floors/${floorIdForDelete}`)
        .expect(404);

      floorIdForDelete = null;
    });

    it('should return 404 when deleting non-existent floor', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/floors/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
