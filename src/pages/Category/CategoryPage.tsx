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
  const [search, setSearch] = useState("")

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

  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase().trim()

    if (!term) {
      return true
    }

    return (
      product.name.toLowerCase().includes(term) ||
      product.brand?.toLowerCase().includes(term)
    )
  })

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

          {!loading && products.length > 0 && (
            <div className="category-search">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="category-search-icon"
              >
                <path
                  d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <input
                type="search"
                placeholder={`Buscar em ${categoryName}...`}
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  className="category-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Limpar busca"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="category-status">
              Carregando produtos...
            </div>
          ) : products.length === 0 ? (
            <div className="category-status">
              Nenhum produto disponível nesta categoria.
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="category-status">
              Nenhum produto encontrado para "{search}".
            </div>
          ) : (
            <div className="category-products-grid">
              {filteredProducts.map((product) => (
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