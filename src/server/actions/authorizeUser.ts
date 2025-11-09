'use server'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function authorizeUser(email: string, password: string) {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

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
        sameSite: 'lax',
        path: '/',
      })

      return {
        success: true,
        user: result.user,
      }
    }

    return {
      success: false,
      error: 'Invalid credentials',
    }
  } catch (error) {
    console.error('Authorization error:', error)
    return {
      success: false,
      error: 'Invalid email or password',
    }
  }
}