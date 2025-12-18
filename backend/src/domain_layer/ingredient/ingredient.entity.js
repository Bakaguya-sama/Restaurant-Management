class IngredientEntity {
  constructor({
    id,
    name,
    unit,
    quantity_in_stock,
    minimum_quantity,
    unit_price,
    supplier_name,
    supplier_contact,
    expiry_date,
    stock_status,
    expiry_status,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.name = name;
    this.unit = unit;
    this.quantity_in_stock = quantity_in_stock;
    this.minimum_quantity = minimum_quantity;
    this.unit_price = unit_price;
    this.supplier_name = supplier_name;
    this.supplier_contact = supplier_contact;
    this.expiry_date = expiry_date;
    this.stock_status = stock_status;
    this.expiry_status = expiry_status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(data) {
    return new IngredientEntity(data);
  }
}

module.exports = IngredientEntity;
