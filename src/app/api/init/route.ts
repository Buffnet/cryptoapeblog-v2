import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    
    // Check if test user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'test@test.com',
        },
      },
    })
    
    if (existingUsers.docs.length > 0) {
      return NextResponse.json({ 
        message: 'Test user already exists',
        email: 'test@test.com'
      })
    }
    
    // Create test user
    const testUser = await payload.create({
      collection: 'users',
      data: {
        email: 'test@test.com',
        password: 'test',
        name: 'test',
      },
    })
    
    // Create sample categories
    await payload.create({
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
        owner: testUser.id,
      },
    })
    
    await payload.create({
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
        owner: testUser.id,
      },
    })
    
    return NextResponse.json({ 
      message: 'Test user and categories created successfully',
      email: 'test@test.com',
      password: 'test',
      categories: ['Technology', 'Crypto']
    })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Failed to initialize' }, { status: 500 })
  }
}