# Quick Start: Image Uploads with Cloudinary (FREE)

## Why Cloudinary Instead of Firebase Storage?

Firebase Storage requires upgrading to the **Blaze (paid) plan**, even though it has a free tier. Cloudinary offers a generous **completely free tier** with no credit card required:

| Feature | Cloudinary Free | Firebase Storage (Blaze) |
|---------|----------------|--------------------------|
| Cost | 100% Free | Requires paid plan |
| Storage | 25 GB | 5 GB free tier |
| Bandwidth | 25 GB/month | 1 GB/day |
| Setup | No credit card | Credit card required |
| Transformations | ✅ Automatic | ❌ Manual |

---

## Setup in 5 Minutes

### 1. Create Cloudinary Account (2 min)
```
1. Go to: https://cloudinary.com/users/register/free
2. Sign up with email or Google
3. Verify your email
4. You're in! 🎉
```

### 2. Get Your Cloud Name (1 min)
```
1. On the Cloudinary Dashboard
2. Look for "Account Details" section
3. Copy your "Cloud Name" (e.g., dxxxxxxxxx)
```

### 3. Create Upload Preset (1 min)
```
1. Click Settings (gear icon)
2. Go to Upload tab
3. Scroll to "Upload presets"
4. Click "Add upload preset"
5. Set:
   - Preset name: intentional-meals
   - Signing Mode: Unsigned ⚠️ Important!
   - Folder: intentional/meals
6. Save
```

### 4. Update Your .env File (1 min)
```env
VITE_CLOUDINARY_CLOUD_NAME=dxxxxxxxxx  # Your cloud name from step 2
VITE_CLOUDINARY_UPLOAD_PRESET=intentional-meals
VITE_CLOUDINARY_PROFILE_PRESET=intentional-profiles
VITE_CLOUDINARY_POST_PRESET=intentional-posts
```

### 5. Test It!
```bash
pnpm dev
```

Go to "Log Meal" and upload a photo. Done! 🚀

---

## What Gets Uploaded Where?

Images are automatically organized:
```
intentional/
├── meals/
│   └── {your-user-id}/
│       └── meal-photos.jpg
├── profiles/
│   └── profile-picture.jpg
└── posts/
    └── {your-user-id}/
        └── community-photos.jpg
```

---

## Need Help?

Full documentation: See `CLOUDINARY_SETUP.md`

Common issues:
- **"Invalid upload preset"**: Make sure preset is set to "Unsigned"
- **"Upload failed"**: Check your Cloud Name in .env
- **"File too large"**: Max 10MB per image

---

## Free Tier Limits

✅ 25 GB storage
✅ 25 GB bandwidth/month  
✅ 25,000 transformations/month
✅ Automatic image optimization
✅ Global CDN delivery

**Perfect for**: Personal projects, MVPs, small apps (you'll be fine!)

---

## Alternative: Skip Image Uploads

If you don't want to set up Cloudinary right now, you can use the app without images:
- Journal entries work without photos
- Water tracking doesn't need images
- Progress tracking is text-based

Add images later when you're ready!

---

**That's it!** 5 minutes and you have free, unlimited image uploads. 🎉
