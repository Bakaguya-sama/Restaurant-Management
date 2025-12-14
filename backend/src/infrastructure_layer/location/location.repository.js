const { Location } = require('../../models');
const LocationEntity = require('../../domain_layer/location/location.entity');

class LocationRepository {
  async findAll(filters = {}) {
    const query = {};
    if (filters.floor_id) {
      query.floor_id = filters.floor_id;
    }

    const locations = await Location.find(query)
      .populate('floor_id', 'floor_name')
      .select('_id name floor_id description created_at');

    return locations.map(location => new LocationEntity(location.toObject()));
  }

  async findById(id) {
    const location = await Location.findById(id)
      .populate('floor_id', 'floor_name')
      .select('_id name floor_id description created_at');

    if (!location) return null;
    return new LocationEntity(location.toObject());
  }

  async findByName(name) {
    const location = await Location.findOne({ name })
      .populate('floor_id', 'floor_name');

    if (!location) return null;
    return new LocationEntity(location.toObject());
  }

  async findByFloorId(floorId) {
    const locations = await Location.find({ floor_id: floorId })
      .populate('floor_id', 'floor_name')
      .select('_id name floor_id description created_at');

    return locations.map(location => new LocationEntity(location.toObject()));
  }

  async create(locationData) {
    const location = new Location(locationData);
    const savedLocation = await location.save();
    return new LocationEntity(savedLocation.toObject());
  }

  async update(id, updateData) {
    const location = await Location.findByIdAndUpdate(id, updateData, { new: true })
      .populate('floor_id', 'floor_name')
      .select('_id name floor_id description created_at');

    if (!location) return null;
    return new LocationEntity(location.toObject());
  }

  async delete(id) {
    const location = await Location.findByIdAndDelete(id)
      .populate('floor_id', 'floor_name');

    if (!location) return null;
    return new LocationEntity(location.toObject());
  }

  async checkDuplicate(name, excludeId = null) {
    const query = { name };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Location.findOne(query);
  }

  async getFloorName(floorId) {
    const location = await Location.findById(floorId).populate('floor_id', 'floor_name');
    return location?.floor_id?.floor_name || null;
  }

  async hasAttachedTables(locationId) {
    const { Table } = require('../../models');
    const tableCount = await Table.countDocuments({ location_id: locationId });
    return tableCount > 0;
  }
}

module.exports = LocationRepository;
