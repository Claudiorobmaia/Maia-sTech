import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { supabase } from "../../services/supabase"

import "./NewCategoryPage.css"

function NewCategoryPage() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const [imageFile, setImageFile] =
    useState<File | null>(null)

  const [imagePreview, setImagePreview] =
    useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      setImageFile(null)
      setImagePreview(null)
      return
    }

    const allowedTypes = [
      "image/png",
      "image/webp",
      "image/jpeg",
    ]

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "Escolha uma imagem PNG, WEBP ou JPG.",
      )

      event.target.value = ""
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      setMessage(
        "A imagem deve ter no máximo 5 MB.",
      )

      event.target.value = ""
      return
    }

    setMessage("")
    setImageFile(file)

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setLoading(true)
    setMessage("")

    const slug = createSlug(name)

    let imageUrl: string | null = null
    let imagePath: string | null = null

    /*
     * Se foi selecionada uma imagem,
     * primeiro enviamos para o Storage.
     */
    if (imageFile) {
      const extension =
        imageFile.name.split(".").pop()?.toLowerCase() ||
        "png"

      const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${extension}`

      imagePath = `categories/${slug}/${uniqueName}`

      const { error: uploadError } =
        await supabase.storage
          .from("category-images")
          .upload(imagePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          })

      if (uploadError) {
        console.error(
          "Erro ao enviar imagem da categoria:",
          uploadError,
        )

        setMessage(
          "Não foi possível enviar a imagem da categoria.",
        )

        setLoading(false)
        return
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("category-images")
          .getPublicUrl(imagePath)

      imageUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase
      .from("categories")
      .insert({
        name,
        slug,
        description: description || null,
        image_url: imageUrl,
        image_path: imagePath,
      })

    if (error) {
      console.error(
        "Erro ao cadastrar categoria:",
        error,
      )

      /*
       * Se a imagem foi enviada, mas o cadastro
       * falhou, removemos a imagem para não
       * deixar arquivo órfão no Storage.
       */
      if (imagePath) {
        await supabase.storage
          .from("category-images")
          .remove([imagePath])
      }

      setMessage(
        "Não foi possível cadastrar a categoria.",
      )

      setLoading(false)
      return
    }

    setMessage(
      "Categoria cadastrada com sucesso.",
    )

    setTimeout(() => {
      navigate("/admin/categorias")
    }, 900)
  }

  return (
    <main className="new-category-page">
      <div className="new-category-container">
        <button
          className="new-category-back"
          type="button"
          onClick={() =>
            navigate("/admin/categorias")
          }
        >
          ← Voltar às categorias
        </button>

        <div className="new-category-heading">
          <span>MAIA'S TECH ADMIN</span>

          <h1>Nova categoria</h1>

          <p>
            Crie uma nova categoria para organizar
            os produtos da loja.
          </p>
        </div>

        <form
          className="new-category-form"
          onSubmit={handleSubmit}
        >
          <label>
            Nome da categoria

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ex.: Mouse"
              required
            />
          </label>

          <label>
            Descrição

            <textarea
              rows={5}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Ex.: Mouses gamers e periféricos para seu setup."
            />
          </label>

          <div className="category-image-field">
            <div className="category-image-field-heading">
              <span>Imagem da categoria</span>

              <small>
                PNG transparente é recomendado.
              </small>
            </div>

            <label className="category-image-upload">
              <input
                type="file"
                accept="image/png,image/webp,image/jpeg"
                onChange={handleImageChange}
              />

              <span>
                {imageFile
                  ? "Trocar imagem"
                  : "Selecionar imagem"}
              </span>
            </label>

            {imagePreview && (
              <div className="category-image-preview">
                <img
                  src={imagePreview}
                  alt="Prévia da categoria"
                />
              </div>
            )}
          </div>

          <div className="category-slug-preview">
            <span>SLUG GERADO</span>

            <strong>
              {name
                ? createSlug(name)
                : "nome-da-categoria"}
            </strong>
          </div>

          {message && (
            <div className="new-category-message">
              {message}
            </div>
          )}

          <button
            className="new-category-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Salvando..."
              : "Cadastrar categoria"}
          </button>
        </form>
      </div>
    </main>
  )
}

export default NewCategoryPage