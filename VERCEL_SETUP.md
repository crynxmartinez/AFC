# Vercel Environment Variables - Ready to Deploy

## 🚀 Add These to Vercel Now

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Copy and paste each variable below:

---

### Database Configuration

**Variable Name:** `DIRECT_DATABASE_URL`  
**Value:**
```
postgres://326f8a42d37fe3cea03ec2fb0b3844d52f7efacf7bca79d5f887562dfd4da554:sk_FKnU1tkejNr7ySnVaF1Et@db.prisma.io:5432/postgres?sslmode=require
```
**Environments:** Production, Preview, Development

---

**Variable Name:** `DATABASE_URL`  
**Value:**
```
prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMzI2ZjhhNDJkMzdmZTNjZWEwM2VjMmZiMGIzODQ0ZDUyZjdlZmFjZjdiY2E3OWQ1Zjg4NzU2MmRmZDRkYTU1NCIsInRlbmFudF9pZCI6ImRiLnByaXNtYS5pbyIsImludGVybmFsX3NlY3JldCI6InNrX0ZLblUxdGtlak5yN3lTblZhRjFFdCJ9.signature
```
**Environments:** Production, Preview, Development

**Note:** You need to get your actual Accelerate API key from https://console.prisma.io/

---

### Authentication (NextAuth.js)

**Variable Name:** `NEXTAUTH_SECRET`  
**Value:** Generate using this command on your terminal:
```bash
openssl rand -base64 32
```
Then paste the output here.  
**Environments:** Production, Preview, Development

---

**Variable Name:** `NEXTAUTH_URL`  
**Value for Production:**
```
https://your-project-name.vercel.app
```
**Value for Preview:**
```
https://your-project-name-git-branch.vercel.app
```
**Environments:** Production (use your domain), Preview (use preview URL)

---

### File Storage (Cloudinary)

Sign up at https://cloudinary.com/ and get your credentials from the dashboard.

**Variable Name:** `CLOUDINARY_CLOUD_NAME`  
**Value:** (from Cloudinary dashboard)  
**Environments:** Production, Preview, Development

---

**Variable Name:** `CLOUDINARY_API_KEY`  
**Value:** (from Cloudinary dashboard)  
**Environments:** Production, Preview, Development

---

**Variable Name:** `CLOUDINARY_API_SECRET`  
**Value:** (from Cloudinary dashboard)  
**Environments:** Production, Preview, Development

---

### Email Service (Optional - for later)

**Variable Name:** `EMAIL_SERVER`  
**Value:**
```
smtp://username:password@smtp.gmail.com:587
```
(Update with your SMTP provider)  
**Environments:** Production, Preview

---

**Variable Name:** `EMAIL_FROM`  
**Value:**
```
noreply@arenafc.com
```
**Environments:** Production, Preview

---

### Frontend API URL

**Variable Name:** `VITE_API_URL`  
**Value for Production:**
```
https://your-project-name.vercel.app/api
```
**Value for Preview:**
```
https://your-project-name-git-branch.vercel.app/api
```
**Environments:** Production, Preview, Development

---

## ✅ Vercel Build Configuration

Make sure these settings are correct in Vercel:

**Framework Preset:** Vite  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

The `postinstall` script in package.json will automatically run `prisma generate` after npm install.

---

## 🔑 Getting Your Prisma Accelerate API Key

1. Go to https://console.prisma.io/
2. Sign in or create an account
3. Create a new project or select existing
4. Navigate to "Accelerate" section
5. Copy your API key
6. Update the `DATABASE_URL` variable in Vercel with the format:
   ```
   prisma://accelerate.prisma-data.net/?api_key=YOUR_ACTUAL_KEY_HERE
   ```

---

## 📋 Quick Checklist

- [ ] Added `DIRECT_DATABASE_URL` to Vercel
- [ ] Got Prisma Accelerate API key and added `DATABASE_URL` to Vercel
- [ ] Generated `NEXTAUTH_SECRET` and added to Vercel
- [ ] Set `NEXTAUTH_URL` with your actual domain
- [ ] Signed up for Cloudinary and added all 3 credentials
- [ ] Set `VITE_API_URL` with your Vercel domain
- [ ] Verified build settings in Vercel
- [ ] Deployed and tested

---

## 🚨 Important Notes

1. **Never commit these values to git** - they're secrets!
2. **Use different values for Production vs Preview** if needed
3. **The database is already set up** - you just need to add the connection strings
4. **Prisma will auto-generate on deploy** thanks to the postinstall script
5. **Test in Preview environment first** before promoting to Production

---

## 🐛 If Deployment Fails

Check Vercel build logs for:
- Missing environment variables
- Prisma generation errors
- TypeScript compilation errors

Common fixes:
- Ensure all required env vars are set
- Check that `DATABASE_URL` has valid Accelerate API key
- Verify `DIRECT_DATABASE_URL` connection works
