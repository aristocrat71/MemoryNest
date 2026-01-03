import { supabase } from './supabaseClient';

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Upload an image file to Supabase Storage
 */
export async function uploadImage(file: File, boardId: string): Promise<string> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `boards/${boardId}/${fileName}`;

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from('board-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new StorageError(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('board-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from public URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'board-images');
    
    if (bucketIndex === -1) {
      throw new StorageError('Invalid image URL format');
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from('board-images')
      .remove([filePath]);

    if (error) {
      console.warn(`Failed to delete image: ${error.message}`);
      // Don't throw error for deletion failures, just log
    }
  } catch (error) {
    console.warn(`Error deleting image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    // Don't throw error for deletion failures
  }
}

/**
 * Initialize storage bucket (call this once during setup)
 */
export async function initializeStorage(): Promise<void> {
  try {
    const { data, error } = await supabase.storage
      .from('board-images')
      .list('', { limit: 1 });

    if (error && error.message.includes('not found')) {
      // Bucket doesn't exist, create it
      const { error: createError } = await supabase.storage
        .createBucket('board-images', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
          fileSizeLimit: 10485760, // 10MB
        });

      if (createError) {
        throw new StorageError(`Failed to create bucket: ${createError.message}`);
      }
    } else if (error) {
      throw new StorageError(`Storage check failed: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(`Storage initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}