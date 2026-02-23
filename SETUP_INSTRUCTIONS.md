# Prisma Setup Instructions for AFC

## ✅ What's Been Completed

1. ✅ Installed Prisma dependencies
2. ✅ Created complete Prisma schema with all 21 tables
3. ✅ Created Prisma configuration file
4. ✅ Created database seed file
5. ✅ Updated `.env.example` with new environment variables
6. ✅ Created `.env.vercel` for Vercel deployment
7. ✅ Created Prisma client initialization with Accelerate extension
8. ✅ Added Prisma scripts to `package.json`

## 🚀 Next Steps - Do These Now

### 1. Create Your Local `.env` File

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Then edit `.env` and add your actual values:
```env
# You'll need to get your Accelerate API key from Prisma
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_ACCELERATE_API_KEY"

# This is your direct connection (already provided)
DIRECT_DATABASE_URL="postgres://326f8a42d37fe3cea03ec2fb0b3844d52f7efacf7bca79d5f887562dfd4da554:sk_FKnU1tkejNr7ySnVaF1Et@db.prisma.io:5432/postgres?sslmode=require"

# Generate a secret key:
# Run: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"

NEXTAUTH_URL="http://localhost:5173"

# Get these from Cloudinary (sign up at cloudinary.com)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Email service (optional for now)
EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
EMAIL_FROM="noreply@arenafc.com"

VITE_API_URL="http://localhost:5173/api"
```

### 2. Get Your Prisma Accelerate API Key

1. Go to https://console.prisma.io/
2. Sign in with your Prisma account
3. Find your project or create a new one
4. Go to "Accelerate" section
5. Copy your API key
6. Update `DATABASE_URL` in your `.env` file

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

This will:
- Generate the Prisma Client with TypeScript types
- Fix the lint errors you're seeing
- Create the `@prisma/client` module

### 4. Push Schema to Database

```bash
npm run prisma:push
```

This will:
- Create all 21 tables in your database
- Set up all relationships and indexes
- **Note:** This is for initial setup. Later use `prisma:migrate` for production

### 5. Seed the Database

```bash
npm run prisma:seed
```

This will populate:
- 100 level configurations
- 10 XP reward types
- 5 level reward milestones

### 6. Verify Everything Works

```bash
npm run prisma:studio
```

This opens Prisma Studio in your browser where you can:
- View all tables
- See the seeded data
- Manually add test data if needed

## 📦 Vercel Deployment Setup

### Environment Variables to Add in Vercel

Go to your Vercel project → Settings → Environment Variables

Add these variables (use values from `.env.vercel`):

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `prisma://accelerate.prisma-data.net/?api_key=YOUR_KEY` | Production, Preview, Development |
| `DIRECT_DATABASE_URL` | Your direct Postgres connection | Production, Preview |
| `NEXTAUTH_SECRET` | Generated secret (use `openssl rand -base64 32`) | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://your-preview-url.vercel.app` | Preview |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Production, Preview, Development |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | Production, Preview, Development |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Production, Preview, Development |
| `EMAIL_SERVER` | Your SMTP server | Production, Preview |
| `EMAIL_FROM` | Your from email | Production, Preview |
| `VITE_API_URL` | `https://your-domain.vercel.app/api` | Production |

### Vercel Build Settings

Make sure your Vercel project has these settings:

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```bash
npm install
```

The `postinstall` script will automatically run `prisma generate` after dependencies are installed.

## 🔧 Useful Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema changes to database (development)
npm run prisma:push

# Create a migration (production-ready)
npm run prisma:migrate

# Seed the database
npm run prisma:seed

# Open Prisma Studio (database GUI)
npm run prisma:studio

# View database schema
npx prisma db pull

# Format schema file
npx prisma format
```

## 📝 Important Notes

1. **Lint Errors:** The `PrismaClient` import errors will disappear after running `npm run prisma:generate`

2. **Database Migrations:** 
   - Use `prisma:push` for development (quick schema updates)
   - Use `prisma:migrate` for production (creates migration history)

3. **Prisma Accelerate Benefits:**
   - Connection pooling (handles many concurrent requests)
   - Query caching (faster repeated queries)
   - Global edge caching

4. **Next Migration Steps:**
   - Create API routes in `/api` directory
   - Replace Supabase calls with Prisma queries
   - Set up NextAuth.js for authentication
   - Set up Cloudinary for file uploads

## 🐛 Troubleshooting

**Error: "Can't reach database server"**
- Check your `DIRECT_DATABASE_URL` is correct
- Ensure your IP is whitelisted in Prisma console

**Error: "Invalid API key"**
- Verify your Accelerate API key in `DATABASE_URL`
- Make sure you're using the Accelerate connection string format

**Lint errors persist after generate:**
- Restart your TypeScript server in VS Code
- Close and reopen the file
- Run `npm run prisma:generate` again

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Accelerate Guide](https://www.prisma.io/docs/accelerate)
- [Migration Plan](./MIGRATION_PLAN.md) - Full migration strategy
