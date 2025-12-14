class InventoryBatch {
  constructor({ id, ingredientId, name, quantity, unit, expiryDate, supplierName, lastUpdated }) {
    this.id = id;
    this.ingredientId = ingredientId;
    this.name = name;
    this.quantity = quantity;
    this.unit = unit;
    this.expiryDate = expiryDate;
    this.supplierName = supplierName;
    this.lastUpdated = lastUpdated;
  }
}

module.exports = {
  InventoryBatch
};
