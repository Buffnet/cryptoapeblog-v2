'use client'

import { logout } from '@/server/actions/logout'

export default function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      Logout
    </button>
  )
}
