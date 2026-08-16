import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Resize an image file client-side and upload to Firebase Storage.
 * @param {File} file - The image file to upload
 * @param {string} storagePath - Path in Storage (e.g. 'gallery/abc123.jpg')
 * @param {object} opts
 * @param {number} opts.maxWidth - Max width in px (default 1200)
 * @param {'jpeg'|'png'} opts.format - Output format (default 'jpeg')
 * @returns {Promise<string>} The download URL
 */
export async function uploadImage(file, storagePath, { maxWidth = 1200, format = 'jpeg' } = {}) {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width > maxWidth) {
    height = Math.round((height / width) * maxWidth);
    width = maxWidth;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const quality = format === 'png' ? undefined : 0.85;

  const blob = await new Promise(resolve =>
    canvas.toBlob(resolve, mimeType, quality)
  );

  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
