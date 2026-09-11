import { useEffect, useState } from "react"

import Header from "../../components/Header/Header"
import Hero from "../../components/Hero/Hero"
import CategoryCard from "../../components/CategoryCard/CategoryCard"

import { getCategories } from "../../services/categories"

import type { Category } from "../../types/Category"

import "./HomePage.css"

function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      const data = await getCategories()

      setCategories(data)
      setLoading(false)
    }

    loadCategories()
  }, [])

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

            {loading ? (
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