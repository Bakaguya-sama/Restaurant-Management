const supplierRepo = require('../../infrastructure_layer/supplier/supplier.repository');
const { SupplierEntity } = require('../../domain_layer/supplier/supplier.entity');

async function listSuppliers() {
  const suppliers = await supplierRepo.listSuppliers();
  return suppliers.map(s => new SupplierEntity({ id: s._id, name: s.name, phone: s.phone_contact || null, address: s.address || null }));
}

async function createSupplier({ name, phone, address }) {
  if (!name) throw { status: 400, message: 'name is required' };

  const existing = await supplierRepo.findByNameInsensitive(name);
  if (existing) throw { status: 409, message: 'Supplier with this name already exists' };

  const s = await supplierRepo.createSupplier({ name, phone, address });
  return { id: s._id, name: s.name, phone: s.phone_contact, address: s.address };
}


async function updateSupplier(id, { name, phone, address }) {
  if (!id) throw { status: 400, message: 'id is required' };
  const updated = await supplierRepo.updateSupplier(id, { name, phone, address });
  if (!updated) throw { status: 404, message: 'Supplier not found' };
  return { id: updated._id, name: updated.name, phone: updated.phone_contact, address: updated.address };
}

async function deleteSupplier(id) {
  if (!id) throw { status: 400, message: 'id is required' };
  const deleted = await supplierRepo.deleteSupplier(id);
  if (!deleted) throw { status: 404, message: 'Supplier not found' };
  return;
}

module.exports = {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
