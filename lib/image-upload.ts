import { supabase } from './supabase'

export type ImageUploadResult = {
  success: boolean
  url?: string
  error?: string
}

export async function uploadImage(file: File, bucket: string = 'images', folder: string = 'communities'): Promise<ImageUploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Please select a valid image file' }
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'Image size must be less than 20MB' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Image upload error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload image' 
    }
  }
}

export async function deleteImage(url: string, bucket: string = 'images'): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = url.split('/')
    const fileName = urlParts.slice(-2).join('/') // Get folder/filename

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Image delete error:', error)
    return false
  }
} 