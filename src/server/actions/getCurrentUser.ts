'use server'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')
  if (!token) return null
  
  const payload = await getPayload({ config })
  
  try {
    const headers = new Headers()
    headers.set('cookie', `payload-token=${token.value}`)
    const { user } = await payload.auth({
      headers,
    })
    
    return user
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}