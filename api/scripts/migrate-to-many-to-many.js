/**
 * Migration: Single modelId → Many-to-Many (ModelOrder junction)
 *
 * Run from the api folder:
 *   node scripts/migrate-to-many-to-many.js
 *
 * Requires a valid CONNECTION_STRING environment variable.
 *
 * SAFETY:
 * - Creates a backup collection "orders_backup_pre_migration_TIMESTAMP" before starting
 * - If migration fails, you can restore from the backup collection
 * - Backup is only created if migration hasn't been run before
 */

import mongoose from 'mongoose'
import { dbContext } from '../src/db/DbContext.js'

const CONNECTION_STRING = process.env.CONNECTION_STRING

async function migrate() {
  if (!CONNECTION_STRING) {
    console.error('❌ No CONNECTION_STRING found in environment. Check your .env file.')
    process.exit(1)
  }

  try {
    await mongoose.connect(CONNECTION_STRING)
    console.log('✅ Connected to database')

    // Find all orders that still have a legacy modelId field
    const ordersToMigrate = await dbContext.Orders.find({
      modelId: { $exists: true, $ne: null }
    }).lean()

    if (ordersToMigrate.length === 0) {
      console.log('✅ No orders to migrate. All orders already use the junction table.')
      return
    }

    // Create backup collection BEFORE starting migration
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupCollectionName = `orders_backup_pre_migration_${timestamp}`
    console.log(`\n📦 Creating backup collection: ${backupCollectionName}...`)

    try {
      const backupCollection = mongoose.connection.collection(backupCollectionName)
      const backupResult = await backupCollection.insertMany(ordersToMigrate)
      console.log(`✅ Backup created with ${backupResult.insertedIds.length} orders`)
      console.log(`   To restore: db.${backupCollectionName}.find() or copy data back to 'orders'`)
    } catch (backupErr) {
      console.error(`❌ Failed to create backup: ${backupErr.message}`)
      console.error('   Aborting migration to prevent data loss.')
      process.exit(1)
    }

    console.log(`\n🔄 Starting migration of ${ordersToMigrate.length} orders...`)

    let created = 0
    let skipped = 0

    for (const order of ordersToMigrate) {
      try {
        // Use upsert so the script is safe to re-run
        await dbContext.ModelOrders.updateOne(
          { orderId: order._id, modelId: order.modelId },
          {
            $setOnInsert: {
              orderId: order._id,
              modelId: order.modelId,
              price: order.price ?? 0,
              position: 0,
            }
          },
          { upsert: true }
        )
        created++
      } catch (err) {
        console.warn(`  ⚠️  Skipped order ${order._id}: ${err.message}`)
        skipped++
      }

      if (created % 100 === 0 && created > 0) {
        console.log(`  ↳ Progress: ${created}/${ordersToMigrate.length}`)
      }
    }

    // Strip the legacy modelId field from all orders
    const unsetResult = await dbContext.Orders.updateMany(
      { modelId: { $exists: true } },
      { $unset: { modelId: '' } }
    )

    console.log(`\n✅ Migration complete!`)
    console.log(`   ModelOrder entries created : ${created}`)
    console.log(`   Entries skipped (errors)   : ${skipped}`)
    console.log(`   Orders updated ($unset)    : ${unsetResult.modifiedCount}`)
    console.log(`\n📦 Backup preserved as: ${backupCollectionName}`)
    console.log(`   If you need to restore, the backup is available in MongoDB.`)
    console.log(`   Contact your DB admin to restore if needed.`)

  } catch (err) {
    console.error('❌ Migration failed:', err)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('Connection closed.')
  }
}

migrate()
