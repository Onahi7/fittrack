# Cloudinary Setup Guide

## Why Cloudinary?

Cloudinary is a free alternative to Firebase Storage with a generous free tier:
- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **No credit card required** for free tier
- **Automatic image optimization** and transformations
- **CDN delivery** for fast loading worldwide

---

## Step 1: Create Cloudinary Account

1. Go to [Cloudinary Sign Up](https://cloudinary.com/users/register/free)
2. Sign up with email or Google
3. Verify your email address
4. You'll be taken to your dashboard

---

## Step 2: Get Your Credentials

1. In your Cloudinary Dashboard, look for **"Account Details"** section
2. You'll see:
   - **Cloud Name**: `dxxxxxxxxx` (your unique cloud identifier)
   - **API Key**: `123456789012345`
   - **API Secret**: `xxxxxxxxxxxxxxxxxxxxx`

3. Note these values - you'll need them!

---

## Step 3: Create Upload Preset

Upload presets allow unsigned uploads from your frontend:

1. In Cloudinary Dashboard, go to **Settings** (gear icon)
2. Navigate to **Upload** tab
3. Scroll down to **Upload presets**
4. Click **"Add upload preset"**
5. Configure the preset:
   - **Preset name**: `intentional-meals` (or any name you prefer)
   - **Signing Mode**: Select **"Unsigned"**
   - **Folder**: Enter `intentional/meals`
   - **Format**: Leave as auto
   - **Resource type**: `Image`
   - **Allowed formats**: `jpg, png, webp, heic`
   - **Transformation**: Optional - add automatic optimization
     - **Quality**: `auto:good`
     - **Fetch Format**: `auto`
     - **Max dimensions**: 1920x1920 (to save storage)
6. Click **"Save"**

### Create Additional Presets (Optional)

For profile pictures:
- **Preset name**: `intentional-profiles`
- **Folder**: `intentional/profiles`
- **Transformation**: Crop to square, 500x500px

For community posts:
- **Preset name**: `intentional-posts`
- **Folder**: `intentional/posts`
- **Max dimensions**: 1920x1080

---

## Step 4: Update Environment Variables

Add your Cloudinary credentials to `.env`:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=intentional-meals
VITE_CLOUDINARY_PROFILE_PRESET=intentional-profiles
VITE_CLOUDINARY_POST_PRESET=intentional-posts
```

Replace `your_cloud_name_here` with your actual Cloud Name from Step 2.

---

## Step 5: Install Dependencies

Install the Cloudinary SDK:

```bash
pnpm add cloudinary-react
```

Or if you prefer vanilla JavaScript:

```bash
pnpm add cloudinary-core
```

---

## Step 6: Verify Setup

Your app is already configured to use Cloudinary! The integration has been added to:
- `src/lib/cloudinary.ts` - Upload functions
- `src/pages/LogMeal.tsx` - Meal photo uploads
- `src/pages/Profile.tsx` - Profile picture uploads

Test the upload:
1. Run your app: `pnpm dev`
2. Sign in and go to "Log Meal"
3. Try uploading a photo
4. Check your Cloudinary Dashboard → Media Library

---

## Usage Examples

### Upload Meal Photo
```typescript
import { uploadMealImage } from '@/lib/cloudinary';

const handleUpload = async (file: File) => {
  try {
    const imageUrl = await uploadMealImage(file);
    console.log('Uploaded:', imageUrl);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Upload Profile Picture
```typescript
import { uploadProfileImage } from '@/lib/cloudinary';

const handleProfileUpload = async (file: File) => {
  const imageUrl = await uploadProfileImage(file);
  // Save imageUrl to user profile
};
```

### Upload Community Post Image
```typescript
import { uploadPostImage } from '@/lib/cloudinary';

const imageUrl = await uploadPostImage(file);
```

---

## Image Transformations

Cloudinary automatically optimizes images! You can also request specific transformations:

### Get Thumbnail
```typescript
const thumbnailUrl = imageUrl.replace('/upload/', '/upload/w_200,h_200,c_fill/');
```

### Get Optimized Version
```typescript
const optimizedUrl = imageUrl.replace('/upload/', '/upload/q_auto,f_auto/');
```

### Responsive Images
```typescript
const smallUrl = imageUrl.replace('/upload/', '/upload/w_400/');
const mediumUrl = imageUrl.replace('/upload/', '/upload/w_800/');
const largeUrl = imageUrl.replace('/upload/', '/upload/w_1200/');
```

---

## Security & Best Practices

### 1. Unsigned Uploads
- Uses upload presets (already configured)
- No API secret exposed in frontend
- Safe for client-side uploads

### 2. File Size Limits
- Frontend: 10MB max (configured in upload functions)
- Cloudinary: Can set limits in dashboard

### 3. Folder Organization
```
intentional/
├── meals/
│   └── {userId}/
│       └── {imageId}.jpg
├── profiles/
│   └── {userId}.jpg
└── posts/
    └── {userId}/
        └── {imageId}.jpg
```

### 4. Clean Up Old Images
You can manually delete unused images from Cloudinary Dashboard or use the API.

---

## Monitoring Usage

### Check Your Usage
1. Go to Cloudinary Dashboard
2. Look at the top for usage stats:
   - **Storage**: X GB / 25 GB
   - **Bandwidth**: X GB / 25 GB
   - **Transformations**: X / Unlimited

### Set Up Alerts (Optional)
1. Go to **Settings → Notifications**
2. Enable email alerts at 80% usage
3. You'll get warned before hitting limits

---

## Free Tier Limits

| Feature | Free Tier |
|---------|-----------|
| Storage | 25 GB |
| Bandwidth | 25 GB/month |
| Transformations | 25,000/month |
| Video Processing | 500 credits |
| Support | Community |

**Good for**: Personal projects, small apps, MVP testing
**Upgrade if**: You need more storage or bandwidth (starts at $89/month)

---

## Common Issues

### "Invalid upload preset"
- **Cause**: Wrong preset name in `.env`
- **Solution**: Check preset name in Cloudinary Dashboard matches exactly

### "Upload failed: 401 Unauthorized"
- **Cause**: Upload preset is set to "Signed" instead of "Unsigned"
- **Solution**: Edit preset, change Signing Mode to "Unsigned"

### "File too large"
- **Cause**: File exceeds 10MB limit
- **Solution**: Compress image before upload or increase limit in code

### Images not showing
- **Cause**: CORS issue or wrong cloud name
- **Solution**: Verify `VITE_CLOUDINARY_CLOUD_NAME` is correct

---

## Migration from Firebase Storage (If Needed)

If you already have images in Firebase Storage:

1. **Export from Firebase**:
   ```bash
   # List all files
   gsutil ls -r gs://your-bucket-name
   
   # Download all files
   gsutil -m cp -r gs://your-bucket-name/meals ./backup/meals
   ```

2. **Upload to Cloudinary**:
   - Use Cloudinary's bulk upload feature
   - Or use the API to upload programmatically

3. **Update URLs in Firestore**:
   - Run a migration script to update image URLs

---

## Cloudinary vs Firebase Storage

| Feature | Cloudinary (Free) | Firebase Storage |
|---------|-------------------|------------------|
| Price | Free (no card needed) | Requires Blaze plan |
| Storage | 25 GB | 5 GB free |
| Bandwidth | 25 GB/month | 1 GB/day |
| Transformations | ✅ Automatic | ❌ Manual |
| CDN | ✅ Global | ✅ Global |
| Setup | Easy | Requires billing |

**Verdict**: Cloudinary is better for getting started!

---

## Next Steps

1. ✅ Create Cloudinary account
2. ✅ Get credentials and add to `.env`
3. ✅ Create upload presets
4. ✅ Test image upload in your app
5. ⚪ Monitor usage in dashboard
6. ⚪ Set up usage alerts

---

## Support Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload Widget](https://cloudinary.com/documentation/upload_widget)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [React SDK](https://cloudinary.com/documentation/react_integration)

---

✅ **Cloudinary is ready to use!** No more Firebase Storage upgrade needed.
