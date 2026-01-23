# ImageUpload Component

A comprehensive, reusable image upload component for the lutteros platform that supports both file uploads and URL inputs with built-in image adjustment features.

## Features

✅ **File Upload**: Drag-and-drop or click to upload images  
✅ **URL Input**: Paste image URLs from external sources  
✅ **Image Preview**: Live preview of uploaded/selected images  
✅ **Image Adjustment**: Zoom and position controls for perfect framing  
✅ **Validation**: File type and size validation  
✅ **Responsive**: Works seamlessly across all device sizes  
✅ **Accessible**: Proper ARIA labels and keyboard navigation  

## Usage

```tsx
import { ImageUpload } from '@/components/common/image-upload';

function MyComponent() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <ImageUpload
      value={imageUrl}
      onChange={setImageUrl}
      label="Article Cover Image"
      description="Upload an image or paste a URL"
      aspectRatio={16 / 9}
      maxSizeMB={5}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | Current image URL or data URL |
| `onChange` | `(url: string) => void` | **Required** | Callback when image changes |
| `onRemove` | `() => void` | `undefined` | Custom remove handler |
| `label` | `string` | `'Imagem'` | Label text above component |
| `description` | `string` | `'Faça upload...'` | Description text |
| `aspectRatio` | `number` | `16 / 9` | Preview aspect ratio (width/height) |
| `maxSizeMB` | `number` | `5` | Maximum file size in megabytes |
| `className` | `string` | `''` | Additional CSS classes |

## Image Adjustment Features

When an image is uploaded, users can:

1. **Zoom**: Scale image from 100% to 200%
2. **Horizontal Position**: Adjust left-right positioning (0-100%)
3. **Vertical Position**: Adjust top-bottom positioning (0-100%)
4. **Reset**: Return to default settings

These adjustments help users frame their images perfectly within the defined aspect ratio.

## Aspect Ratios

Common aspect ratio values:

- `16 / 9` - Landscape (blog headers, hero images)
- `4 / 3` - Standard photo
- `1` - Square (avatars, thumbnails)
- `21 / 9` - Ultra-wide
- `3 / 2` - Classic photography

## Image Sources

The component supports:

1. **File Upload**: Converts to base64 data URL (temporary)
2. **External URLs**: Direct links to images

### Allowed External Domains

The following domains are configured in `next.config.ts`:

- `images.unsplash.com`
- `*.pexels.com`
- `*.pixabay.com`
- `*.freepik.com`
- `*.cloudinary.com`
- `*.supabase.co`
- `res.cloudinary.com`
- `imgur.com` / `i.imgur.com`

To add more domains, update the `remotePatterns` array in `next.config.ts`.

## File Upload Limitations

### Current Implementation (Development)
- Files are converted to base64 data URLs
- Stored directly in the database
- **Not recommended for production** (large database size)

### Production Recommendations
1. **Cloud Storage**: Upload to services like:
   - Cloudinary
   - AWS S3
   - Azure Blob Storage
   - Supabase Storage
   
2. **Upload Flow**:
   ```
   User selects file → Upload to storage service → 
   Get permanent URL → Store URL in database
   ```

3. **Benefits**:
   - Smaller database
   - Better performance
   - CDN optimization
   - Image transformations

## Validation

The component validates:

- **File Type**: Only image files (image/*)
- **File Size**: Configurable via `maxSizeMB` prop
- **URL Format**: Basic URL validation for pasted links

Error messages are displayed via toast notifications.

## Integration Example

### Article Creation Form

```tsx
'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/common/image-upload';

export default function CreateArticle() {
  const [coverImage, setCoverImage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const articleData = {
      // ... other fields
      image: coverImage,
    };

    await fetch('/api/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ImageUpload
        value={coverImage}
        onChange={setCoverImage}
        label="Cover Image"
        description="Upload an image or paste a URL. Recommended: 1200x630px"
        aspectRatio={16 / 9}
        maxSizeMB={5}
      />
      {/* Other form fields */}
    </form>
  );
}
```

## Styling

The component uses Tailwind CSS and shadcn/ui components:

- `Button` - Action buttons
- `Input` - URL input field
- `Label` - Form labels
- `Tabs` - Upload/URL tabs
- `Slider` - Adjustment controls

Custom styling can be applied via the `className` prop.

## Accessibility

- Keyboard navigation supported
- ARIA labels for screen readers
- Focus management
- Semantic HTML structure

## Dependencies

Required shadcn/ui components:
- `button`
- `input`
- `label`
- `tabs`
- `slider`

Icons from `lucide-react`:
- `Upload`, `Link`, `X`, `ZoomIn`, `Move`

Toast notifications:
- `sonner` (already installed)

## Future Enhancements

Potential improvements for production:

1. ✨ **Direct Cloud Upload**: Integrate with Cloudinary/S3 APIs
2. 🖼️ **Image Cropping**: Add crop tool before upload
3. 🎨 **Filters**: Apply basic filters (brightness, contrast)
4. 📐 **Multiple Sizes**: Generate thumbnails automatically
5. 🔄 **Progress Indicator**: Show upload progress
6. 🗑️ **Batch Delete**: Remove old images from storage
7. 📱 **Mobile Camera**: Access device camera on mobile
8. 🔍 **Image Search**: Integrate Unsplash/Pexels search

## Troubleshooting

### Image not displaying in preview

**Check:**
1. URL is valid and accessible
2. Domain is in `next.config.ts` remotePatterns
3. CORS headers allow the request
4. For data URLs, check browser console for errors

### Upload fails silently

**Check:**
1. File is an image type
2. File size is under `maxSizeMB` limit
3. Browser console for JavaScript errors
4. Network tab for failed requests

### Data URL images work locally but fail in production

**Solution:**
- Data URLs are not recommended for production
- Implement proper cloud storage integration
- See "Production Recommendations" section above

## License

Part of the lutteros platform. Internal use only.
