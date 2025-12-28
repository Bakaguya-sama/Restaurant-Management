class InventoryBatch {
  constructor({ id, ingredientId, name, quantity, unit, expiryDate, supplierName, lastUpdated, minimumQuantity }) {
    this.id = id;
    this.ingredientId = ingredientId;
    this.name = name;
    this.quantity = quantity;
    this.unit = unit;
    this.expiryDate = expiryDate;
    this.supplierName = supplierName;
    this.lastUpdated = lastUpdated;
    this.minimumQuantity = minimumQuantity;
  }
}

module.exports = {
  InventoryBatch
};
