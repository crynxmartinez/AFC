import 'dotenv/config'

export const datasource = {
  url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
}

export default {
  datasource,
}
