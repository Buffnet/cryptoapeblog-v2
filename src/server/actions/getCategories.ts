'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function getCategories() {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
    })

    return {
      success: true,
      categories: categories.docs,
    }
  } catch (error) {
    console.error('Get categories error:', error)
    return {
      success: false,
      error: 'Failed to fetch categories',
      categories: [],
    }
  }
}