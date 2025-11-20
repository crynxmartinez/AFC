# VS Code Setup Instructions

## Disable CSS Linting Warnings for Tailwind

The project uses Tailwind CSS which includes special directives (`@tailwind`, `@apply`, etc.) that VS Code's built-in CSS linter doesn't recognize. This causes harmless warnings in the Problems tab.

### To Disable These Warnings:

**Option 1: Disable CSS Validation (Recommended)**
1. Open VS Code Settings: `File > Preferences > Settings` (or `Ctrl+,`)
2. Search for: `css.validate`
3. Uncheck the box for "CSS: Validate"
4. Restart VS Code

**Option 2: Add to User Settings**
1. Open Command Palette: `Ctrl+Shift+P`
2. Type: `Preferences: Open User Settings (JSON)`
3. Add this line:
```json
{
  "css.validate": false
}
```
4. Save and restart VS Code

**Option 3: Workspace Settings (Local Only)**
1. Create `.vscode/settings.json` in project root
2. Add:
```json
{
  "css.validate": false
}
```
3. Note: This file is gitignored, so each developer needs to create it

### Why These Warnings Appear:

- `@tailwind` - Tailwind's directive to inject base/components/utilities
- `@apply` - Tailwind's directive to apply utility classes in CSS
- `@layer` - Tailwind's directive for organizing styles

These are **valid Tailwind CSS directives** and work perfectly. The warnings are just VS Code's CSS linter not recognizing them.

### Alternative: Install Tailwind CSS IntelliSense Extension

Install the official Tailwind CSS IntelliSense extension:
- Extension ID: `bradlc.vscode-tailwindcss`
- This provides better Tailwind support and reduces warnings

## Current Status

✅ Theme system is working
✅ Build succeeds without errors
✅ Code runs perfectly
⚠️ CSS linter warnings are cosmetic only
