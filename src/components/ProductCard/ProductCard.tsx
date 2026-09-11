import { Link } from "react-router-dom"

import type { Product } from "../../types/Product"

import "./ProductCard.css"

type ProductCardProps = {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.product_images?.[0]

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price)

  return (
    <Link
      to={`/produto/${product.slug}`}
      className="product-card"
    >
      <div className="product-card-image">
        {mainImage ? (
          <img
            src={mainImage.image_url}
            alt={mainImage.alt_text ?? product.name}
          />
        ) : (
          <div className="product-card-no-image">
            Sem imagem
          </div>
        )}

        <span className="product-condition">
          {product.condition}
        </span>
      </div>

      <div className="product-card-content">
        {product.brand && (
          <span className="product-brand">
            {product.brand}
          </span>
        )}

        <h3>{product.name}</h3>

        <span className="product-price">
          {formattedPrice}
        </span>

        <span className="product-details">
          Ver detalhes →
        </span>
      </div>
    </Link>
  )
}

export default ProductCard