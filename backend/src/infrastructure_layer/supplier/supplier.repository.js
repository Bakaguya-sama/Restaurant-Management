const { Supplier } = require('../../models');

async function listSuppliers() {
  return Supplier.find().select('_id name phone_contact address');
}

async function findByNameInsensitive(name) {
  return Supplier.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
}

async function createSupplier({ name, phone, address }) {
  const supplier = new Supplier({ name, phone_contact: phone, address });
  await supplier.save();
  return supplier;
}


async function updateSupplier(id, { name, phone, address }) {
  const update = {};
  if (name !== undefined) update.name = name;
  if (phone !== undefined) update.phone_contact = phone;
  if (address !== undefined) update.address = address;
  return Supplier.findByIdAndUpdate(id, update, { new: true });
}

async function deleteSupplier(id) {
  return Supplier.findByIdAndDelete(id);
}

module.exports = {
  listSuppliers,
  findByNameInsensitive,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
