# 📧 Email Templates for Arena for Creatives

All email templates are branded with AFC's dark theme and orange accent colors.

---

## 📋 Available Templates

### ✅ 1. Confirm Signup
**File:** `confirm-signup.html`  
**Supabase Template:** "Confirm signup"  
**When sent:** User signs up for a new account  
**Variables:** `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}`  
**Expiry:** 24 hours

---

### ✅ 2. Reset Password
**File:** `reset-password.html`  
**Supabase Template:** "Reset password"  
**When sent:** User requests password reset  
**Variables:** `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}`  
**Expiry:** 1 hour

---

### ✅ 3. Magic Link
**File:** `magic-link.html`  
**Supabase Template:** "Magic Link"  
**When sent:** User requests passwordless login  
**Variables:** `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}`  
**Expiry:** 1 hour

---

### ✅ 4. Invite User
**File:** `invite-user.html`  
**Supabase Template:** "Invite user"  
**When sent:** Admin invites a new user  
**Variables:** `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}`  
**Expiry:** 7 days

---

### ✅ 5. Change Email Address
**File:** `change-email.html`  
**Supabase Template:** "Change Email Address"  
**When sent:** User changes their email  
**Variables:** `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}`  
**Expiry:** 24 hours

---

### ✅ 6. Reauthentication
**File:** `reauthentication.html`  
**Supabase Template:** "Reauthentication"  
**When sent:** User needs to verify identity for sensitive action  
**Variables:** `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}`  
**Expiry:** 15 minutes

---

## 🚀 How to Install

### Step 1: Access Supabase
1. Go to: https://supabase.com/dashboard
2. Select your AFC project
3. Click **Authentication** → **Email Templates**

### Step 2: Update Sender Info
- **Sender name:** `Arena for Creatives`
- **Sender email:** Keep default or use custom domain

### Step 3: Copy Each Template
For each template:
1. Open the `.html` file
2. Select all content (Ctrl+A)
3. Copy (Ctrl+C)
4. Go to corresponding Supabase template
5. Paste in "Message Body (HTML)"
6. Click **Save**

### Step 4: Test
- Sign up with test email
- Request password reset
- Check emails look branded ✅

---

## 🎨 Design Features

All templates include:
- ✅ **Dark theme** (#0a0a0a background, #1a1a1a cards)
- ✅ **Orange gradient header** (#FF6B35 to #FF8E53)
- ✅ **Professional typography** (System fonts)
- ✅ **Mobile responsive** (600px max width)
- ✅ **Clear CTA buttons** (Large, gradient, easy to click)
- ✅ **Security information** (Expiry times, safety tips)
- ✅ **Alternative links** (Fallback if button doesn't work)
- ✅ **Branded footer** (Copyright, links)

---

## 📊 Template Checklist

Use this to track your progress:

- [ ] Confirm Signup - Installed & Tested
- [ ] Reset Password - Installed & Tested
- [ ] Magic Link - Installed & Tested
- [ ] Invite User - Installed & Tested
- [ ] Change Email - Installed & Tested
- [ ] Reauthentication - Installed & Tested

---

## 🔧 Customization

### To change colors:
- **Orange:** `#FF6B35` and `#FF8E53`
- **Dark background:** `#0a0a0a`
- **Card background:** `#1a1a1a`
- **Text:** `#ffffff` (white), `#cccccc` (light gray)

### To add your logo:
Replace the emoji in the header:
```html
<h1>🎨 Arena for Creatives</h1>
```
With:
```html
<img src="YOUR_LOGO_URL" alt="Arena for Creatives" style="max-width: 200px;">
```

### To change links:
Update footer links:
```html
<a href="https://afc-kappa.vercel.app">Visit Website</a>
<a href="https://afc-kappa.vercel.app/help">Help Center</a>
```

---

## 📚 Resources

- **Variables Guide:** `SUPABASE_VARIABLES.md`
- **Setup Guide:** `../EMAIL_BRANDING_SETUP.md`
- **Supabase Docs:** https://supabase.com/docs/guides/auth/auth-email-templates

---

## ✅ All Done!

Once installed, your users will receive professional, branded emails that match your app's design! 🎉

Questions? Check the setup guide or Supabase documentation.
