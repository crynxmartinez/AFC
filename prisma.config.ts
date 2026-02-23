import 'dotenv/config'

export const datasource = {
  url: process.env.DIRECT_DATABASE_URL || 'postgres://326f8a42d37fe3cea03ec2fb0b3844d52f7efacf7bca79d5f887562dfd4da554:sk_FKnU1tkejNr7ySnVaF1Et@db.prisma.io:5432/postgres?sslmode=require',
}

export default {
  datasource,
}
