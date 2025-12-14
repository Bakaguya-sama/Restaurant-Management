const LocationRepository = require('../../infrastructure_layer/location/location.repository');
const LocationEntity = require('../../domain_layer/location/location.entity');
const { Floor } = require('../../models');

class LocationService {
  constructor() {
    this.locationRepository = new LocationRepository();
  }

  async getAllLocations(filters = {}) {
    return await this.locationRepository.findAll(filters);
  }

  async getLocationById(id) {
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new Error('Location not found');
    }
    return location;
  }

  async getLocationsByFloor(floorName) {
    const floor = await Floor.findOne({ floor_name: floorName });
    if (!floor) {
      throw new Error('Floor not found');
    }

    return await this.locationRepository.findByFloorId(floor._id);
  }

  async getLocationsByFloorId(floorId) {
    const floor = await Floor.findById(floorId);
    if (!floor) {
      throw new Error('Floor not found');
    }

    return await this.locationRepository.findByFloorId(floorId);
  }

  async createLocation(locationData) {
    // Validate input
    const tempEntity = new LocationEntity({
      name: locationData.name,
      floor_id: locationData.floorId
    });

    const validation = tempEntity.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Check if floor exists
    const floor = await Floor.findById(locationData.floorId);
    if (!floor) {
      throw new Error('Floor not found');
    }

    // Check for duplicate name
    const existingLocation = await this.locationRepository.checkDuplicate(locationData.name);
    if (existingLocation) {
      throw new Error('Location with this name already exists');
    }

    // Prepare data for repository
    const dbData = {
      name: locationData.name,
      floor_id: locationData.floorId,
      description: locationData.description || ''
    };

    return await this.locationRepository.create(dbData);
  }

  async updateLocation(id, updateData) {
    // Verify location exists
    const existingLocation = await this.locationRepository.findById(id);
    if (!existingLocation) {
      throw new Error('Location not found');
    }

    // Validate input
    const validationData = {
      name: updateData.name || existingLocation.name,
      floor_id: updateData.floorId || existingLocation.floor_id
    };

    const tempEntity = new LocationEntity(validationData);
    const validation = tempEntity.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Check for duplicate name (excluding current location)
    if (updateData.name && updateData.name !== existingLocation.name) {
      const duplicate = await this.locationRepository.checkDuplicate(updateData.name, id);
      if (duplicate) {
        throw new Error('Location with this name already exists');
      }
    }

    // Check if new floor exists (if provided)
    if (updateData.floorId && updateData.floorId !== existingLocation.floor_id.toString()) {
      const floor = await Floor.findById(updateData.floorId);
      if (!floor) {
        throw new Error('Floor not found');
      }
    }

    // Prepare data for repository
    const dbData = {};
    if (updateData.name) dbData.name = updateData.name;
    if (updateData.floorId) dbData.floor_id = updateData.floorId;
    if (updateData.description) dbData.description = updateData.description;

    return await this.locationRepository.update(id, dbData);
  }

  async deleteLocation(id) {
    // Verify location exists
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new Error('Location not found');
    }

    const hasTables = await this.locationRepository.hasAttachedTables(id);
    if (hasTables) {
      throw new Error('Cannot delete location with attached tables');
    }

    return await this.locationRepository.delete(id);
  }

  async formatLocationResponse(location, floorName = null) {
    return location.formatResponse();
  }
}

module.exports = LocationService;
