import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import Header from "../../components/Header/Header"
import ProductCard from "../../components/ProductCard/ProductCard"

import { getProductsByCategory } from "../../services/products"

import type { Product } from "../../types/Product"

import "./CategoryPage.css"

const categoryNames: Record<string, string> = {
  "placas-de-video": "Placas de vídeo",
  processadores: "Processadores",
  "placas-mae": "Placas-mãe",
  armazenamento: "Armazenamento",
  gabinetes: "Gabinetes",
  memorias: "Memórias",
}

function CategoryPage() {
  const { slug } = useParams()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const categoryName =
    categoryNames[slug ?? ""] ?? "Categoria"

  useEffect(() => {
    async function loadProducts() {
      if (!slug) {
        setLoading(false)
        return
      }

      setLoading(true)

      const data = await getProductsByCategory(slug)

      setProducts(data)
      setLoading(false)
    }

    loadProducts()
  }, [slug])

  return (
    <>
      <Header />

      <main className="category-page">
        <div className="category-page-container">

          <Link to="/" className="category-back">
            ← Voltar
          </Link>

          <span className="category-eyebrow">
            MAIA'S TECH
          </span>

          <h1>{categoryName}</h1>

          <p className="category-intro">
            Confira os produtos disponíveis nesta categoria.
          </p>

          {loading ? (
            <div className="category-status">
              Carregando produtos...
            </div>
          ) : products.length === 0 ? (
            <div className="category-status">
              Nenhum produto disponível nesta categoria.
            </div>
          ) : (
            <div className="category-products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  )
}

export default CategoryPage