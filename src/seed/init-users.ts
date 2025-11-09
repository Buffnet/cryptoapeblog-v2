import { getPayload } from 'payload'
import config from '../../payload.config'

async function seedUsers() {
  const payload = await getPayload({
    config,
  })

  try {
    // Check if users exist
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.docs.length > 0) {
      console.log('Users already exist, skipping seed')
      return
    }

    // Create admin user
    const admin = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@test.com',
        password: 'admin123',
        displayName: 'Admin User',
      },
    })

    console.log('Created admin user:', admin.email)

    // Create test user
    const testUser = await payload.create({
      collection: 'users',
      data: {
        email: 'test@test.com',
        password: 'test',
        displayName: 'Test User',
      },
    })

    console.log('Created test user:', testUser.email)

    // Create some categories
    const categories = [
      { title: 'Technology', slug: 'technology' },
      { title: 'Crypto', slug: 'crypto' },
      { title: 'Web3', slug: 'web3' },
    ]

    for (const cat of categories) {
      await payload.create({
        collection: 'categories',
        data: {
          ...cat,
          owner: admin.id,
        },
      })
      console.log('Created category:', cat.title)
    }

    console.log('✅ Seed completed successfully!')
    console.log('You can now login with:')
    console.log('Admin: admin@test.com / admin123')
    console.log('Test: test@test.com / test')
    
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    process.exit(0)
  }
}

seedUsers()