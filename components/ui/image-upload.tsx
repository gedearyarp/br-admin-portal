import React, { useState, useRef } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { uploadImage, type ImageUploadResult } from '@/lib/image-upload'
import { toast } from 'sonner'

interface ImageUploadProps {
  label: string
  value?: string
  onChange: (url: string) => void
  required?: boolean
  className?: string
}

export function ImageUpload({ label, value, onChange, required = false, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    setIsUploading(true)
    try {
      const result: ImageUploadResult = await uploadImage(file)
      
      if (result.success && result.url) {
        onChange(result.url)
        setPreview(result.url)
        toast.success('Image uploaded successfully')
      } else {
        toast.error(result.error || 'Failed to upload image')
        setPreview(value || null)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
      setPreview(value || null)
    } finally {
      setIsUploading(false)
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`grid gap-2 ${className}`}>
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
      
      <div className="flex flex-col gap-2">
        {preview ? (
          <div className="relative w-full max-w-xs">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-md border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div
            className="w-full max-w-xs h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={handleClick}
          >
            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload image</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
          </Button>
          
          {preview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
} 