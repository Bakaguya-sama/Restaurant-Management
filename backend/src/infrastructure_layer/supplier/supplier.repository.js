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

module.exports = {
  listSuppliers,
  findByNameInsensitive,
  createSupplier
};
