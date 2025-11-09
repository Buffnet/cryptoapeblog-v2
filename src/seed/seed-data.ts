import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function seedDatabase() {
  const payload = await getPayload({
    config: configPromise,
  })

  try {
    // Check if test user exists
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'test@test.com',
        },
      },
    })

    if (existingUser.docs.length === 0) {
      // Create test user
      const testUser = await payload.create({
        collection: 'users',
        data: {
          email: 'test@test.com',
          password: 'test',
        },
      })
      console.log('Test user created:', testUser.email)
    } else {
      console.log('Test user already exists')
    }

    // Create sample categories
    const categories = [
      { title: 'Technology', slug: 'technology' },
      { title: 'Design', slug: 'design' },
      { title: 'Development', slug: 'development' },
      { title: 'Marketing', slug: 'marketing' },
    ]

    const createdCategories = []
    for (const categoryData of categories) {
      const existing = await payload.find({
        collection: 'categories',
        where: {
          slug: {
            equals: categoryData.slug,
          },
        },
      })

      if (existing.docs.length === 0) {
        const category = await payload.create({
          collection: 'categories',
          data: {
            ...categoryData,
            content: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: `Content for ${categoryData.title} category`,
                        format: 0,
                      },
                    ],
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
            owner: existingUser.docs[0]?.id || (await payload.find({ collection: 'users' })).docs[0].id,
          },
        })
        createdCategories.push(category)
        console.log('Category created:', category.title)
      }
    }

    console.log('Seed completed successfully')
  } catch (error) {
    console.error('Seed error:', error)
  }
}

export default seedDatabase