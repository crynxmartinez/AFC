# Supabase Email Template Variables

## Available Variables

These are the dynamic variables you can use in Supabase email templates:

### **{{ .ConfirmationURL }}**
- **Used in:** Confirm signup, Magic link, Reset password
- **Description:** The confirmation/action link
- **Example:** `https://afc-kappa.vercel.app/auth/confirm?token=...`

### **{{ .Email }}**
- **Used in:** All templates
- **Description:** The user's email address
- **Example:** `user@example.com`

### **{{ .SiteURL }}**
- **Used in:** All templates
- **Description:** Your site's base URL
- **Example:** `https://afc-kappa.vercel.app`
- **Note:** Set in Supabase Project Settings → Auth → Site URL

### **{{ .Token }}**
- **Used in:** Advanced use cases
- **Description:** The raw token (rarely needed)
- **Example:** `abc123def456...`

### **{{ .TokenHash }}**
- **Used in:** Advanced use cases
- **Description:** Hashed version of token
- **Example:** `hash123...`

---

## How to Use in Templates

### **Basic Link:**
```html
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

### **Styled Button:**
```html
<a href="{{ .ConfirmationURL }}" 
   style="padding: 16px 40px; background: #FF6B35; color: #ffffff; text-decoration: none; border-radius: 8px;">
   Confirm Your Email
</a>
```

### **Show User Email:**
```html
<p>Account email: <strong>{{ .Email }}</strong></p>
```

### **Link to Site:**
```html
<a href="{{ .SiteURL }}">Visit Arena for Creatives</a>
```

### **Alternative Link (Fallback):**
```html
<p>Button not working? Copy this link:</p>
<p>{{ .ConfirmationURL }}</p>
```

---

## Template Types & Their Variables

### **Confirm Signup:**
- ✅ `{{ .ConfirmationURL }}` - Confirmation link
- ✅ `{{ .Email }}` - User's email
- ✅ `{{ .SiteURL }}` - Your site URL

### **Reset Password:**
- ✅ `{{ .ConfirmationURL }}` - Password reset link
- ✅ `{{ .Email }}` - User's email
- ✅ `{{ .SiteURL }}` - Your site URL

### **Magic Link:**
- ✅ `{{ .ConfirmationURL }}` - Magic link
- ✅ `{{ .Email }}` - User's email
- ✅ `{{ .SiteURL }}` - Your site URL

### **Change Email:**
- ✅ `{{ .ConfirmationURL }}` - Email change confirmation
- ✅ `{{ .Email }}` - New email address
- ✅ `{{ .SiteURL }}` - Your site URL

---

## Important Notes

1. **Always include {{ .ConfirmationURL }}** - This is the action link users need to click
2. **Test with real signup** - Variables only populate when actually sent
3. **Fallback link** - Always provide the raw URL as backup
4. **Expiry time** - Mention link expiration (24 hours for signup, 1 hour for password reset)

---

## Example Usage in Our Templates

### **Confirm Signup Template:**
```html
<p>Account email: <strong style="color: #FF6B35;">{{ .Email }}</strong></p>

<a href="{{ .ConfirmationURL }}" 
   style="display: inline-block; padding: 16px 40px; background: #FF6B35;">
   Confirm Your Email
</a>

<p>Button not working? Copy this link:</p>
<a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a>

<p>Need help? Visit <a href="{{ .SiteURL }}">{{ .SiteURL }}</a></p>
```

---

## Testing

To test variables:
1. Sign up with a test email
2. Check inbox
3. Verify all variables populated correctly
4. Click links to ensure they work

Variables will show as `{{ .VariableName }}` in the editor, but will be replaced with actual values when emails are sent.
