const { Dish } = require('../../models');

class DishRepository {
  async findAll(filters = {}) {
    const query = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.is_available !== undefined) {
      query.is_available = filters.is_available;
    }

    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }

    return await Dish.find(query).sort({ created_at: -1 });
  }

  async findById(id) {
    return await Dish.findById(id);
  }

  async findByName(name) {
    return await Dish.findOne({ name });
  }

  async create(data) {
    const dish = new Dish({
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      image_url: data.image_url,
      is_available: data.is_available !== undefined ? data.is_available : true
    });

    return await dish.save();
  }

  async update(id, data) {
    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.image_url !== undefined) updateData.image_url = data.image_url;
    if (data.is_available !== undefined) updateData.is_available = data.is_available;
    if (data.manual_unavailable_reason !== undefined) updateData.manual_unavailable_reason = data.manual_unavailable_reason;
    if (data.manual_unavailable_by !== undefined) updateData.manual_unavailable_by = data.manual_unavailable_by;
    if (data.manual_unavailable_at !== undefined) updateData.manual_unavailable_at = data.manual_unavailable_at;

    updateData.updated_at = new Date();

    return await Dish.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updateAvailability(id, is_available, reason = null, staffId = null) {
    const updateData = {
      is_available,
      updated_at: new Date()
    };

    if (!is_available) {
      updateData.manual_unavailable_reason = reason || 'Temporarily unavailable';
      updateData.manual_unavailable_by = staffId;
      updateData.manual_unavailable_at = new Date();
    } else {
      updateData.manual_unavailable_reason = null;
      updateData.manual_unavailable_by = null;
      updateData.manual_unavailable_at = null;
    }

    return await Dish.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await Dish.findByIdAndDelete(id);
  }

  async countByCategory() {
    return await Dish.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
  }
}

module.exports = DishRepository;
