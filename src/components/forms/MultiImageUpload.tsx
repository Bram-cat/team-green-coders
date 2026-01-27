"use client"

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Camera, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface ImageSlot {
  id: number
  file: File | null
  preview: string | null
  label: string
  description: string
  required: boolean
}

interface MultiImageUploadProps {
  onChange: (images: File[]) => void
  maxImages?: number
  disabled?: boolean
}

export function MultiImageUpload({
  onChange,
  maxImages = 3,
  disabled = false
}: MultiImageUploadProps) {
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([
    {
      id: 1,
      file: null,
      preview: null,
      label: 'Primary Image',
      description: 'Front view or aerial view of your roof (Required)',
      required: true
    },
    {
      id: 2,
      file: null,
      preview: null,
      label: 'Image 2',
      description: 'Side angle or different perspective (Optional - Recommended)',
      required: false
    },
    {
      id: 3,
      file: null,
      preview: null,
      label: 'Image 3',
      description: 'Additional angle for better accuracy (Optional - Recommended)',
      required: false
    }
  ].slice(0, maxImages))

  const handleFileSelect = useCallback((slotId: number, file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setImageSlots(prev => {
        const updated = prev.map(slot =>
          slot.id === slotId
            ? { ...slot, file, preview: reader.result as string }
            : slot
        )

        // Call onChange with all non-null files
        const files = updated.filter(s => s.file !== null).map(s => s.file!)
        onChange(files)

        return updated
      })
    }
    reader.readAsDataURL(file)
  }, [onChange])

  const handleRemove = useCallback((slotId: number) => {
    setImageSlots(prev => {
      const updated = prev.map(slot =>
        slot.id === slotId
          ? { ...slot, file: null, preview: null }
          : slot
      )

      // Call onChange with all non-null files
      const files = updated.filter(s => s.file !== null).map(s => s.file!)
      onChange(files)

      return updated
    })
  }, [onChange])

  const handleDrop = useCallback((slotId: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(slotId, file)
    }
  }, [disabled, handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const uploadedCount = imageSlots.filter(s => s.file !== null).length
  const hasRequiredImages = imageSlots.filter(s => s.required && s.file !== null).length > 0

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Upload Roof Images</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload 1-3 images for more accurate analysis. Multiple angles improve panel counting accuracy.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{uploadedCount}/{maxImages}</div>
          <div className="text-xs text-muted-foreground">Images uploaded</div>
        </div>
      </div>

      {/* Image slots grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {imageSlots.map((slot) => (
          <ImageUploadSlot
            key={slot.id}
            slot={slot}
            onFileSelect={(file) => handleFileSelect(slot.id, file)}
            onRemove={() => handleRemove(slot.id)}
            onDrop={(e) => handleDrop(slot.id, e)}
            onDragOver={handleDragOver}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Tips section */}
      {uploadedCount === 0 && (
        <Card className="border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/10">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                <p className="font-semibold">Tips for best results:</p>
                <ul className="space-y-1 ml-4 list-disc text-xs">
                  <li>Take photos in good lighting (avoid harsh shadows)</li>
                  <li>Include the entire roof in the frame</li>
                  <li>For Improve feature: Take close-up shots showing panel condition</li>
                  <li>Multiple angles help AI count panels more accurately</li>
                  <li>Aerial or rooftop photos work best for Plan feature</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multi-image benefits */}
      {uploadedCount >= 2 && (
        <Card className="border-green-500/30 bg-green-50/30 dark:bg-green-950/10">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="text-sm text-green-800 dark:text-green-300">
                <p className="font-semibold">Great! Multiple images uploaded</p>
                <p className="text-xs mt-1">
                  Our AI will analyze all images to provide more accurate panel counts, better shading analysis,
                  and higher confidence scores. Expected accuracy improvement: +15-25%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface ImageUploadSlotProps {
  slot: ImageSlot
  onFileSelect: (file: File) => void
  onRemove: () => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  disabled: boolean
}

function ImageUploadSlot({
  slot,
  onFileSelect,
  onRemove,
  onDrop,
  onDragOver,
  disabled
}: ImageUploadSlotProps) {
  const handleClick = () => {
    if (disabled) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) onFileSelect(file)
    }
    input.click()
  }

  return (
    <div className="relative">
      {/* Slot */}
      <div
        onClick={slot.preview ? undefined : handleClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className={cn(
          "relative aspect-[4/3] rounded-xl border-2 border-dashed transition-all",
          slot.preview
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          slot.required && !slot.preview && "border-amber-500/50"
        )}
      >
        {slot.preview ? (
          // Preview
          <div className="relative w-full h-full">
            <Image
              src={slot.preview}
              alt={slot.label}
              fill
              className="object-cover rounded-lg"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />

            {/* Remove button */}
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Label overlay */}
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-white text-xs font-semibold drop-shadow-md">
                {slot.label}
              </div>
            </div>
          </div>
        ) : (
          // Upload prompt
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <div className="text-sm font-semibold text-foreground mb-1">{slot.label}</div>
            <div className="text-xs text-muted-foreground">{slot.description}</div>
            {slot.required && (
              <div className="mt-2 px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-full">
                Required
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
