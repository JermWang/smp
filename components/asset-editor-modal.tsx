"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { 
  Upload, 
  Eye, 
  Download, 
  X, 
  ImageIcon, 
  Sparkles,
  Zap,
  RotateCw,
  Move,
  Trash2,
  Plus
} from "lucide-react"

interface AssetEditorModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Asset {
  id: string
  name: string
  src: string
  category: 'stickers'
}

interface PlacedAsset {
  id: string
  assetId: string
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
  zIndex: number
}

interface ImageFilters {
  desaturation: number
  glow: number
}

const ASSETS: Asset[] = [
  { id: 'smpp', name: 'SMPP Logo', src: '/smpp.png', category: 'stickers' },
  { id: 'proliferate', name: 'Proliferate', src: '/proliferate.png', category: 'stickers' },
  { id: 'laser-eyes', name: 'Laser Eyes', src: '/laser-eyes.png', category: 'stickers' },
]

interface DraggableAssetProps {
  asset: PlacedAsset
  assetData: Asset
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<PlacedAsset>) => void
  editorRef: React.RefObject<HTMLDivElement>
}

function DraggableAsset({ asset, assetData, isSelected, onSelect, onUpdate, editorRef }: DraggableAssetProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, assetX: 0, assetY: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    onSelect()
    setIsDragging(true)
    
    const rect = editorRef.current?.getBoundingClientRect()
    if (!rect) return
    
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      assetX: asset.x,
      assetY: asset.y
    })
  }, [asset.x, asset.y, onSelect, editorRef])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    onSelect()
    setIsDragging(true)
    
    const rect = editorRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const touch = e.touches[0]
    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
      assetX: asset.x,
      assetY: asset.y
    })
  }, [asset.x, asset.y, onSelect, editorRef])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !editorRef.current) return
    
    const rect = editorRef.current.getBoundingClientRect()
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    
    const newX = dragStart.assetX + (deltaX / rect.width) * 100
    const newY = dragStart.assetY + (deltaY / rect.height) * 100
    
    // Constrain to editor bounds
    const constrainedX = Math.max(5, Math.min(95, newX))
    const constrainedY = Math.max(5, Math.min(95, newY))
    
    onUpdate({ x: constrainedX, y: constrainedY })
  }, [isDragging, dragStart, onUpdate, editorRef])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !editorRef.current) return
    
    const rect = editorRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.x
    const deltaY = touch.clientY - dragStart.y
    
    const newX = dragStart.assetX + (deltaX / rect.width) * 100
    const newY = dragStart.assetY + (deltaY / rect.height) * 100
    
    // Constrain to editor bounds
    const constrainedX = Math.max(5, Math.min(95, newX))
    const constrainedY = Math.max(5, Math.min(95, newY))
    
    onUpdate({ x: constrainedX, y: constrainedY })
  }, [isDragging, dragStart, onUpdate, editorRef])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  return (
    <div
      className={`absolute select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${
        isSelected ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-transparent' : ''
      }`}
      style={{
        left: `${asset.x}%`,
        top: `${asset.y}%`,
        transform: `translate(-50%, -50%) scale(${asset.scale}) rotate(${asset.rotation}deg)`,
        opacity: asset.opacity / 100,
        zIndex: asset.zIndex
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <img 
        src={assetData.src} 
        alt={assetData.name}
        className="max-w-none pointer-events-none"
        style={{ 
          width: '100px', 
          height: 'auto',
          imageRendering: 'pixelated' // Prevent blur on scaling
        }}
        draggable={false}
      />
      
      {/* Selection indicators */}
      {isSelected && !isDragging && (
        <>
          {/* Corner handles for visual feedback */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        </>
      )}
    </div>
  )
}

type ProcessingStage = 'upload' | 'editing' | 'exporting'

export function AssetEditorModal({ isOpen, onClose }: AssetEditorModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [stage, setStage] = useState<ProcessingStage>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [placedAssets, setPlacedAssets] = useState<PlacedAsset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [nextZIndex, setNextZIndex] = useState(1)
  

  
  const [filters, setFilters] = useState<ImageFilters>({
    desaturation: 0,
    glow: 0
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // Cleanup object URLs to prevent memory leaks
  const cleanupPreviewUrl = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])



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

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    console.log('✅ File type accepted:', file.type)

    // Clean up any existing preview URL
    cleanupPreviewUrl()

    setSelectedImage(file)
    setImageLoading(true)
    
    // Function to try FileReader as fallback
    const tryFileReader = () => {
      console.log('🔄 Trying FileReader fallback...')
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        if (dataUrl) {
          console.log('✅ FileReader success, data URL created')
          setPreviewUrl(dataUrl)
          setImageLoading(false)
          setStage('editing')
        }
      }
      reader.onerror = (e) => {
        console.error('❌ FileReader also failed:', e)
        setImageLoading(false)
        alert('Unable to load image preview. Please try a different image.')
      }
      reader.readAsDataURL(file)
    }

    try {
      // Try blob URL first
      const url = URL.createObjectURL(file)
      console.log('🔗 Created blob URL:', url)
      
      // Test if the blob URL works by creating a test image
      const testImg = document.createElement('img')
      testImg.onload = () => {
        console.log('✅ Blob URL test successful')
        setPreviewUrl(url)
        setImageLoading(false)
        setStage('editing')
      }
      testImg.onerror = () => {
        console.log('❌ Blob URL test failed, trying FileReader...')
        URL.revokeObjectURL(url) // Clean up failed blob URL
        tryFileReader()
      }
      testImg.src = url
    } catch (error) {
      console.error('❌ Failed to create blob URL:', error)
      tryFileReader()
    }
  }, [cleanupPreviewUrl])

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

  const addAsset = useCallback((assetId: string) => {
    const newAsset: PlacedAsset = {
      id: `${assetId}-${Date.now()}`,
      assetId,
      x: 50, // Center-ish position
      y: 50,
      scale: 1,
      rotation: 0,
      opacity: 100,
      zIndex: nextZIndex
    }
    
    setPlacedAssets(prev => [...prev, newAsset])
    setNextZIndex(prev => prev + 1)
    setSelectedAsset(newAsset.id)
  }, [nextZIndex])

  const updateAsset = useCallback((id: string, updates: Partial<PlacedAsset>) => {
    setPlacedAssets(prev => prev.map(asset => 
      asset.id === id ? { ...asset, ...updates } : asset
    ))
  }, [])

  const removeAsset = useCallback((id: string) => {
    setPlacedAssets(prev => prev.filter(asset => asset.id !== id))
    if (selectedAsset === id) {
      setSelectedAsset(null)
    }
  }, [selectedAsset])



  const exportImage = useCallback(async () => {
    if (!canvasRef.current) return
    if (!previewUrl) return

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      // Create main image to get dimensions
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = previewUrl
      })

      // Preserve original aspect ratio - use image's natural dimensions
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      
      console.log(`📐 Canvas set to preserve original dimensions: ${canvas.width}x${canvas.height}`)

      // Apply simplified filters - only desaturation
      const saturation = 100 - filters.desaturation
      ctx.filter = `saturate(${saturation}%)`
      
      // Draw image at full size to preserve quality
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Reset filter for assets
      ctx.filter = 'none'

      // Draw assets in z-index order
      const sortedAssets = [...placedAssets].sort((a, b) => a.zIndex - b.zIndex)
      
      for (const asset of sortedAssets) {
        const assetData = ASSETS.find(a => a.id === asset.assetId)
        if (!assetData) continue

        const assetImg = new window.Image()
        assetImg.crossOrigin = 'anonymous'
        
        await new Promise((resolve, reject) => {
          assetImg.onload = resolve
          assetImg.onerror = reject
          assetImg.src = assetData.src
        })

        ctx.save()
        
        // SIMPLE APPROACH: Direct percentage mapping
        const centerX = (asset.x / 100) * canvas.width
        const centerY = (asset.y / 100) * canvas.height
        

        
        ctx.translate(centerX, centerY)
        ctx.rotate((asset.rotation * Math.PI) / 180)
        ctx.globalAlpha = asset.opacity / 100
        
        // Scale assets proportionally for 1000px canvas
        const scaleFactor = 2.5 // Sweet spot between 1x and 10x
        const baseSize = 100 * scaleFactor
        const scaledWidth = baseSize * asset.scale
        const scaledHeight = (baseSize * assetImg.height / assetImg.width) * asset.scale
        
        ctx.drawImage(
          assetImg, 
          -scaledWidth / 2, 
          -scaledHeight / 2, 
          scaledWidth, 
          scaledHeight
        )
        
        ctx.restore()
      }

      // Add glow effect if enabled (match preview intensity)
      if (filters.glow > 0) {
        // Create a lighter glow effect to match preview
        ctx.save()
        ctx.shadowColor = '#00ff00'
        ctx.shadowBlur = filters.glow * 3  // Scale for larger canvas
        ctx.globalAlpha = 0.2  // Lighter to match preview
        ctx.globalCompositeOperation = 'screen'
        ctx.drawImage(canvas, 0, 0)
        ctx.restore()
        
        ctx.shadowBlur = 0
        ctx.globalCompositeOperation = 'source-over'
      }

      // Download the result with maximum quality
      canvas.toBlob((blob) => {
        if (!blob) return
        
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `proliferation-${Date.now()}.png`
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        console.log('✅ Asset editor image exported successfully without compression')
        setStage('editing')
      }, 'image/png', 1.0) // Maximum quality (1.0 = 100%)

    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }, [previewUrl, placedAssets, filters])

  const resetModal = () => {
    cleanupPreviewUrl()
    setSelectedImage(null)
    setPreviewUrl(null)
    setStage('upload')
    setImageLoading(false)
    setPlacedAssets([])
    setSelectedAsset(null)
    setNextZIndex(1)
    setFilters({
      desaturation: 0,
      glow: 0
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const selectedAssetData = selectedAsset ? placedAssets.find(a => a.id === selectedAsset) : null

  // Keyboard controls for selected asset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedAsset || !selectedAssetData) return

      const step = e.shiftKey ? 10 : 1 // Larger steps with Shift
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          updateAsset(selectedAsset, { x: Math.max(5, selectedAssetData.x - step) })
          break
        case 'ArrowRight':
          e.preventDefault()
          updateAsset(selectedAsset, { x: Math.min(95, selectedAssetData.x + step) })
          break
        case 'ArrowUp':
          e.preventDefault()
          updateAsset(selectedAsset, { y: Math.max(5, selectedAssetData.y - step) })
          break
        case 'ArrowDown':
          e.preventDefault()
          updateAsset(selectedAsset, { y: Math.min(95, selectedAssetData.y + step) })
          break
        case 'Delete':
        case 'Backspace':
          e.preventDefault()
          removeAsset(selectedAsset)
          break
        case '=':
        case '+':
          e.preventDefault()
          updateAsset(selectedAsset, { scale: Math.min(8, selectedAssetData.scale + 0.2) })
          break
        case '-':
          e.preventDefault()
          updateAsset(selectedAsset, { scale: Math.max(0.05, selectedAssetData.scale - 0.2) })
          break
        case '[':
          e.preventDefault()
          updateAsset(selectedAsset, { rotation: selectedAssetData.rotation - 15 })
          break
        case ']':
          e.preventDefault()
          updateAsset(selectedAsset, { rotation: selectedAssetData.rotation + 15 })
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedAsset, selectedAssetData, updateAsset, removeAsset, isOpen])

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-black/95 border-green-400/30 text-green-100 rounded-2xl sm:rounded-3xl p-3 sm:p-6 overflow-hidden z-[200] [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        style={{ isolation: 'isolate' }}
      >
        <DialogHeader className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2 text-green-300 text-base sm:text-lg">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              <DialogTitle className="text-green-300 text-sm sm:text-base">Green Eyes Generator</DialogTitle>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-green-400/60 hover:text-green-300 hover:bg-green-400/10 rounded-xl p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 h-[75vh] lg:h-[70vh]">
          {/* Main Editor Area */}
          <div className="flex-1 space-y-3 lg:space-y-4">
            {stage === 'upload' && (
              <div
                className={`
                  relative w-full h-full rounded-3xl border-4 transition-all duration-300 cursor-pointer
                  ${isDragging 
                    ? 'border-green-400 bg-green-400/10 scale-[1.02]' 
                    : 'border-green-600/30 hover:border-green-500/50'
                  }
                  border-dashed overflow-hidden group bg-gradient-to-br from-green-950/20 to-emerald-900/20
                  flex items-center justify-center
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
                
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-green-600/20 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-base sm:text-lg font-medium text-green-300">
                      Upload Your Image
                    </p>
                    <p className="text-xs sm:text-sm text-green-400/80">
                      Tap to select or drag & drop
                    </p>
                    <p className="text-xs text-green-500/50">
                      JPG, PNG • Max 5MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {imageLoading && (
              <div className="relative w-full h-full rounded-3xl border-4 border-green-400/30 bg-gradient-to-br from-green-950/20 to-emerald-900/20 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto">
                    <Sparkles className="w-12 h-12 text-green-400 animate-pulse" />
                  </div>
                  <p className="text-green-300 text-lg">Loading Image...</p>
                </div>
              </div>
            )}

            {stage === 'editing' && previewUrl && !imageLoading && (
              <div className="relative w-full h-full">
                <div 
                  ref={editorRef}
                  className="relative w-full aspect-square rounded-3xl overflow-hidden border-4 border-green-400/30 bg-black"
                  onClick={(e) => {
                    // Deselect asset when clicking on empty space
                    if (e.target === e.currentTarget) {
                      setSelectedAsset(null)
                    }

                  }}
                >
                  {/* Background Image with all filters */}
                  <img
                    src={previewUrl || ''}
                    alt="Base Image"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      filter: `saturate(${100 - filters.desaturation}%)`,
                      boxShadow: filters.glow > 0 ? `
                        0 0 ${filters.glow * 2}px rgba(0,255,0,0.8), 
                        0 0 ${filters.glow * 4}px rgba(0,255,0,0.6),
                        0 0 ${filters.glow * 6}px rgba(0,255,0,0.4),
                        inset 0 0 ${filters.glow}px rgba(0,255,0,0.2)
                      ` : 'none'
                    }}
                    onLoad={() => console.log('✅ Base image loaded successfully')}
                    onError={(e) => {
                      console.error('❌ Base image failed to load:', e)
                      console.log('Preview URL:', previewUrl)
                    }}
                  />
                  

                  
                  {/* Much more visible glow effect */}
                  {filters.glow > 0 && (
                    <>
                      {/* Inner glow */}
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at center, rgba(0,255,0,${Math.min(0.4, filters.glow / 40)}) 0%, transparent 60%)`,
                          mixBlendMode: 'screen'
                        }}
                      />
                      {/* Outer glow */}
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at center, transparent 40%, rgba(0,255,0,${Math.min(0.2, filters.glow / 80)}) 70%, transparent 100%)`,
                          mixBlendMode: 'screen'
                        }}
                      />
                    </>
                  )}

                  {/* Placed Assets */}
                  {placedAssets.map((asset) => {
                    const assetData = ASSETS.find(a => a.id === asset.assetId)
                    if (!assetData) return null

                    return (
                      <DraggableAsset
                        key={asset.id}
                        asset={asset}
                        assetData={assetData}
                        isSelected={selectedAsset === asset.id}
                        onSelect={() => setSelectedAsset(asset.id)}
                        onUpdate={(updates) => updateAsset(asset.id, updates)}
                        editorRef={editorRef as React.RefObject<HTMLDivElement>}
                      />
                    )
                  })}


                </div>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          {stage === 'editing' && (
            <div className="w-full lg:w-80 space-y-3 lg:space-y-4 overflow-y-auto lg:max-h-full max-h-[40vh]">
              {/* Asset Library */}
              <div className="bg-green-950/30 rounded-2xl p-4 border border-green-600/20">
                <h3 className="text-green-300 font-medium mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Stickers
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {ASSETS.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => addAsset(asset.id)}
                      className="aspect-square bg-green-900/20 rounded-lg border border-green-600/30 hover:border-green-400/50 active:border-green-400 transition-colors p-2 sm:p-3 group min-h-[50px] sm:min-h-[60px]"
                    >
                      <img 
                        src={asset.src} 
                        alt={asset.name}
                        className="w-full h-full object-contain group-hover:scale-110 group-active:scale-110 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset Controls */}
              {selectedAssetData && (
                <div className="bg-green-950/30 rounded-2xl p-4 border border-green-600/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-green-300 font-medium flex items-center gap-2">
                      <Move className="w-4 h-4" />
                      Selected Sticker
                    </h3>
                    <Button
                      onClick={() => removeAsset(selectedAsset!)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Keyboard shortcuts help - hidden on mobile */}
                  <div className="mb-3 p-2 bg-green-900/20 rounded-lg border border-green-600/20 hidden sm:block">
                    <p className="text-xs text-green-400 mb-1">Keyboard Shortcuts:</p>
                    <div className="text-xs text-green-300/80 space-y-0.5">
                      <div>↑↓←→ Move • +/- Scale (0.05x-8x) • [ ] Rotate</div>
                      <div>Delete Remove • Shift+Arrow Fast Move</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-3">
                    <div>
                      <label className="text-xs sm:text-sm text-green-400 mb-2 block">Scale ({selectedAssetData.scale.toFixed(1)}x)</label>
                      <Slider
                        value={[selectedAssetData.scale]}
                        onValueChange={([value]) => updateAsset(selectedAsset!, { scale: value })}
                        min={0.05}
                        max={8}
                        step={0.05}
                        className="w-full h-6 sm:h-4"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs sm:text-sm text-green-400 mb-2 block">Rotation</label>
                      <Slider
                        value={[selectedAssetData.rotation]}
                        onValueChange={([value]) => updateAsset(selectedAsset!, { rotation: value })}
                        min={-180}
                        max={180}
                        step={15}
                        className="w-full h-6 sm:h-4"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs sm:text-sm text-green-400 mb-2 block">Opacity</label>
                      <Slider
                        value={[selectedAssetData.opacity]}
                        onValueChange={([value]) => updateAsset(selectedAsset!, { opacity: value })}
                        min={10}
                        max={100}
                        step={5}
                        className="w-full h-6 sm:h-4"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Simplified Image Controls */}
              <div className="bg-green-950/30 rounded-2xl p-4 border border-green-600/20">
                <h3 className="text-green-300 font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Image Effects
                </h3>
                
                <div className="space-y-4 sm:space-y-3">
                  <div>
                    <label className="text-xs sm:text-sm text-green-400 mb-2 block">Desaturation ({filters.desaturation}%)</label>
                    <Slider
                      value={[filters.desaturation]}
                      onValueChange={([value]) => setFilters(prev => ({ ...prev, desaturation: value }))}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full h-6 sm:h-4"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs sm:text-sm text-green-400 mb-2 block">Glow ({filters.glow}px)</label>
                    <Slider
                      value={[filters.glow]}
                      onValueChange={([value]) => setFilters(prev => ({ ...prev, glow: value }))}
                      min={0}
                      max={25}
                      step={1}
                      className="w-full h-6 sm:h-4"
                    />
                  </div>
                </div>
              </div>

              {/* Export */}
              <div className="space-y-3">
                <Button
                  onClick={exportImage}
                  disabled={false}
                  className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 text-white rounded-2xl py-4 sm:py-3 text-base sm:text-sm font-medium"
                >
                  <Download className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                  Export Image
                </Button>
                
                <Button
                  onClick={resetModal}
                  variant="outline"
                  className="w-full border-green-600/50 text-green-300 hover:bg-green-600/10 active:bg-green-600/20 rounded-2xl py-4 sm:py-3 text-base sm:text-sm font-medium"
                >
                  <Upload className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                  New Image
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for export */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* CSS for noise animations */}
        <style jsx>{`
          @keyframes noise-1 {
            0% { transform: translateX(0) translateY(0); opacity: 0.3; }
            25% { transform: translateX(-1px) translateY(1px); opacity: 0.5; }
            50% { transform: translateX(1px) translateY(-1px); opacity: 0.4; }
            75% { transform: translateX(-1px) translateY(-1px); opacity: 0.6; }
            100% { transform: translateX(1px) translateY(1px); opacity: 0.3; }
          }
          @keyframes noise-2 {
            0% { transform: translateX(0) translateY(0) rotate(0deg); opacity: 0.4; }
            25% { transform: translateX(-2px) translateY(1px) rotate(1deg); opacity: 0.7; }
            50% { transform: translateX(2px) translateY(-2px) rotate(-1deg); opacity: 0.5; }
            75% { transform: translateX(-1px) translateY(-2px) rotate(1deg); opacity: 0.8; }
            100% { transform: translateX(1px) translateY(2px) rotate(0deg); opacity: 0.4; }
          }
          @keyframes noise-3 {
            0% { transform: translateX(0) translateY(0) rotate(0deg); opacity: 0.5; }
            20% { transform: translateX(-2px) translateY(2px) rotate(2deg); opacity: 0.9; }
            40% { transform: translateX(3px) translateY(-1px) rotate(-2deg); opacity: 0.6; }
            60% { transform: translateX(-3px) translateY(-3px) rotate(1deg); opacity: 1.0; }
            80% { transform: translateX(2px) translateY(3px) rotate(-1deg); opacity: 0.7; }
            100% { transform: translateX(1px) translateY(-2px) rotate(0deg); opacity: 0.5; }
          }
          @keyframes noise-4 {
            0% { transform: translateX(0) translateY(0) rotate(0deg) scale(1); opacity: 0.6; }
            16% { transform: translateX(-3px) translateY(2px) rotate(3deg) scale(1.01); opacity: 1.0; }
            32% { transform: translateX(4px) translateY(-2px) rotate(-3deg) scale(0.99); opacity: 0.8; }
            48% { transform: translateX(-4px) translateY(-4px) rotate(2deg) scale(1.02); opacity: 1.0; }
            64% { transform: translateX(3px) translateY(4px) rotate(-2deg) scale(0.98); opacity: 0.9; }
            80% { transform: translateX(-2px) translateY(-3px) rotate(1deg) scale(1.01); opacity: 1.0; }
            100% { transform: translateX(2px) translateY(3px) rotate(0deg) scale(1); opacity: 0.6; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}