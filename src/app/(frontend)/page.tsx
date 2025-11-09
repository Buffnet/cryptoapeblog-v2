import { getCurrentUser } from '@/server/actions/getCurrentUser'
import { redirect } from 'next/navigation'
import PostForm from '@/components/PostForm'
import PostsList from '@/components/PostsList'
import LogoutButton from '@/components/LogoutButton'

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Hello, {user.email}!
            </h1>
            <LogoutButton />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create Post
          </h2>
          <PostForm />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Posts
          </h2>
          <PostsList />
        </div>
      </div>
    </div>
  )
}