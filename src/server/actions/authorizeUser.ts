'use server'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function authorizeUser(email: string, password: string) {
  const payload = await getPayload({ config })
  
  try {
    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })
    
    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('payload-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
      return { success: true, user: result.user }
    }
    return { success: false, error: 'Login failed' }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Invalid credentials' }
  }
}