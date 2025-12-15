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
    
    const tempEntity = new FloorEntity(floorData);
    const validation = tempEntity.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    
    const existingByName = await this.floorRepository.checkDuplicate('floor_name', floorData.floor_name);
    if (existingByName) {
      throw new Error('Floor with this floor_name already exists');
    }

    
    const existingByLevel = await this.floorRepository.checkDuplicate('floor_number', floorData.floor_number);
    if (existingByLevel) {
      throw new Error('Floor with this floor_number already exists');
    }

    
    const dbData = {
      floor_name: floorData.floor_name,
      floor_number: floorData.floor_number,
      description: floorData.description || ''
    };

    return await this.floorRepository.create(dbData);
  }

  async updateFloor(id, updateData) {
    
    const existingFloor = await this.floorRepository.findById(id);
    if (!existingFloor) {
      throw new Error('Floor not found');
    }

    
    const validationData = {
      floor_name: updateData.floor_name || existingFloor.floor_name,
      floor_number: updateData.floor_number !== undefined ? updateData.floor_number : existingFloor.floor_number,
      description: updateData.description || existingFloor.description
    };

    const tempEntity = new FloorEntity(validationData);
    const validation = tempEntity.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    
    if (updateData.floor_name && updateData.floor_name !== existingFloor.floor_name) {
      const duplicateByName = await this.floorRepository.checkDuplicate('floor_name', updateData.floor_name, id);
      if (duplicateByName) {
        throw new Error('Floor with this floor_name already exists');
      }
    }

    
    if (updateData.floor_number !== undefined && updateData.floor_number !== existingFloor.floor_number) {
      const duplicateByLevel = await this.floorRepository.checkDuplicate('floor_number', updateData.floor_number, id);
      if (duplicateByLevel) {
        throw new Error('Floor with this floor_number already exists');
      }
    }

    
    const dbData = {};
    if (updateData.floor_name) dbData.floor_name = updateData.floor_name;
    if (updateData.floor_number !== undefined) dbData.floor_number = updateData.floor_number;
    if (updateData.description) dbData.description = updateData.description;

    return await this.floorRepository.update(id, dbData);
  }

  async deleteFloor(id) {
    
    const floor = await this.floorRepository.findById(id);
    if (!floor) {
      throw new Error('Floor not found');
    }

    
    const hasLocations = await this.floorRepository.hasAttachedLocations(id);
    if (hasLocations) {
      throw new Error('Cannot delete floor with attached locations');
    }

    return await this.floorRepository.delete(id);
  }

  formatFloorResponse(floor) {
    if (floor instanceof FloorEntity) {
      return floor.formatResponse();
    }
    return {
      id: floor._id || floor.id,
      floor_name: floor.floor_name,
      floor_number: floor.floor_number,
      description: floor.description,
      created_at: floor.created_at
    };
  }
}

module.exports = FloorService;
