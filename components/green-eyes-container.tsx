"use client"

import { useState } from "react"
import { GreenEyesGeneratorButton } from "./green-eyes-generator-button"
import { GreenEyesGeneratorModal } from "./green-eyes-generator-modal"

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
      <GreenEyesGeneratorModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
      />
    </>
  )
}