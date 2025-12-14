const { Floor } = require('../../models');
const FloorEntity = require('../../domain_layer/floor/floor.entity');

class FloorRepository {
  async findAll() {
    const floors = await Floor.find().select('_id floor_name floor_number description created_at');
    return floors.map(floor => new FloorEntity(floor.toObject()));
  }

  async findById(id) {
    const floor = await Floor.findById(id).select('_id floor_name floor_number description created_at');
    if (!floor) return null;
    return new FloorEntity(floor.toObject());
  }

  async findByName(floorName) {
    const floor = await Floor.findOne({ floor_name: floorName });
    if (!floor) return null;
    return new FloorEntity(floor.toObject());
  }

  async findByLevel(floorNumber) {
    const floor = await Floor.findOne({ floor_number: floorNumber });
    if (!floor) return null;
    return new FloorEntity(floor.toObject());
  }

  async create(floorData) {
    const floor = new Floor(floorData);
    const savedFloor = await floor.save();
    return new FloorEntity(savedFloor.toObject());
  }

  async update(id, updateData) {
    const floor = await Floor.findByIdAndUpdate(id, updateData, { new: true })
      .select('_id floor_name floor_number description created_at');
    if (!floor) return null;
    return new FloorEntity(floor.toObject());
  }

  async delete(id) {
    const floor = await Floor.findByIdAndDelete(id);
    if (!floor) return null;
    return new FloorEntity(floor.toObject());
  }

  async checkDuplicate(fieldName, value, excludeId = null) {
    const query = { [fieldName]: value };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Floor.findOne(query);
  }

  async hasAttachedLocations(floorId) {
    const { Location } = require('../../models');
    const locationCount = await Location.countDocuments({ floor_id: floorId });
    return locationCount > 0;
  }
}

module.exports = FloorRepository;
