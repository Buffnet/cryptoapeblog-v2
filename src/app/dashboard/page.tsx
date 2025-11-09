'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        loadData()
      } else {
        router.push('/')
      }
    } catch (error) {
      router.push('/')
    }
  }

  const loadData = async () => {
    try {
      // Load all data
      const [postsRes, categoriesRes, usersRes] = await Promise.all([
        fetch('/api/posts?limit=100&depth=1'),
        fetch('/api/categories?limit=100'),
        fetch('/api/users?limit=100')
      ])

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setPosts(postsData.docs || [])
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.docs || [])
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.docs || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const createCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.get('title'),
          slug: formData.get('title')?.toString().toLowerCase().replace(/\s+/g, '-'),
          owner: user?.id,
        }),
      })

      if (res.ok) {
        const newCategory = await res.json()
        setCategories([...categories, newCategory.doc])
        e.currentTarget.reset()
      }
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const logout = () => {
    document.cookie = 'payload-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span>Welcome, {user?.email}</span>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b mb-6">
          <nav className="-mb-px flex gap-4">
            {['overview', 'posts', 'categories', 'users'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900">Total Posts</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{posts.length}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900">Total Categories</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{categories.length}</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900">Total Users</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">{users.length}</p>
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Manage Posts</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categories
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{post.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {post.categories?.map((c: any) => c?.title).filter(Boolean).join(', ') || 'None'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {typeof post.owner === 'object' ? post.owner?.email : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => deletePost(post.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>
              
              {/* Add Category Form */}
              <form onSubmit={createCategory} className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">Add New Category</h3>
                <div className="flex gap-2">
                  <input
                    name="title"
                    type="text"
                    placeholder="Category Title"
                    className="flex-1 px-3 py-2 border rounded"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Category
                  </button>
                </div>
              </form>

              {/* Categories List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{category.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{category.slug}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => deleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Display Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.displayName || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}