# 📧 Email Branding Setup Guide

## Step-by-Step Instructions

### 1. Access Supabase Email Templates

1. Go to: https://supabase.com/dashboard
2. Select your **AFC** project
3. Click **Authentication** (left sidebar)
4. Click **Email Templates**

---

### 2. Configure Email Settings

#### **A. Sender Email (Important!)**

1. In Email Templates, look for **"Sender email"** or **"From email"**
2. Change from: `noreply@mail.app.supabase.io`
3. To: `noreply@afc-kappa.vercel.app` or your custom domain

**Note:** If using custom domain, you need to:
- Verify domain ownership
- Add SPF/DKIM records
- For now, you can use: `Arena for Creatives <noreply@mail.app.supabase.io>`

#### **B. Sender Name**

Change from: `Supabase`
To: `Arena for Creatives`

---

### 3. Update Email Templates

#### **Template 1: Confirm Signup** (Most Important)

1. Click **"Confirm signup"** template
2. Copy the content from: `/email-templates/confirm-signup.html`
3. Paste into the template editor
4. Click **Save**

**Variables available:**
- `{{ .ConfirmationURL }}` - Confirmation link
- `{{ .Email }}` - User's email
- `{{ .SiteURL }}` - Your site URL

---

#### **Template 2: Reset Password**

1. Click **"Reset password"** template
2. Copy the content from: `/email-templates/reset-password.html`
3. Paste into the template editor
4. Click **Save**

---

#### **Template 3: Magic Link** (Optional)

If you use magic link login, customize this too.

---

### 4. Test the Emails

#### **Test Signup Email:**

1. Go to your site: https://afc-kappa.vercel.app
2. Sign up with a test email
3. Check your inbox
4. Should see branded email! ✅

#### **Test Reset Password:**

1. Go to login page
2. Click "Forgot Password"
3. Enter email
4. Check inbox
5. Should see branded email! ✅

---

### 5. Email Design Features

Your branded emails include:

✅ **Professional Header**
- Orange gradient background
- AFC logo/name
- Tagline

✅ **Clear CTA Button**
- Big, orange gradient button
- Easy to click
- Mobile-friendly

✅ **Dark Theme**
- Matches your app design
- Professional look
- Easy on the eyes

✅ **Security Info**
- Expiration notice
- Alternative link
- Safety tips

✅ **Footer**
- Copyright
- Website link
- Help center link

---

### 6. Advanced: Custom Domain Email (Optional)

For production, you should use a custom domain email:

#### **Option A: Use Your Domain**

If you have `arenafor creatives.com`:

1. **Set up email service:**
   - Use SendGrid, Mailgun, or AWS SES
   - Verify domain
   - Add DNS records

2. **Configure Supabase:**
   - Go to Project Settings → Auth
   - Enable "Custom SMTP"
   - Add SMTP credentials

3. **Update sender:**
   - From: `noreply@arenaforcreatives.com`
   - Name: `Arena for Creatives`

#### **Option B: Keep Supabase Email (Easier)**

For soft launch, it's fine to use:
- From: `Arena for Creatives <noreply@mail.app.supabase.io>`
- Emails will be branded
- Just the sender domain is Supabase

---

### 7. Email Deliverability Tips

To avoid spam folder:

✅ **Add SPF Record** (if using custom domain)
```
v=spf1 include:_spf.supabase.io ~all
```

✅ **Add DKIM** (Supabase handles this)

✅ **Warm up domain** (send gradually)

✅ **Test with multiple providers:**
- Gmail
- Outlook
- Yahoo
- ProtonMail

---

### 8. Monitoring

Check email delivery:

1. Go to Supabase Dashboard
2. Click **Logs** → **Auth Logs**
3. Filter by "email"
4. See delivery status

---

## Quick Checklist

- [ ] Change sender name to "Arena for Creatives"
- [ ] Update "Confirm signup" template
- [ ] Update "Reset password" template
- [ ] Test signup email
- [ ] Test reset password email
- [ ] Check spam folder
- [ ] Verify links work
- [ ] Test on mobile
- [ ] Test on different email clients

---

## Troubleshooting

### **Emails not sending?**
- Check Supabase logs
- Verify email service is enabled
- Check spam folder

### **Links not working?**
- Verify `{{ .ConfirmationURL }}` is in template
- Check site URL in Supabase settings

### **Emails look broken?**
- Some email clients don't support CSS
- Test in Gmail (best support)
- Keep design simple

---

## Result

After setup, users will receive:
✅ Professional, branded emails
✅ Clear call-to-action
✅ Security information
✅ Mobile-friendly design
✅ Matches your app's look

No more generic Supabase emails! 🎉
