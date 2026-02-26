const DIRECT_DATABASE_URL = process.env.DIRECT_DATABASE_URL || 'postgres://326f8a42d37fe3cea03ec2fb0b3844d52f7efacf7bca79d5f887562dfd4da554:sk_FKnU1tkejNr7ySnVaF1Et@db.prisma.io:5432/postgres?sslmode=require'

async function main() {
  try {
    console.log('Connecting to database...')
    console.log('Database URL:', DIRECT_DATABASE_URL.replace(/:[^:@]+@/, ':****@'))
    
    // Use node-postgres for direct connection
    const { Client } = await import('pg')
    const client = new Client({
      connectionString: DIRECT_DATABASE_URL,
    })
    
    await client.connect()
    console.log('Connected successfully')
    
    console.log('Dropping votes table...')
    await client.query('DROP TABLE IF EXISTS votes;')
    
    console.log('✅ Successfully dropped votes table')
    
    await client.end()
  } catch (error) {
    console.error('❌ Error dropping votes table:', error)
    throw error
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
