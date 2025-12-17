const mongoose = require('mongoose');
const { Ingredient, StockImportDetail } = require('../models');

async function syncInventoryQuantities() {
  try {
    console.log('🔄 Starting inventory synchronization...');
    
    // Get all ingredients
    const ingredients = await Ingredient.find();
    
    let updated = 0;
    let errors = 0;
    
    for (const ingredient of ingredients) {
      try {
        // Calculate total quantity from batches
        const batches = await StockImportDetail.find({ 
          ingredient_id: ingredient._id,
          quantity: { $gt: 0 }
        });
        
        const totalFromBatches = batches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);
        
        // Update ingredient if different
        if (ingredient.quantity_in_stock !== totalFromBatches) {
          console.log(`  📦 ${ingredient.name}: ${ingredient.quantity_in_stock} → ${totalFromBatches} ${ingredient.unit}`);
          ingredient.quantity_in_stock = totalFromBatches;
          ingredient.updated_at = new Date();
          await ingredient.save();
          updated++;
        }
      } catch (err) {
        console.error(`  ❌ Error syncing ${ingredient.name}:`, err.message);
        errors++;
      }
    }
    
    console.log(`\n✅ Synchronization complete!`);
    console.log(`   Updated: ${updated} ingredients`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Unchanged: ${ingredients.length - updated - errors}`);
    
  } catch (error) {
    console.error('❌ Synchronization failed:', error);
    throw error;
  }
}

module.exports = { syncInventoryQuantities };

// Run if called directly
if (require.main === module) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_management';
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('📡 Connected to MongoDB');
      return syncInventoryQuantities();
    })
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      mongoose.connection.close();
      process.exit(1);
    });
}
