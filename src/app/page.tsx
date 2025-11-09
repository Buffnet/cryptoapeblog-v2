 'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchPosts()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.docs || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts?depth=1')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.docs || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        // Set cookie for dashboard access
        document.cookie = `payload-token=${data.token}; path=/; max-age=86400`
      } else {
        alert('Invalid credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const selectedCategories = formData.getAll('categories')
    
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.get('title'),
          slug: formData.get('title')?.toString().toLowerCase().replace(/\s+/g, '-'),
          content: {
            root: {
              children: [{
                children: [{
                  text: formData.get('content')
                }]
              }]
            }
          },
          categories: selectedCategories,
          owner: user?.id,
        }),
      })

      if (res.ok) {
        e.currentTarget.reset()
        await fetchPosts()
        alert('Post created successfully!')
      } else {
        alert('Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">CryptoApe Blog</h1>
      
      {!user && (
        <form onSubmit={handleLogin} className="space-y-3 border p-4 rounded">
          <h2 className="text-xl font-semibold">Login</h2>
          <input 
            name="email" 
            type="email"
            defaultValue="test@test.com" 
            placeholder="Email" 
            className="border p-2 w-full rounded" 
            required
          />
          <input 
            type="password" 
            name="password" 
            defaultValue="test" 
            placeholder="Password" 
            className="border p-2 w-full rounded" 
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      )}

      {user && (
        <div className="p-4 border rounded flex justify-between items-center">
          <div>Hello, <b>{user.displayName || user.email}</b></div>
          <a 
            href="/dashboard" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Admin Dashboard
          </a>
        </div>
      )}

      {user && (
        <form onSubmit={handleCreatePost} className="space-y-3 border p-4 rounded">
          <h2 className="text-xl font-semibold">Create Post</h2>
          <input 
            name="title" 
            className="border p-2 w-full rounded" 
            placeholder="Title" 
            required 
          />
          <textarea 
            name="content" 
            className="border p-2 w-full rounded" 
            placeholder="Content" 
            rows={4}
          />
          <div>
            <label className="block mb-2">Categories</label>
            <div className="flex gap-3 flex-wrap">
              {categories.map(c => (
                <label key={c.id} className="flex items-center gap-1">
                  <input type="checkbox" name="categories" value={c.id} />
                  <span>{c.title}</span>
                </label>
              ))}
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Submit'}
          </button>
        </form>
      )}

      <section>
        <h3 className="text-xl font-semibold mb-4">Posts</h3>
        {posts.length === 0 ? (
          <p>No posts yet</p>
        ) : (
          posts.map(p => (
            <article key={p.id} className="border p-3 rounded my-2">
              <div className="font-semibold">{p.title}</div>
              {p.categories?.length > 0 && (
                <div className="text-sm text-gray-600">
                  Categories: {p.categories.map((c: any) => c?.title).filter(Boolean).join(', ')}
                </div>
              )}
              <div className="mt-2">
                {p.content?.root?.children?.[0]?.children?.[0]?.text || 'No content'}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  )
}