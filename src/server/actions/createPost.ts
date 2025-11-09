'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { cookies } from 'next/headers'

export async function createPost(data: {
  title: string
  slug: string
  content: any
  categories: string[]
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')
  if (!token) return { success: false, error: 'Not authenticated' }
  
  const payload = await getPayload({ config })
  
  try {
    // Get current user from token
    const headers = new Headers()
    headers.set('cookie', `payload-token=${token.value}`)
    const { user } = await payload.auth({
      headers,
    })
    
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    
    const post = await payload.create({
      collection: 'posts',
      data: {
        ...data,
        owner: user.id,
      },
    })
    
    return { success: true, post }
  } catch (error) {
    console.error('Create post error:', error)
    return { success: false, error: 'Failed to create post' }
  }
}