const { Ingredient } = require('../../models');
const IngredientEntity = require('../../domain_layer/ingredient/ingredient.entity');

async function findAll() {
  const ingredients = await Ingredient.find();
  return ingredients.map(doc => new IngredientEntity({
    id: doc._id.toString(),
    name: doc.name,
    unit: doc.unit,
    quantity_in_stock: doc.quantity_in_stock || 0,
    minimum_quantity: doc.minimum_quantity || 0,
    unit_price: doc.unit_price,
    supplier_name: doc.supplier_name,
    supplier_contact: doc.supplier_contact,
    expiry_date: doc.expiry_date,
    stock_status: doc.stock_status,
    expiry_status: doc.expiry_status,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  }));
}

async function findById(id) {
  const ingredient = await Ingredient.findById(id);
  if (!ingredient) return null;
  
  return new IngredientEntity({
    id: ingredient._id.toString(),
    name: ingredient.name,
    unit: ingredient.unit,
    quantity_in_stock: ingredient.quantity_in_stock || 0,
    minimum_quantity: ingredient.minimum_quantity || 0,
    unit_price: ingredient.unit_price,
    supplier_name: ingredient.supplier_name,
    supplier_contact: ingredient.supplier_contact,
    expiry_date: ingredient.expiry_date,
    stock_status: ingredient.stock_status,
    expiry_status: ingredient.expiry_status,
    createdAt: ingredient.created_at,
    updatedAt: ingredient.updated_at,
  });
}

async function findByName(name) {
  const ingredient = await Ingredient.findOne({ name });
  if (!ingredient) return null;
  
  return new IngredientEntity({
    id: ingredient._id.toString(),
    name: ingredient.name,
    unit: ingredient.unit,
    quantity_in_stock: ingredient.quantity_in_stock || 0,
    minimum_quantity: ingredient.minimum_quantity || 0,
    unit_price: ingredient.unit_price,
    supplier_name: ingredient.supplier_name,
    supplier_contact: ingredient.supplier_contact,
    expiry_date: ingredient.expiry_date,
    stock_status: ingredient.stock_status,
    expiry_status: ingredient.expiry_status,
    createdAt: ingredient.created_at,
    updatedAt: ingredient.updated_at,
  });
}

async function create(data) {
  const ingredient = new Ingredient({
    name: data.name,
    unit: data.unit,
    quantity_in_stock: data.quantity_in_stock || 0,
    minimum_quantity: data.minimum_quantity || 0,
    unit_price: data.unit_price,
    supplier_name: data.supplier_name,
    supplier_contact: data.supplier_contact,
    expiry_date: data.expiry_date,
    stock_status: data.stock_status || 'available',
    expiry_status: data.expiry_status || 'valid',
  });
  await ingredient.save();
  
  return new IngredientEntity({
    id: ingredient._id.toString(),
    name: ingredient.name,
    unit: ingredient.unit,
    quantity_in_stock: ingredient.quantity_in_stock,
    minimum_quantity: ingredient.minimum_quantity,
    unit_price: ingredient.unit_price,
    supplier_name: ingredient.supplier_name,
    supplier_contact: ingredient.supplier_contact,
    expiry_date: ingredient.expiry_date,
    stock_status: ingredient.stock_status,
    expiry_status: ingredient.expiry_status,
    createdAt: ingredient.created_at,
    updatedAt: ingredient.updated_at,
  });
}

async function update(id, data) {
  const updates = {};
  if (data.name) updates.name = data.name;
  if (data.unit) updates.unit = data.unit;
  if (data.quantity_in_stock !== undefined) updates.quantity_in_stock = data.quantity_in_stock;
  if (data.minimum_quantity !== undefined) updates.minimum_quantity = data.minimum_quantity;
  if (data.unit_price !== undefined) updates.unit_price = data.unit_price;
  if (data.supplier_name) updates.supplier_name = data.supplier_name;
  if (data.supplier_contact) updates.supplier_contact = data.supplier_contact;
  if (data.expiry_date) updates.expiry_date = data.expiry_date;
  if (data.stock_status) updates.stock_status = data.stock_status;
  if (data.expiry_status) updates.expiry_status = data.expiry_status;
  
  updates.updated_at = new Date();
  
  const ingredient = await Ingredient.findByIdAndUpdate(id, updates, { new: true });
  if (!ingredient) return null;
  
  return new IngredientEntity({
    id: ingredient._id.toString(),
    name: ingredient.name,
    unit: ingredient.unit,
    quantity_in_stock: ingredient.quantity_in_stock,
    minimum_quantity: ingredient.minimum_quantity,
    unit_price: ingredient.unit_price,
    supplier_name: ingredient.supplier_name,
    supplier_contact: ingredient.supplier_contact,
    expiry_date: ingredient.expiry_date,
    stock_status: ingredient.stock_status,
    expiry_status: ingredient.expiry_status,
    createdAt: ingredient.created_at,
    updatedAt: ingredient.updated_at,
  });
}

async function deleteById(id) {
  const result = await Ingredient.findByIdAndDelete(id);
  return result !== null;
}

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  update,
  deleteById,
};
