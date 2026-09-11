import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { supabase } from "../../services/supabase"
import { getCategories } from "../../services/categories"

import type { Category } from "../../types/Category"

import "./NewProductPage.css"

function NewProductPage() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [condition, setCondition] = useState("novo")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("1")
  const [description, setDescription] = useState("")
  const [featured, setFeatured] = useState(false)
  const [images, setImages] = useState<File[]>([])

  useEffect(() => {
    async function loadCategories() {
      const data = await getCategories()
      setCategories(data)
    }

    loadCategories()
  }, [])

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  function handleImages(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? [])

    setImages(files)
  }

  function removeImage(index: number) {
    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index),
    )
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setLoading(true)
    setMessage("")

    try {
      const slug = createSlug(name)

      // 1. Cria o produto e já retorna o ID criado
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name,
          slug,
          category_id: Number(categoryId),
          brand: brand || null,
          model: model || null,
          condition,
          price: Number(price),
          stock: Number(stock),
          description: description || null,
          featured,
          active: true,
        })
        .select("id, slug")
        .single()

      if (productError || !product) {
        console.error("Erro ao criar produto:", productError)
        setMessage("Erro ao cadastrar produto.")
        setLoading(false)
        return
      }

      // 2. Se houver fotos, envia uma por uma
      if (images.length > 0) {
        for (let index = 0; index < images.length; index++) {
          const image = images[index]

          const extension = image.name.split(".").pop() ?? "jpg"

          const fileName =
            `foto-${String(index + 1).padStart(2, "0")}.${extension}`

          const filePath = `${product.slug}/${fileName}`

          // 3. Faz upload para o Storage
          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, image, {
              cacheControl: "3600",
              upsert: false,
            })

          if (uploadError) {
            console.error(
              "Erro ao enviar imagem:",
              uploadError,
            )
            continue
          }

          // 4. Obtém a URL pública da imagem
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("products")
            .getPublicUrl(filePath)

          // 5. Registra a imagem na tabela product_images
          const { error: imageError } = await supabase
            .from("product_images")
            .insert({
              product_id: product.id,
              image_url: publicUrl,
              storage_path: filePath,
              alt_text: `${name} - Foto ${index + 1}`,
              position: index + 1,
            })

          if (imageError) {
            console.error(
              "Erro ao registrar imagem:",
              imageError,
            )
          }
        }
      }

      setMessage("Produto cadastrado com sucesso.")

      setTimeout(() => {
        navigate("/admin")
      }, 1200)
    } catch (error) {
      console.error("Erro inesperado:", error)
      setMessage("Erro ao cadastrar produto.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="new-product-page">
      <div className="new-product-container">

        <button
          className="new-product-back"
          onClick={() => navigate("/admin")}
        >
          ← Voltar ao painel
        </button>

        <div className="new-product-heading">
          <span>MAIA'S TECH ADMIN</span>

          <h1>Novo produto</h1>

          <p>
            Cadastre as informações principais do produto.
          </p>
        </div>

        <form
          className="new-product-form"
          onSubmit={handleSubmit}
        >
          <div className="form-grid">

            <label>
              Nome do produto
              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />
            </label>

            <label>
              Categoria
              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                required
              >
                <option value="">
                  Selecione uma categoria
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Marca
              <input
                type="text"
                value={brand}
                onChange={(event) =>
                  setBrand(event.target.value)
                }
              />
            </label>

            <label>
              Modelo
              <input
                type="text"
                value={model}
                onChange={(event) =>
                  setModel(event.target.value)
                }
              />
            </label>

            <label>
              Condição
              <select
                value={condition}
                onChange={(event) =>
                  setCondition(event.target.value)
                }
              >
                <option value="novo">
                  Novo
                </option>

                <option value="seminovo">
                  Seminovo
                </option>

                <option value="usado">
                  Usado
                </option>
              </select>
            </label>

            <label>
              Preço
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                required
              />
            </label>

            <label>
              Estoque
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(event) =>
                  setStock(event.target.value)
                }
                required
              />
            </label>

            <label className="featured-field">
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) =>
                  setFeatured(event.target.checked)
                }
              />

              Produto em destaque
            </label>

          </div>

          <label>
            Descrição
            <textarea
              rows={6}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />
          </label>

          <div className="product-images-field">
            <div className="product-images-heading">
              <div>
                <strong>Fotos do produto</strong>

                <p>
                  Selecione várias fotos. A primeira será usada
                  como imagem principal.
                </p>
              </div>

              <span>
                {images.length} {images.length === 1 ? "foto" : "fotos"}
              </span>
            </div>

            <label className="product-image-upload">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImages}
              />

              <strong>Selecionar fotos</strong>

              <span>JPG, PNG ou WEBP</span>
            </label>

            {images.length > 0 && (
              <div className="product-image-preview">
                {images.map((image, index) => (
                  <article key={`${image.name}-${index}`}>
                    <div className="product-image-preview-photo">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Prévia ${index + 1}`}
                      />

                      {index === 0 && (
                        <span className="product-cover-label">
                          CAPA
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label="Remover imagem"
                      >
                        ×
                      </button>
                    </div>

                    <p>{image.name}</p>
                  </article>
                ))}
              </div>
            )}
          </div>

          {message && (
            <div className="new-product-message">
              {message}
            </div>
          )}

          {message && (
            <div className="new-product-message">
              {message}
            </div>
          )}

          <button
            className="new-product-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Salvando..."
              : "Cadastrar produto"}
          </button>
        </form>
      </div>
    </main>
  )
}

export default NewProductPage