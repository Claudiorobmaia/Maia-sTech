import { Link } from "react-router-dom"
import type { Category } from "../../types/Category"

import gpuImage from "../../assets/categories/gpu.png"
import cpuImage from "../../assets/categories/cpu.png"
import motherboardImage from "../../assets/categories/motherboard.png"
import keyboardImage from "../../assets/categories/keyboard.png"
import monitorImage from "../../assets/categories/monitor.png"

import "./CategoryCard.css"

type CategoryCardProps = {
  category: Category
}

const categoryImages: Record<string, string> = {
  "placas-de-video": gpuImage,
  "placa-de-video": gpuImage,
  "placas-video": gpuImage,
  gpu: gpuImage,

  processadores: cpuImage,
  processador: cpuImage,
  cpu: cpuImage,

  "placas-mae": motherboardImage,
  "placa-mae": motherboardImage,
  motherboard: motherboardImage,

  teclado: keyboardImage,
  teclados: keyboardImage,

  monitor: monitorImage,
  monitores: monitorImage,
}

function CategoryCard({ category }: CategoryCardProps) {
  const fallbackImage = categoryImages[category.slug]

  const categoryImage =
    category.image_url || fallbackImage

  return (
    <Link
      to={`/categoria/${category.slug}`}
      className="category-card"
    >
      <div className="category-card-light" />
      <div className="category-card-grid-effect" />

      {categoryImage && (
        <div className="category-card-visual">
          <div className="category-card-product-glow" />

          <img
            src={categoryImage}
            alt=""
            className="category-card-product"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="category-card-content">
        <span className="category-card-label">
          CATEGORIA
        </span>

        <h3>{category.name}</h3>

        <p>{category.description}</p>

        <span className="category-card-link">
          <span>Ver produtos</span>

          <span
            className="category-card-arrow"
            aria-hidden="true"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  )
}

export default CategoryCard