import { getPayload } from 'payload'
import config from '../payload.config'

async function createTestUser() {
  const payload = await getPayload({ config })
  
  try {
    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'test@test.com',
        },
      },
    })
    
    if (existingUsers.docs.length > 0) {
      console.log('Test user already exists')
      return
    }
    
    // Create test user
    await payload.create({
      collection: 'users',
      data: {
        email: 'test@test.com',
        password: 'test',
        name: 'test',
      },
    })
    console.log('Test user created successfully')
    
    // Create sample categories
    const category1 = await payload.create({
      collection: 'categories',
      data: {
        title: 'Technology',
        slug: 'technology',
        content: {
          root: {
            children: [{ 
              children: [{ text: 'Technology related posts' }], 
              type: 'paragraph',
              version: 1,
              format: '',
              indent: 0,
              direction: 'ltr'
            }],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        owner: (await payload.find({ collection: 'users', where: { email: { equals: 'test@test.com' } } })).docs[0].id,
      },
    })
    
    const category2 = await payload.create({
      collection: 'categories',
      data: {
        title: 'Crypto',
        slug: 'crypto',
        content: {
          root: {
            children: [{ 
              children: [{ text: 'Cryptocurrency and blockchain posts' }], 
              type: 'paragraph',
              version: 1,
              format: '',
              indent: 0,
              direction: 'ltr'
            }],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        owner: (await payload.find({ collection: 'users', where: { email: { equals: 'test@test.com' } } })).docs[0].id,
      },
    })
    
    console.log('Sample categories created successfully')
    
  } catch (error) {
    console.error('Error creating test user:', error)
  }
  
  process.exit(0)
}

createTestUser()