// Menu Integration Tests

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_management_test';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const { Ingredient, StockImport, StockImportDetail, Dish, DishIngredient } = require('../../src/models');

describe('Menu Integration Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }
    await Ingredient.deleteMany({});
    await StockImportDetail.deleteMany({});
    await Dish.deleteMany({});
    await DishIngredient.deleteMany({});
  });

  afterEach(async () => {
    await Ingredient.deleteMany({});
    await StockImportDetail.deleteMany({});
    await Dish.deleteMany({});
    await DishIngredient.deleteMany({});
  });

  afterAll(async () => {
    await Ingredient.deleteMany({});
    await StockImportDetail.deleteMany({});
    await Dish.deleteMany({});
    await DishIngredient.deleteMany({});
    await mongoose.connection.close();
  });

  test('GET /api/v1/menu - returns dish with ingredients and available=true when stock sufficient', async () => {
    const ing = await Ingredient.create({ name: 'Tôm sú', unit: 'kg', unit_price: 1000 });
    const imp = await StockImport.create({ import_number: `IMP-${Date.now()}`, status: 'completed' });
    await StockImportDetail.create({ import_id: imp._id, ingredient_id: ing._id, quantity: 10, unit_price: 1000, line_total: 10 * 1000 });

    const dish = await Dish.create({ name: 'Tôm nướng', category: 'main_course', price: 200000, is_available: true });
    await DishIngredient.create({ dish_id: dish._id, ingredient_id: ing._id, quantity_required: 1, unit: 'kg' });

    const res = await request(app).get('/api/v1/menu');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find(d => d.name === 'Tôm nướng');
    expect(found).toBeDefined();
    expect(found).toHaveProperty('available', true);
    expect(Array.isArray(found.ingredients)).toBe(true);
  });

  test('GET /api/v1/menu - inventory shortage returns available=false and unavailableReason', async () => {
    const ing = await Ingredient.create({ name: 'Cá hồi', unit: 'kg', unit_price: 1000 });
    // stock less than required
    const imp = await StockImport.create({ import_number: `IMP-${Date.now()}` });
    await StockImportDetail.create({ import_id: imp._id, ingredient_id: ing._id, quantity: 0.2, unit_price: 1000, line_total: 0.2 * 1000 });

    const dish = await Dish.create({ name: 'Cá hồi nướng', category: 'main_course', price: 300000, is_available: true });
    await DishIngredient.create({ dish_id: dish._id, ingredient_id: ing._id, quantity_required: 1, unit: 'kg' });

    const res = await request(app).get('/api/v1/menu');
    expect(res.status).toBe(200);
    const found = res.body.data.find(d => d.name === 'Cá hồi nướng');
    expect(found).toBeDefined();
    expect(found).toHaveProperty('available', false);
    expect(found).toHaveProperty('unavailableReason');
    expect(found.unavailableReason).toMatch(/Cá hồi|Nguyên liệu không đủ/);
  });

  test('POST /api/v1/menu - create valid dish and fail when ingredient missing', async () => {
    const ing = await Ingredient.create({ name: 'Bò', unit: 'kg', unit_price: 1000 });

    const payload = { name: 'Bò nướng', category: 'main_course', price: 250000, ingredients: [{ inventoryItemId: String(ing._id), quantity: 0.5 }] };
    const res = await request(app).post('/api/v1/menu').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');

    // Missing ingredient id
    const bad = { name: 'Lẩu', category: 'main_course', price: 150000, ingredients: [{ inventoryItemId: '000000000000000000000000', quantity: 1 }] };
    const res2 = await request(app).post('/api/v1/menu').send(bad);
    expect(res2.status).toBe(400);
    expect(res2.body).toHaveProperty('success', false);
  });

  test('PUT /api/v1/menu/:id - update dish and replace ingredients', async () => {
    const ing1 = await Ingredient.create({ name: 'Gà', unit: 'kg', unit_price: 1000 });
    const ing2 = await Ingredient.create({ name: 'Nấm', unit: 'kg', unit_price: 1000 });

    const dish = await Dish.create({ name: 'Gà chiên', category: 'main_course', price: 180000, is_available: true });
    await DishIngredient.create({ dish_id: dish._id, ingredient_id: ing1._id, quantity_required: 1, unit: 'kg' });

    const payload = { name: 'Gà xào nấm', category: 'main_course', price: 200000, ingredients: [{ inventoryItemId: String(ing2._id), quantity: 0.3 }] };
    const res = await request(app).put(`/api/v1/menu/${dish._id}`).send(payload);
    expect(res.status).toBe(200);

    const get = await request(app).get('/api/v1/menu');
    const found = get.body.data.find(d => d.id === String(dish._id));
    expect(found.name).toBe('Gà xào nấm');
    expect(found.price).toBe(200000);
    expect(found.ingredients.some(i => i.name === 'Nấm')).toBe(true);
  });

  test('PATCH /api/v1/menu/:id/availability - manual toggle respects inventory logic', async () => {
    const ing = await Ingredient.create({ name: 'Cua', unit: 'kg', unit_price: 1000 });
    const imp = await StockImport.create({ import_number: `IMP-${Date.now()}` });
    await StockImportDetail.create({ import_id: imp._id, ingredient_id: ing._id, quantity: 2, unit_price: 1000, line_total: 2 * 1000 });

    const dish = await Dish.create({ name: 'Cua rang', category: 'main_course', price: 300000, is_available: true });
    await DishIngredient.create({ dish_id: dish._id, ingredient_id: ing._id, quantity_required: 1, unit: 'kg' });

    // Manual turn off
    const res = await request(app).patch(`/api/v1/menu/${dish._id}/availability`).send({ available: false, reason: 'Temporarily' });
    expect(res.status).toBe(200);
    expect(res.body.data.available).toBe(false);

    // Inventory sufficient but still manual false
    const get1 = await request(app).get('/api/v1/menu');
    const found1 = get1.body.data.find(d => d.id === String(dish._id));
    expect(found1.available).toBe(false);

    // Make inventory shortage -> still false, reason should be inventory reason or manual
    await StockImportDetail.deleteMany({ ingredient_id: ing._id });
    await StockImportDetail.create({ import_id: imp._id, ingredient_id: ing._id, quantity: 0, unit_price: 0, line_total: 0 });

    const get2 = await request(app).get('/api/v1/menu');
    const found2 = get2.body.data.find(d => d.id === String(dish._id));
    expect(found2.available).toBe(false);
    expect(found2.unavailableReason).toBeDefined();
  });

  test('PATCH /api/v1/menu/:id/availability - accepts string/number and is_available keys', async () => {
    const ing = await Ingredient.create({ name: 'Test Bool', unit: 'kg', unit_price: 1000 });
    const imp = await StockImport.create({ import_number: `IMP-${Date.now()}` });
    await StockImportDetail.create({ import_id: imp._id, ingredient_id: ing._id, quantity: 2, unit_price: 1000, line_total: 2 * 1000 });

    const dish = await Dish.create({ name: 'Bool Dish', category: 'main_course', price: 100000, is_available: true });
    await DishIngredient.create({ dish_id: dish._id, ingredient_id: ing._id, quantity_required: 1, unit: 'kg' });

    // string false
    const r1 = await request(app).patch(`/api/v1/menu/${dish._id}/availability`).send({ available: 'false', reason: 'str' });
    expect(r1.status).toBe(200);
    expect(r1.body.data.available).toBe(false);

    // is_available true (string)
    const r2 = await request(app).patch(`/api/v1/menu/${dish._id}/availability`).send({ is_available: 'true' });
    expect(r2.status).toBe(200);
    expect(r2.body.data.available).toBe(true);

    // numeric 0 -> false
    const r3 = await request(app).patch(`/api/v1/menu/${dish._id}/availability`).send({ available: 0 });
    expect(r3.status).toBe(200);
    expect(r3.body.data.available).toBe(false);
  });

  test('DELETE /api/v1/menu/:id - delete dish and associated ingredients', async () => {
    const ing = await Ingredient.create({ name: 'Mực', unit: 'kg', unit_price: 1000 });
    const dish = await Dish.create({ name: 'Mực chiên', category: 'main_course', price: 150000 });
    await DishIngredient.create({ dish_id: dish._id, ingredient_id: ing._id, quantity_required: 0.5, unit: 'kg' });

    const res = await request(app).delete(`/api/v1/menu/${dish._id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);

    const di = await DishIngredient.find({ dish_id: dish._id });
    expect(di.length).toBe(0);
  });
});
