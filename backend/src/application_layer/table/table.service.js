const TableRepository = require('../../infrastructure_layer/table/table.repository');
const TableEntity = require('../../domain_layer/table/table.entity');
const { Location, Floor } = require('../../models');

class TableService {
  constructor() {
    this.tableRepository = new TableRepository();
  }

  async getAllTables(filters = {}) {
    return await this.tableRepository.findAll(filters);
  }

  async getTableById(id) {
    const table = await this.tableRepository.findById(id);
    if (!table) {
      throw new Error('Table not found');
    }
    return table;
  }

  async getTablesByLocation(locationId) {
    const location = await Location.findById(locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    return await this.tableRepository.findByLocation(locationId);
  }

  async getTablesByFloor(floorName) {
    const floor = await Floor.findOne({ floor_name: floorName });
    if (!floor) {
      throw new Error('Floor not found');
    }

    return await this.tableRepository.findAll({ floor_id: floor._id });
  }

  async getTablesByStatus(status) {
    const validStatuses = ['free', 'occupied', 'reserved', 'dirty', 'broken'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Valid values: ${validStatuses.join(', ')}`);
    }

    return await this.tableRepository.findByStatus(status);
  }

  async getTableStatusSummary() {
    return await this.tableRepository.countByStatus();
  }

  async createTable(tableData) {
    
    const tempEntity = new TableEntity(tableData);
    const validation = tempEntity.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    
    let locationId = null;
    if (tableData.location_id) {
      const location = await Location.findById(tableData.location_id);
      if (!location) {
        throw new Error('Location not found');
      }
      locationId = location._id;
    }

    
    const existingTable = await this.tableRepository.findByNumber(tableData.table_number);
    if (existingTable) {
      throw new Error('Table with this number already exists');
    }

    
    const dbData = {
      table_number: tableData.table_number,
      capacity: tableData.capacity,
      status: 'free',
      location_id: locationId
    };

    return await this.tableRepository.create(dbData);
  }

  async updateTable(id, updateData) {
    
    const existingTable = await this.tableRepository.findById(id);
    if (!existingTable) {
      throw new Error('Table not found');
    }

    
    const validationData = {
      ...existingTable,
      table_number: updateData.table_number || existingTable.table_number,
      capacity: updateData.capacity || existingTable.capacity,
      status: updateData.status || existingTable.status
    };

    const tempEntity = new TableEntity(validationData);
    const validation = tempEntity.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    
    if (updateData.table_number && updateData.table_number !== existingTable.table_number) {
      const duplicate = await this.tableRepository.checkDuplicate(updateData.table_number, id);
      if (duplicate) {
        throw new Error('Table number already exists');
      }
    }

    
    let locationId = null;
    if (updateData.location_id) {
      const location = await Location.findById(updateData.location_id);
      if (!location) {
        throw new Error('Location not found');
      }
      locationId = location._id;
    }

    
    const dbData = {};
    if (updateData.table_number) dbData.table_number = updateData.table_number;
    if (updateData.capacity) dbData.capacity = updateData.capacity;
    if (updateData.status) dbData.status = updateData.status;
    if (updateData.location_id) dbData.location_id = locationId;

    return await this.tableRepository.update(id, dbData);
  }

  async updateTableStatus(id, newStatus, brokenReason = null) {
    
    const existingTable = await this.tableRepository.findById(id);
    if (!existingTable) {
      throw new Error('Table not found');
    }

    
    const validStatuses = ['free', 'occupied', 'reserved', 'dirty', 'broken'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status. Valid values: ${validStatuses.join(', ')}`);
    }

    
    // if (!existingTable.canChangeStatus(newStatus)) {
    //   throw new Error(`Cannot change status from '${existingTable.status}' to '${newStatus}'`);
    // }

    
    if (newStatus === 'broken' && !brokenReason) {
      throw new Error('brokenReason is required when status is "broken"');
    }


    if (existingTable.status === 'broken' && newStatus !== 'broken') {
      brokenReason = null;
    }

    return await this.tableRepository.updateStatus(id, newStatus, brokenReason);
  }

  async deleteTable(id) {
    
    const table = await this.tableRepository.findById(id);
    if (!table) {
      throw new Error('Table not found');
    }

    return await this.tableRepository.delete(id);
  }

  async formatTableResponse(table, includeFloor = false) {
    const response = {
      id: table.id,
      table_number: table.table_number,
      capacity: table.capacity,
      location_id: table.location_id ? table.location_id._id || table.location_id : null,
      status: table.status,
      created_at: table.created_at
    };

    if (includeFloor && table.location_id) {
      const floorInfo = await this.tableRepository.getFloorInfo({
        location_id: table.location_id._id || table.location_id
      });
      response.floor = floorInfo;
    }

    if (table.brokenReason) {
      response.brokenReason = table.brokenReason;
    }

    return response;
  }
}

module.exports = TableService;
