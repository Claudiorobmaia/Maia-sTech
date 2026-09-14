import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import Header from "../../components/Header/Header"
import ProductGallery from "../../components/ProductGallery/ProductGallery"

import { getProductBySlug } from "../../services/products"

import type { Product } from "../../types/Product"

import "./ProductPage.css"

function ProductPage() {
  const { slug } = useParams()

  const [product, setProduct] =
    useState<Product | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProduct() {
      if (!slug) {
        setLoading(false)
        return
      }

      const data = await getProductBySlug(slug)

      if (data) {
        data.product_images?.sort(
          (a, b) => a.position - b.position,
        )

        data.product_specs?.sort(
          (a, b) => a.position - b.position,
        )
      }

      setProduct(data)
      setLoading(false)
    }

    loadProduct()
  }, [slug])

  if (loading) {
    return (
      <>
        <Header />

        <main className="product-page">
          <div className="product-page-container">
            Carregando produto...
          </div>
        </main>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Header />

        <main className="product-page">
          <div className="product-page-container">
            Produto não encontrado.
          </div>
        </main>
      </>
    )
  }

  const formattedPrice = new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  ).format(product.price)

  return (
    <>
      <Header />

      <main className="product-page">
        <div className="product-page-container">

          <Link
            to="/"
            className="product-page-back"
          >
            ← Voltar
          </Link>

          <div className="product-layout">

            <ProductGallery
              images={product.product_images ?? []}
              productName={product.name}
            />

            <div className="product-info">

              {product.brand && (
                <span className="product-page-brand">
                  {product.brand}
                </span>
              )}

              <h1>{product.name}</h1>

              <span className="product-page-condition">
                {product.condition}
              </span>

              <div className="product-page-price">
                {formattedPrice}
              </div>

              {product.description && (
  <ul className="product-page-description">
    {product.description
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => (
        <li key={index}>
          {line.replace(/^[•\-]\s*/, "")}
        </li>
      ))}
  </ul>
)}

              {product.product_specs &&
                product.product_specs.length > 0 && (
                  <div className="product-specs">

                    <h2>Características</h2>

                    {product.product_specs.map(
                      (spec) => (
                        <div
                          className="product-spec-row"
                          key={spec.id}
                        >
                          <span>{spec.name}</span>
                          <strong>{spec.value}</strong>
                        </div>
                      ),
                    )}

                  </div>
                )}

              <button className="product-chat-button">
                Duvidas? Clica no chat ou chama no WhatsApp!
              </button>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default ProductPage