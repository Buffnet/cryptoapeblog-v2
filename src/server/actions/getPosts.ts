'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function getPosts() {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const posts = await payload.find({
      collection: 'posts',
      depth: 2,
      limit: 100,
    })

    return {
      success: true,
      posts: posts.docs,
    }
  } catch (error) {
    console.error('Get posts error:', error)
    return {
      success: false,
      error: 'Failed to fetch posts',
      posts: [],
    }
  }
}