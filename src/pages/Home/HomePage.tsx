import { useEffect, useState } from "react"

import Header from "../../components/Header/Header"
import Hero from "../../components/Hero/Hero"
import CategoryCard from "../../components/CategoryCard/CategoryCard"
import ProductCard from "../../components/ProductCard/ProductCard"

import { getCategories } from "../../services/categories"
import { searchProducts } from "../../services/products"

import type { Category } from "../../types/Category"
import type { Product } from "../../types/Product"

import "./HomePage.css"

function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    async function loadCategories() {
      const data = await getCategories()

      setCategories(data)
      setLoading(false)
    }

    loadCategories()
  }, [])

  useEffect(() => {
    const term = search.trim()

    if (!term) {
      setProducts([])
      setSearching(false)
      return
    }

    const timeout = setTimeout(async () => {
      setSearching(true)

      const data = await searchProducts(term)

      setProducts(data)
      setSearching(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [search])

  return (
    <>
      <Header />

      <main>
        <Hero />

        <section
          className="categories-section"
          id="categorias"
        >
          <div className="categories-container">

            <div className="categories-heading">
              <span>EXPLORE</span>

              <h2>
                Encontre exatamente o que seu setup precisa.
              </h2>

              <p>
                Navegue pelas principais categorias de hardware e tecnologia.
              </p>
            </div>

            <div className="home-search">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="home-search-icon"
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
                placeholder="Buscar produtos..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  className="home-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Limpar busca"
                >
                  ×
                </button>
              )}
            </div>

            {search.trim() ? (
              searching ? (
                <div className="home-search-status">
                  Buscando produtos...
                </div>
              ) : products.length === 0 ? (
                <div className="home-search-status">
                  Nenhum produto encontrado para "{search}".
                </div>
              ) : (
                <div className="home-products-grid">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              )
            ) : loading ? (
              <p>Carregando categorias...</p>
            ) : (
              <div className="categories-grid">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                  />
                ))}
              </div>
            )}

          </div>
        </section>
      </main>
    </>
  )
}

export default HomePage