import { useEffect, useState } from "react"

import { useNavigate } from "react-router-dom"

import { supabase } from "../../services/supabase"

import type { Category } from "../../types/Category"

import "./CategoriesPage.css"

function CategoriesPage() {
  const navigate = useNavigate()

  const [categories, setCategories] =
    useState<Category[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    setLoading(true)

    const { data, error } = await supabase
      .from("categories")
      .select(`
        id,
        name,
        slug,
        description,
        image_url,
        image_path,
        created_at
      `)
      .order("name", {
        ascending: true,
      })

    if (error) {
      console.error(
        "Erro ao carregar categorias:",
        error,
      )

      setCategories([])
      setLoading(false)

      return
    }

    setCategories(
      (data ?? []) as Category[],
    )

    setLoading(false)
  }

  async function deleteCategory(
    categoryId: string,
    categoryName: string,
  ) {
    const confirmed =
      window.confirm(
        `Deseja realmente excluir a categoria "${categoryName}"?`,
      )

    if (!confirmed) {
      return
    }

    const {
      count,
      error: countError,
    } = await supabase
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "category_id",
        categoryId,
      )

    if (countError) {
      console.error(
        "Erro ao verificar produtos da categoria:",
        countError,
      )

      alert(
        "Não foi possível verificar os produtos desta categoria.",
      )

      return
    }

    if ((count ?? 0) > 0) {
      alert(
        `Não é possível excluir "${categoryName}" porque existem produtos cadastrados nela.`,
      )

      return
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq(
        "id",
        categoryId,
      )

    if (error) {
      console.error(
        "Erro ao excluir categoria:",
        error,
      )

      alert(
        "Não foi possível excluir a categoria.",
      )

      return
    }

    setCategories(
      (currentCategories) =>
        currentCategories.filter(
          (category) =>
            category.id !==
            categoryId,
        ),
    )
  }

  return (
    <main className="admin-categories-page">
      <div className="admin-categories-container">
        <div className="admin-categories-top">
          <div>
            <span>
              MAIA&apos;S TECH ADMIN
            </span>

            <h1>
              Categorias
            </h1>

            <p>
              Organize os produtos por categoria.
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                "/admin/categorias/nova",
              )
            }
          >
            + Nova categoria
          </button>
        </div>

        <button
          className="admin-categories-back"
          onClick={() =>
            navigate("/admin")
          }
        >
          ← Voltar ao painel
        </button>

        {loading ? (
          <div className="admin-categories-status">
            Carregando categorias...
          </div>
        ) : categories.length ===
          0 ? (
          <div className="admin-categories-status">
            Nenhuma categoria cadastrada.
          </div>
        ) : (
          <div className="admin-categories-list">
            {categories.map(
              (category) => (
                <article
                  className="admin-category-card"
                  key={category.id}
                >
                  <div>
                    <span>
                      {category.slug}
                    </span>

                    <h2>
                      {category.name}
                    </h2>

                    <p>
                      {category.description ||
                        "Sem descrição."}
                    </p>
                  </div>

                  <div className="admin-category-actions">
                    <button
                      onClick={() =>
                        navigate(
                          `/admin/categorias/${category.id}/editar`,
                        )
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        deleteCategory(
                          category.id,
                          category.name,
                        )
                      }
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default CategoriesPage