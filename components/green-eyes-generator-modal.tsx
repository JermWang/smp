"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  Eye, 
  Download, 
  X, 
  ImageIcon, 
  Loader2, 
  Sparkles,
  Zap
} from "lucide-react"

interface GreenEyesGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
}

type ProcessingStage = 'upload' | 'processing' | 'complete' | 'error'

export function GreenEyesGeneratorModal({ isOpen, onClose }: GreenEyesGeneratorModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)
  const [stage, setStage] = useState<ProcessingStage>('upload')
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)
  const [useBlobUrl, setUseBlobUrl] = useState(true) // Try blob first, fallback to data URL
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Cleanup object URLs to prevent memory leaks
  const cleanupPreviewUrl = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPreviewUrl()
    }
  }, [cleanupPreviewUrl])

  const handleFileSelect = useCallback((file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    console.log('🔍 File validation - Type:', file.type, 'Size:', file.size, 'Name:', file.name)
    
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      console.error('❌ File type rejected:', file.type, 'Allowed:', allowedTypes)
      alert('Please select a JPG or PNG image file')
      return
    }
    
    console.log('✅ File type accepted:', file.type)

    if (file.size > 5 * 1024 * 1024) { // 5MB limit for security
      alert('Image size must be less than 5MB')
      return
    }

    // Clean up any existing preview URL before creating a new one
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
      console.log('🗑️ Cleaned up old preview URL')
    }

    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })

    setSelectedImage(file)
    
    // Function to try FileReader as fallback
    const tryFileReader = () => {
      console.log('🔄 Trying FileReader fallback...')
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        if (dataUrl) {
          console.log('✅ FileReader success, data URL created')
          setPreviewUrl(dataUrl)
          setUseBlobUrl(false)
          setImageLoadError(false)
          setStage('upload')
        }
      }
      reader.onerror = (e) => {
        console.error('❌ FileReader also failed:', e)
        alert('Unable to load image preview. Please try a different image.')
      }
      reader.readAsDataURL(file)
    }

    try {
      if (useBlobUrl) {
        // Try blob URL first
        const url = URL.createObjectURL(file)
        console.log('🔗 Created blob URL:', url)
        
        // Test if the blob URL works by creating a test image
        const testImg = document.createElement('img')
        testImg.onload = () => {
          console.log('✅ Blob URL test successful')
          setPreviewUrl(url)
          setImageLoadError(false)
          setStage('upload')
        }
        testImg.onerror = () => {
          console.log('❌ Blob URL test failed, trying FileReader...')
          URL.revokeObjectURL(url) // Clean up failed blob URL
          tryFileReader()
        }
        testImg.src = url
      } else {
        // Use FileReader directly
        tryFileReader()
      }
    } catch (error) {
      console.error('❌ Failed to create preview:', error)
      tryFileReader()
    }
  }, [previewUrl, useBlobUrl])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processImage = async () => {
    if (!selectedImage) return

    setStage('processing')
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)

      const response = await fetch('/api/generate-green-eyes', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to process image`)
      }

      const result = await response.json()
      
      if (!result.success || !result.imageUrl) {
        throw new Error('Invalid response from server')
      }
      
      setProcessedImageUrl(result.imageUrl)
      setProgress(100)
      setStage('complete')
      
    } catch (error) {
      console.error('Error processing image:', error)
      setStage('error')
      
      // Handle specific error types with better user messages
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('Too many requests')) {
          alert('🚫 Too many requests. Please wait a minute before trying again.')
        } else if (error.message.includes('400') || error.message.includes('Invalid image')) {
          alert('📁 Invalid image file. Please try a different JPG or PNG image.')
        } else if (error.message.includes('AI service') || error.message.includes('OpenAI')) {
          alert('🤖 AI service is temporarily busy. Please try again in a moment.')
        } else if (error.message.includes('Storage') || error.message.includes('storage')) {
          alert('💾 Storage error. Please try again.')
        } else if (error.message.includes('Service temporarily unavailable')) {
          alert('⚙️ Service is temporarily unavailable. Please try again later.')
        } else {
          alert(`❌ Error: ${error.message}`)
        }
      } else {
        alert('❌ An unexpected error occurred. Please try again.')
      }
    } finally {
      clearInterval(progressInterval)
    }
  }

  const downloadImage = async () => {
    if (!processedImageUrl) return

    try {
      const response = await fetch(processedImageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `green-eyes-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const resetModal = () => {
    // Clean up preview URL before resetting (only for blob URLs)
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    
    setSelectedImage(null)
    setPreviewUrl(null)
    setProcessedImageUrl(null)
    setStage('upload')
    setProgress(0)
    setImageLoadError(false)
    setUseBlobUrl(true) // Reset to try blob URLs first for next upload
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Dialog open={isOpen}>
      {/* Prevent accidental closing - only allow explicit X button closure */}
      <DialogContent 
        className="max-w-sm w-full max-h-[90vh] bg-black/95 border-green-400/30 text-green-100 rounded-3xl p-6"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-300 text-lg flex-1 justify-center">
              <Eye className="w-5 h-5" />
              <DialogTitle className="text-green-300">PFP Editor</DialogTitle>
              <Sparkles className="w-4 h-4 text-green-400" />
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-green-400/60 hover:text-green-300 hover:bg-green-400/10 rounded-xl p-1 ml-2"
              aria-label="Close generator"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          {/* Debug indicator - remove in production */}
          <div className="text-xs text-green-500/60 text-center mt-1">
            Stage: {stage} | Image: {selectedImage ? '✓' : '✗'} | Preview: {previewUrl ? '✓' : '✗'} | URL: {previewUrl ? (previewUrl.startsWith('blob:') ? 'blob' : 'data') : 'none'}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Large Square PFP Area */}
          {stage === 'upload' && (
            <>
              <div className="space-y-4">
                {/* Large Square PFP Preview */}
                <div
                  className={`
                    relative w-full aspect-square rounded-3xl border-4 transition-all duration-300 cursor-pointer
                    ${isDragging 
                      ? 'border-green-400 bg-green-400/10 scale-[1.02]' 
                      : selectedImage 
                        ? 'border-green-400/50' 
                        : 'border-green-600/30 hover:border-green-500/50'
                    }
                    ${!selectedImage ? 'border-dashed' : 'border-solid'}
                    overflow-hidden group bg-gradient-to-br from-green-950/20 to-emerald-900/20
                  `}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  
                  {selectedImage && previewUrl ? (
                    <>
                      {/* User's PFP Preview - Use regular img for blob URLs */}
                      <img
                        src={previewUrl}
                        alt="Your Profile Picture"
                        className="w-full h-full object-cover rounded-3xl"
                        onLoad={() => {
                          console.log('✅ Preview image loaded successfully')
                          console.log('Preview URL type:', previewUrl.startsWith('blob:') ? 'blob' : 'regular')
                          setImageLoadError(false)
                        }}
                        onError={(e) => {
                          console.error('❌ Preview image failed to load:', e)
                          const imgElement = e.target as HTMLImageElement
                          console.log('🔍 Debug info:', {
                            previewUrl: previewUrl,
                            srcAttribute: imgElement?.src,
                            naturalWidth: imgElement?.naturalWidth,
                            naturalHeight: imgElement?.naturalHeight,
                            complete: imgElement?.complete,
                            fileExists: !!selectedImage
                          })
                          setImageLoadError(true)
                        }}
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-3xl">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-green-300 mx-auto mb-2" />
                          <p className="text-sm text-green-300 font-medium">Change Photo</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Large Upload Area */}
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 mx-auto rounded-2xl bg-green-600/20 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-green-400" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-lg font-medium text-green-300">
                              Add Your PFP
                            </p>
                            <p className="text-sm text-green-400/80">
                              Tap to upload or drag & drop
                            </p>
                            <p className="text-xs text-green-600">
                              Laser beams FROM eyes • Preserves your artwork
                            </p>
                            <p className="text-xs text-green-500/50">
                              Perfect for NFTs, anime, cartoons • JPG, PNG • Max 5MB
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Upload icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-green-600/30 rounded-2xl p-3">
                          <Upload className="w-6 h-6 text-green-300" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                {selectedImage && (
                  <div className="space-y-3">
                    <Button
                      onClick={processImage}
                      className="w-full bg-green-600 hover:bg-green-500 text-white rounded-2xl py-3"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Add Green Eyes
                    </Button>
                    <p className="text-xs text-green-500/60 text-center">
                      💡 Hover over image above to change it
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Processing Stage */}
          {stage === 'processing' && (
            <div className="space-y-6">
              {/* Large Processing Preview */}
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-4 border-green-400/30">
                <img
                  src={previewUrl!}
                  alt="Processing your PFP"
                  className="w-full h-full object-cover opacity-40 rounded-3xl"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  {/* Sacred Digital Geometry Loading Animation */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Outer rotating hexagon */}
                    <div className="absolute w-28 h-28 border-2 border-green-400/40 rotate-0 animate-spin-slow">
                      <div className="w-full h-full" style={{
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                      }} />
                    </div>
                    
                    {/* Middle rotating ring */}
                    <div className="absolute w-20 h-20 border-2 border-green-300/60 rounded-full animate-spin"
                         style={{ 
                           borderTopColor: 'transparent',
                           borderLeftColor: 'transparent' 
                         }} />
                    
                    {/* Inner triangle rotating opposite */}
                    <div className="absolute w-12 h-12 border-2 border-green-200/80 animate-spin-reverse">
                      <div className="w-full h-full" style={{
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                      }} />
                    </div>
                    
                    {/* Center pulsing dot */}
                    <div className="absolute w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    
                    {/* Four corner dots */}
                    <div className="absolute w-1 h-1 bg-green-300 rounded-full top-2 left-2 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute w-1 h-1 bg-green-300 rounded-full top-2 right-2 animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute w-1 h-1 bg-green-300 rounded-full bottom-2 left-2 animate-pulse" style={{ animationDelay: '1.5s' }} />
                    <div className="absolute w-1 h-1 bg-green-300 rounded-full bottom-2 right-2 animate-pulse" style={{ animationDelay: '2s' }} />
                    
                    {/* Sacred geometry lines */}
                    <div className="absolute inset-0">
                      <div className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-green-400/30 transform -translate-x-1/2 -translate-y-1/2 rotate-0" />
                      <div className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-green-400/30 transform -translate-x-1/2 -translate-y-1/2 rotate-60" />
                      <div className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-green-400/30 transform -translate-x-1/2 -translate-y-1/2 rotate-120" />
                    </div>
                  </div>
                </div>
                
                {/* Subtle text below geometry */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-green-400 animate-pulse" />
                    <span className="text-green-300 text-sm">Transforming</span>
                    <Eye className="w-4 h-4 text-green-400 animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Progress 
                  value={progress} 
                  className="w-full h-3 bg-green-900/50 rounded-full"
                />
                <p className="text-center text-sm text-green-500">
                  {Math.round(progress)}% complete
                </p>
              </div>
            </div>
          )}

          {/* Complete Stage */}
          {stage === 'complete' && processedImageUrl && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-green-300 mb-1">
                  🎉 Green Eyes Activated!
                </h3>
                <p className="text-sm text-green-400/80">
                  Perfect for crypto Twitter! 🚀
                </p>
                <p className="text-xs text-green-500/60 mt-1">
                  Laser beams shooting from eyes • Original artwork preserved
                </p>
              </div>
              
              {/* Large Square Result */}
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-4 border-green-400/50">
                <img
                  src={processedImageUrl}
                  alt="Your Green Eyes PFP"
                  className="w-full h-full object-cover rounded-3xl"
                  onLoad={() => console.log('✅ Processed image loaded successfully')}
                  onError={(e) => {
                    console.error('❌ Processed image failed to load:', e)
                    console.log('Processed URL:', processedImageUrl)
                  }}
                />
                {/* Green glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-transparent to-green-600/10 pointer-events-none" />
                <div className="absolute inset-0 border-2 border-green-400/20 rounded-3xl animate-pulse" />
              </div>
              
              {/* Small Before/After Comparison */}
              <div className="flex items-center justify-center gap-4 py-2">
                {/* Original */}
                <div className="text-center space-y-1">
                  <p className="text-xs text-green-400/60">Before</p>
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-green-600/30">
                    <img
                      src={previewUrl!}
                      alt="Original"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
                
                {/* Arrow */}
                <Zap className="w-4 h-4 text-green-400" />
                
                {/* Result */}
                <div className="text-center space-y-1">
                  <p className="text-xs text-green-400">After</p>
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-green-400/50">
                    <img
                      src={processedImageUrl}
                      alt="Result"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={downloadImage}
                  className="w-full bg-green-600 hover:bg-green-500 text-white rounded-2xl py-3"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save PFP
                </Button>
                <Button
                  onClick={resetModal}
                  variant="outline"
                  className="w-full border-green-600/50 text-green-300 hover:bg-green-600/10 rounded-2xl py-3"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Try Another Image
                </Button>
              </div>
            </div>
          )}

          {/* Error Stage */}
          {stage === 'error' && (
            <div className="space-y-4">
              {/* Error Square */}
              <div className="relative w-full aspect-square rounded-3xl border-4 border-red-400/50 bg-red-950/20 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <X className="w-12 h-12 text-red-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-red-400">Processing Failed</h3>
                    <p className="text-sm text-red-300 mt-1">
                      Try a different image
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={resetModal}
                variant="outline"
                className="w-full border-green-600/50 text-green-300 hover:bg-green-600/10 rounded-2xl py-3"
              >
                <Upload className="w-4 h-4 mr-2" />
                Try New PFP
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}