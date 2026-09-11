import { useState } from "react"

import type { ProductImage } from "../../types/Product"

import "./ProductGallery.css"

type ProductGalleryProps = {
  images: ProductImage[]
  productName: string
}

function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="product-gallery-empty">
        Sem imagens disponíveis
      </div>
    )
  }

  function previousImage() {
    setCurrentIndex((current) =>
      current === 0
        ? images.length - 1
        : current - 1,
    )
  }

  function nextImage() {
    setCurrentIndex((current) =>
      current === images.length - 1
        ? 0
        : current + 1,
    )
  }

  const currentImage = images[currentIndex]

  return (
    <div className="product-gallery">
      <div className="product-gallery-main">
        <img
          src={currentImage.image_url}
          alt={currentImage.alt_text ?? productName}
        />

        {images.length > 1 && (
          <>
            <button
              className="gallery-arrow gallery-arrow-left"
              onClick={previousImage}
              aria-label="Imagem anterior"
            >
              ‹
            </button>

            <button
              className="gallery-arrow gallery-arrow-right"
              onClick={nextImage}
              aria-label="Próxima imagem"
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="product-gallery-thumbnails">
        {images.map((image, index) => (
          <button
            key={image.id}
            className={
              index === currentIndex
                ? "gallery-thumbnail active"
                : "gallery-thumbnail"
            }
            onClick={() => setCurrentIndex(index)}
          >
            <img
              src={image.image_url}
              alt={image.alt_text ?? productName}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProductGallery