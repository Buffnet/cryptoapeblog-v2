'use server'

import { cookies } from 'next/headers'

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')

    if (!token) {
      return null
    }

    // For now, just return a simple object to indicate user is logged in
    // We can enhance this later to actually fetch user details
    return { 
      email: 'test@test.com',
      id: token.value 
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}