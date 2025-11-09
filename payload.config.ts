import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Users } from './src/collections/Users'
import { Posts } from './src/collections/Posts'
import { Categories } from './src/collections/Categories'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Categories, Posts],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
})