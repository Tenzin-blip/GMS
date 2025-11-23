// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Home } from './globals/Home'
import { Navbar } from './globals/Navbar'
import { Reviews } from './globals/Reviews'
import { UserFitness } from './collections/UserFitness'
import { Attendance } from './collections/Attendance'
import { GymCounts } from './collections/GymCount'
import { Notices } from './collections/Notices'
import { Subscription } from './collections/Subscription'
import { Transaction } from './collections/Transaction'
import { Payments } from './collections/Payments'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    UserFitness,
    Attendance,
    GymCounts,
    Notices,
    Subscription,
    Transaction,
    Payments,
  ],
  globals: [Home, Navbar, Reviews],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
