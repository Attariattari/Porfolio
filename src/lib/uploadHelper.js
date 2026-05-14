import { uploadToCloudinary } from "./cloudinary";

/**
 * Handle image uploads for a list of images that may contain File objects.
 * This function should be called within the form's onSubmit handler.
 * 
 * @param {Array} images - Array of image objects from ImageUploader
 * @returns {Promise<Array<string>>} - Returns array of final Cloudinary URLs
 */
export async function uploadPendingImages(images) {
  if (!images || !Array.isArray(images)) return [];

  const uploadPromises = images.map(async (item) => {
    // 1. If it's already a Cloudinary URL string, return it as is
    if (typeof item === 'string' && item.includes('cloudinary.com')) return item;
    if (typeof item === 'string' && !item.startsWith('blob:') && !item.startsWith('data:')) return item;
    
    // 2. If it's an object with a file, upload it
    if (item && item.file instanceof File) {
      try {
        const finalUrl = await uploadToCloudinary(item.file);
        return finalUrl;
      } catch (error) {
        console.error("Failed to upload image:", error);
        throw new Error(`Failed to upload ${item.file.name}: ${error.message}`);
      }
    }
    
    // 3. Fallback: if it has a url property
    if (item && item.url) {
        // If the URL is already cloudinary, don't re-upload
        if (item.url.includes('cloudinary.com')) return item.url;
        // If it's a local preview (blob) and no file is present, we might have an issue, 
        // but usually file is present if it's a new upload.
        return item.url;
    }

    return null;
  });

  const results = await Promise.all(uploadPromises);
  // Filter out any nulls (though ideally there shouldn't be any)
  return results.filter(url => url !== null);
}
