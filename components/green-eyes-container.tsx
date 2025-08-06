"use client"

import { useState } from "react"
import { GreenEyesGeneratorButton } from "./green-eyes-generator-button"
import { AssetEditorModal } from "./asset-editor-modal"

export function GreenEyesContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleButtonClick = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <GreenEyesGeneratorButton onClick={handleButtonClick} />
      <AssetEditorModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
      />
    </>
  )
}