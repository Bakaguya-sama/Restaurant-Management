const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const { Location, Floor } = require('../../models');
const mongoose = require('mongoose');

describe('Location Integration Tests', () => {
  let createdLocationId;
  let floorId;

  beforeAll(async () => {
    await connectDB();

    
    const floor = new Floor({
      floor_name: `Test Floor ${Date.now()}`,
      floor_number: Math.floor(Math.random() * 1000),
      description: 'Test floor for locations'
    });
    const savedFloor = await floor.save();
    floorId = savedFloor._id.toString();
  });

  afterAll(async () => {
    if (createdLocationId) {
      await Location.findByIdAndDelete(createdLocationId);
    }
    if (floorId) {
      await Floor.findByIdAndDelete(floorId);
    }
    await mongoose.connection.close();
  });

  describe('POST /api/v1/locations - Create Location', () => {
    it('should create a new location successfully', async () => {
      const newLocation = {
        name: `Section A ${Date.now()}`,
        floor: floorId,
        description: 'VIP dining area'
      };

      const response = await request(app)
        .post('/api/v1/locations')
        .send(newLocation)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newLocation.name);
      expect(response.body.data.floor_id).toBe(floorId);
      expect(response.body.data.floor).toBeDefined();

      createdLocationId = response.body.data.id;
    });

    it('should fail when creating location without name', async () => {
      const invalidLocation = {
        floor: floorId,
        description: 'Test location'
      };

      const response = await request(app)
        .post('/api/v1/locations')
        .send(invalidLocation)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('name and floor are required');
    });

    it('should fail when creating location without floor', async () => {
      const invalidLocation = {
        name: 'Test Location',
        description: 'Test location'
      };

      const response = await request(app)
        .post('/api/v1/locations')
        .send(invalidLocation)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('name and floor are required');
    });

    it('should fail when creating location with non-existent floor', async () => {
      const fakeFloorId = new mongoose.Types.ObjectId();
      const newLocation = {
        name: 'Test Location',
        floor: fakeFloorId.toString(),
        description: 'Test location'
      };

      const response = await request(app)
        .post('/api/v1/locations')
        .send(newLocation)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Floor not found');
    });

    it('should fail when creating location with duplicate name', async () => {
      const locationName = `Location ${Date.now()}`;
      const firstLocation = {
        name: locationName,
        floor: floorId,
        description: 'First location'
      };

      
      const firstResponse = await request(app)
        .post('/api/v1/locations')
        .send(firstLocation)
        .expect(201);

      const firstLocationId = firstResponse.body.data.id;

      
      const response = await request(app)
        .post('/api/v1/locations')
        .send(firstLocation)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');

      
      await Location.findByIdAndDelete(firstLocationId);
    });
  });

  describe('GET /api/v1/locations - Get All Locations', () => {
    it('should retrieve all locations successfully', async () => {
      const response = await request(app)
        .get('/api/v1/locations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter locations by floor', async () => {
      const response = await request(app)
        .get(`/api/v1/locations?floor_id=${floorId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/locations/:id - Get Location by ID', () => {
    beforeEach(async () => {
      const location = new Location({
        name: `Location ${Date.now()}`,
        floor_id: floorId,
        description: 'Test location'
      });
      const savedLocation = await location.save();
      createdLocationId = savedLocation._id.toString();
    });

    it('should retrieve location by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/locations/${createdLocationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdLocationId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('floor_id');
      expect(response.body.data).toHaveProperty('floor');
    });

    it('should return 404 for non-existent location', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/v1/locations/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Location not found');
    });
  });

  describe('GET /api/v1/locations/floor/:floorId - Get Locations by Floor', () => {
    it('should retrieve locations by floor ID successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/locations/floor/${floorId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent floor', async () => {
      const fakeFloorId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/v1/locations/floor/${fakeFloorId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/locations/:id - Update Location', () => {
    beforeEach(async () => {
      const location = new Location({
        name: `Location ${Date.now()}`,
        floor_id: floorId,
        description: 'Test location'
      });
      const savedLocation = await location.save();
      createdLocationId = savedLocation._id.toString();
    });

    it('should update location successfully', async () => {
      const updateData = {
        name: `Updated Location ${Date.now()}`,
        floor: floorId,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/v1/locations/${createdLocationId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should fail when updating location without name', async () => {
      const invalidUpdateData = {
        floor: floorId
      };

      const response = await request(app)
        .put(`/api/v1/locations/${createdLocationId}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when updating with non-existent floor', async () => {
      const fakeFloorId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Test Location',
        floor: fakeFloorId.toString()
      };

      const response = await request(app)
        .put(`/api/v1/locations/${createdLocationId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when updating non-existent location', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Test',
        floor: floorId
      };

      const response = await request(app)
        .put(`/api/v1/locations/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/locations/:id - Delete Location', () => {
    beforeEach(async () => {
      const location = new Location({
        name: `Location ${Date.now()}`,
        floor_id: floorId,
        description: 'Test location'
      });
      const savedLocation = await location.save();
      createdLocationId = savedLocation._id.toString();
    });

    it('should delete location successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/locations/${createdLocationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdLocationId);

      
      const getResponse = await request(app)
        .get(`/api/v1/locations/${createdLocationId}`)
        .expect(404);

      createdLocationId = null;
    });

    it('should return 404 when deleting non-existent location', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/locations/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
