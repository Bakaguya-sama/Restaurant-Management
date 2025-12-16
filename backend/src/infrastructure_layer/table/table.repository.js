const { Table, Location, Floor } = require('../../models');
const TableEntity = require('../../domain_layer/table/table.entity');

class TableRepository {
  async findAll(filters = {}) {
    const query = {};

    if (filters.location_id) {
      query.location_id = filters.location_id;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.floor_id) {
      const locations = await Location.find({ floor_id: filters.floor_id });
      const locationIds = locations.map(loc => loc._id);
      query.location_id = { $in: locationIds };
    }

    const tables = await Table.find(query)
      //.populate('location_id', 'name')
      .select('_id table_number location_id capacity status brokenReason created_at');

    return tables.map(table => new TableEntity(table.toObject()));
  }

  async findById(id) {
    const table = await Table.findById(id)
      //.populate('location_id', 'name')
      .select('_id table_number location_id capacity status brokenReason created_at');

    if (!table) return null;
    return new TableEntity(table.toObject());
  }

  async findByNumber(tableNumber) {
    const table = await Table.findOne({ table_number: tableNumber })
      //.populate('location_id', 'name');

    if (!table) return null;
    return new TableEntity(table.toObject());
  }

  async findByLocation(locationId) {
    const tables = await Table.find({ location_id: locationId })
      //.populate('location_id', 'name')
      .select('_id table_number location_id capacity status brokenReason created_at');

    return tables.map(table => new TableEntity(table.toObject()));
  }

  async findByStatus(status) {
    const tables = await Table.find({ status })
      //.populate('location_id', 'name')
      .select('_id table_number location_id capacity status brokenReason created_at');

    return tables.map(table => new TableEntity(table.toObject()));
  }

  async countByStatus() {
    const validStatuses = ['free', 'occupied', 'reserved', 'dirty', 'broken'];
    const summary = {};
    let total = 0;

    for (const status of validStatuses) {
      const count = await Table.countDocuments({ status });
      summary[status] = count;
      total += count;
    }

    return { summary, total };
  }

  async create(tableData) {
    const table = new Table(tableData);
    const savedTable = await table.save();
    //await savedTable.populate('location_id', 'name');
    return new TableEntity(savedTable.toObject());
  }

  async update(id, updateData) {
    updateData.updated_at = new Date();
    const table = await Table.findByIdAndUpdate(id, updateData, { new: true })
      //.populate('location_id', 'name')
      .select('_id table_number location_id capacity status brokenReason created_at');

    if (!table) return null;
    return new TableEntity(table.toObject());
  }

  async updateStatus(id, status, brokenReason = null) {
    const updateData = { status };
    if (brokenReason) {
      updateData.brokenReason = brokenReason;
    }

    const table = await Table.findByIdAndUpdate(id, updateData, { new: true })
      //.populate('location_id', 'name')
      .select('_id table_number location_id capacity status brokenReason created_at');

    if (!table) return null;
    return new TableEntity(table.toObject());
  }

  async delete(id) {
    const table = await Table.findByIdAndDelete(id)
      //.populate('location_id', 'name');

    if (!table) return null;
    return new TableEntity(table.toObject());
  }

  async checkDuplicate(tableNumber, excludeId = null) {
    const query = { table_number: tableNumber };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Table.findOne(query);
  }

  async getFloorInfo(table) {
    if (!table.location_id) return null;

    const location = await Location.findById(table.location_id);//.populate('floor_id', 'floor_name');
    return location?.floor_id?.floor_name || null;
  }

  
}

module.exports = TableRepository;
