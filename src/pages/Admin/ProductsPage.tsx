import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { supabase } from "../../services/supabase"

import "./ProductsPage.css"

type AdminProduct = {
  id: number
  name: string
  slug: string
  price: number
  condition: string
  active: boolean
  category_id: number | null

  product_images: {
    image_url: string
    position: number
  }[]
}

function ProductsPage() {
  const navigate = useNavigate()

  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        price,
        condition,
        active,
        category_id,
        product_images (
          image_url,
          position
        )
      `)
      .order("created_at", {
        ascending: false,
      })

    if (error) {
      console.error(
        "Erro ao carregar produtos:",
        error,
      )

      setProducts([])
      setLoading(false)
      return
    }

    const normalizedProducts = (data ?? []).map(
      (product) => ({
        ...product,

        product_images: [
          ...(product.product_images ?? []),
        ].sort(
          (a, b) =>
            a.position - b.position,
        ),
      }),
    )

    setProducts(normalizedProducts)
    setLoading(false)
  }

  async function toggleProductStatus(
    productId: number,
    currentStatus: boolean,
  ) {
    const { error } = await supabase
      .from("products")
      .update({
        active: !currentStatus,
      })
      .eq("id", productId)

    if (error) {
      console.error(
        "Erro ao alterar status do produto:",
        error,
      )

      alert(
        "Não foi possível alterar o status do produto.",
      )

      return
    }

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
            ...product,
            active: !currentStatus,
          }
          : product,
      ),
    )
  }
  async function deleteProduct(
    productId: number,
    productName: string,
  ) {
    const confirmed = window.confirm(
      `Deseja realmente excluir "${productName}"? Essa ação não poderá ser desfeita.`,
    )

    if (!confirmed) {
      return
    }

    const { data: images, error: imagesError } = await supabase
      .from("product_images")
      .select("storage_path")
      .eq("product_id", productId)

    if (imagesError) {
      console.error(
        "Erro ao carregar imagens do produto:",
        imagesError,
      )

      alert(
        "Não foi possível preparar a exclusão do produto.",
      )
      return
    }

    const storagePaths = (images ?? [])
      .map((image) => image.storage_path)
      .filter(
        (path): path is string =>
          Boolean(path),
      )

    if (storagePaths.length > 0) {
      const { error: storageError } =
        await supabase.storage
          .from("products")
          .remove(storagePaths)

      if (storageError) {
        console.error(
          "Erro ao excluir fotos do Storage:",
          storageError,
        )

        alert(
          "Não foi possível excluir as fotos do produto.",
        )
        return
      }
    }

    const { error: productError } =
      await supabase
        .from("products")
        .delete()
        .eq("id", productId)

    if (productError) {
      console.error(
        "Erro ao excluir produto:",
        productError,
      )

      alert(
        "Não foi possível excluir o produto.",
      )
      return
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) =>
          product.id !== productId,
      ),
    )
  }

  function formatPrice(value: number) {
    return new Intl.NumberFormat(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      },
    ).format(value)
  }

  return (
    <main className="admin-products-page">
      <div className="admin-products-container">

        <div className="admin-products-top">

          <div>
            <span>
              MAIA'S TECH ADMIN
            </span>

            <h1>Produtos</h1>

            <p>
              Gerencie os produtos cadastrados
              na loja.
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                "/admin/produtos/novo",
              )
            }
          >
            + Novo produto
          </button>

        </div>

        <button
          className="admin-products-back"
          onClick={() =>
            navigate("/admin")
          }
        >
          ← Voltar ao painel
        </button>

        {loading ? (
          <div className="admin-products-status">
            Carregando produtos...
          </div>
        ) : products.length === 0 ? (
          <div className="admin-products-status">
            Nenhum produto cadastrado.
          </div>
        ) : (
          <div className="admin-products-grid">

            {products.map((product) => {
              const mainImage =
                product.product_images?.[0]

              return (
                <article
                  className="admin-product-card"
                  key={product.id}
                >

                  <div className="admin-product-image">

                    {mainImage ? (
                      <img
                        src={
                          mainImage.image_url
                        }
                        alt={product.name}
                      />
                    ) : (
                      <div className="admin-product-no-image">
                        Sem foto
                      </div>
                    )}

                    <span
                      className={
                        product.active
                          ? "admin-product-status active"
                          : "admin-product-status inactive"
                      }
                    >
                      {product.active
                        ? "ATIVO"
                        : "INATIVO"}
                    </span>

                  </div>

                  <div className="admin-product-content">

                    <span className="admin-product-condition">
                      {product.condition}
                    </span>

                    <h2>
                      {product.name}
                    </h2>

                    <strong>
                      {formatPrice(
                        product.price,
                      )}
                    </strong>

                    <div className="admin-product-actions">

                      <button
                        onClick={() =>
                          window.open(
                            `/produto/${product.slug}`,
                            "_blank",
                          )
                        }
                      >
                        Ver
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            `/admin/produtos/${product.id}/editar`,
                          )
                        }
                      >
                        Editar
                      </button>

                      <button
                        onClick={() =>
                          toggleProductStatus(
                            product.id,
                            product.active,
                          )
                        }
                      >
                        {product.active
                          ? "Desativar"
                          : "Ativar"}
                      </button>

                      <button
                        className="danger"
                        onClick={() =>
                          deleteProduct(
                            product.id,
                            product.name,
                          )
                        }
                      >
                        Excluir
                      </button>

                    </div>

                  </div>

                </article>
              )
            })}

          </div>
        )}

      </div>
    </main>
  )
}

export default ProductsPage