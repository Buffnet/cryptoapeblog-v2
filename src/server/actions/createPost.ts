'use server'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function createPost(data: {
  title: string
  slug: string
  content: any
  categories?: string[]
}) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')

    if (!token) {
      return {
        success: false,
        error: 'You must be logged in to create a post',
      }
    }

    const payload = await getPayload({
      config: configPromise,
    })

    // For now, we'll use a simplified approach
    // In production, you'd want to properly validate the token
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'test@test.com',
        },
      },
    })

    const user = users.docs[0]
    if (!user) {
      return {
        success: false,
        error: 'Invalid authentication',
      }
    }

    const post = await payload.create({
      collection: 'posts',
      data: {
        ...data,
        owner: user.id,
      },
    })

    return {
      success: true,
      post,
    }
  } catch (error) {
    console.error('Create post error:', error)
    return {
      success: false,
      error: 'Failed to create post',
    }
  }
}