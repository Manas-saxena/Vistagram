import { Cloudinary } from 'cloudinary-core';

// Initialize Cloudinary
const cl = new Cloudinary({
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
});

// Upload function
export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'vistagram/posts');

    fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        reject(new Error(data.error.message));
      } else {
        resolve(data.secure_url);
      }
    })
    .catch(reject);
  });
}

// Get optimized image URL
export function getImageUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}): string {
  return cl.url(publicId, {
    width: options?.width,
    height: options?.height,
    quality: options?.quality || 'auto',
    fetch_format: options?.format || 'auto',
  });
}
