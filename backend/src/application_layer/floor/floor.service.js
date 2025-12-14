const FloorRepository = require('../../infrastructure_layer/floor/floor.repository');
const FloorEntity = require('../../domain_layer/floor/floor.entity');

class FloorService {
  constructor() {
    this.floorRepository = new FloorRepository();
  }

  async getAllFloors() {
    return await this.floorRepository.findAll();
  }

  async getFloorById(id) {
    const floor = await this.floorRepository.findById(id);
    if (!floor) {
      throw new Error('Floor not found');
    }
    return floor;
  }

  async createFloor(floorData) {
    // Validate input
    const tempEntity = new FloorEntity(floorData);
    const validation = tempEntity.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Check for duplicate name
    const existingByName = await this.floorRepository.checkDuplicate('floor_name', floorData.name);
    if (existingByName) {
      throw new Error('Floor with this name already exists');
    }

    // Check for duplicate level
    const existingByLevel = await this.floorRepository.checkDuplicate('floor_number', floorData.level);
    if (existingByLevel) {
      throw new Error('Floor with this level already exists');
    }

    // Prepare data for repository
    const dbData = {
      floor_name: floorData.name,
      floor_number: floorData.level,
      description: floorData.description || ''
    };

    return await this.floorRepository.create(dbData);
  }

  async updateFloor(id, updateData) {
    // Verify floor exists
    const existingFloor = await this.floorRepository.findById(id);
    if (!existingFloor) {
      throw new Error('Floor not found');
    }

    // Validate input
    const validationData = {
      floor_name: updateData.name || existingFloor.floor_name,
      floor_number: updateData.level !== undefined ? updateData.level : existingFloor.floor_number,
      description: updateData.description || existingFloor.description
    };

    const tempEntity = new FloorEntity(validationData);
    const validation = tempEntity.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Check for duplicate name (excluding current floor)
    if (updateData.name && updateData.name !== existingFloor.floor_name) {
      const duplicateByName = await this.floorRepository.checkDuplicate('floor_name', updateData.name, id);
      if (duplicateByName) {
        throw new Error('Floor with this name already exists');
      }
    }

    // Check for duplicate level (excluding current floor)
    if (updateData.level !== undefined && updateData.level !== existingFloor.floor_number) {
      const duplicateByLevel = await this.floorRepository.checkDuplicate('floor_number', updateData.level, id);
      if (duplicateByLevel) {
        throw new Error('Floor with this level already exists');
      }
    }

    // Prepare data for repository
    const dbData = {};
    if (updateData.name) dbData.floor_name = updateData.name;
    if (updateData.level !== undefined) dbData.floor_number = updateData.level;
    if (updateData.description) dbData.description = updateData.description;

    return await this.floorRepository.update(id, dbData);
  }

  async deleteFloor(id) {
    // Verify floor exists
    const floor = await this.floorRepository.findById(id);
    if (!floor) {
      throw new Error('Floor not found');
    }

    // Check if floor has attached locations
    const hasLocations = await this.floorRepository.hasAttachedLocations(id);
    if (hasLocations) {
      throw new Error('Cannot delete floor with attached locations');
    }

    return await this.floorRepository.delete(id);
  }

  formatFloorResponse(floor) {
    return {
      id: floor.id,
      name: floor.floor_name,
      level: floor.floor_number,
      description: floor.description
    };
  }
}

module.exports = FloorService;
