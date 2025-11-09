import { getPosts } from '@/server/actions/getPosts'

export default async function PostsList() {
  const result = await getPosts()
  const posts = result.posts || []

  if (posts.length === 0) {
    return (
      <p className="text-gray-500">No posts yet. Create your first post!</p>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <div key={post.id} className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
          <p className="text-sm text-gray-500 mb-2">/{post.slug}</p>
          
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {post.categories.map((category: any) => (
                <span
                  key={typeof category === 'string' ? category : category.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {typeof category === 'string' ? category : category.title}
                </span>
              ))}
            </div>
          )}
          
          <div className="text-gray-700">
            {post.content?.root?.children?.[0]?.children?.[0]?.text || 'No content'}
          </div>
          
          {post.owner && (
            <p className="text-sm text-gray-500 mt-2">
              Author: {typeof post.owner === 'string' ? post.owner : post.owner.email}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}