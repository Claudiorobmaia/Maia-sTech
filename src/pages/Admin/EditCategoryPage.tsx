import {
  useEffect,
  useState,
} from "react"

import {
  useNavigate,
  useParams,
} from "react-router-dom"

import { supabase } from "../../services/supabase"

import "./NewCategoryPage.css"

function EditCategoryPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [name, setName] = useState("")
  const [description, setDescription] =
    useState("")

  const [slug, setSlug] = useState("")

  const [currentImageUrl, setCurrentImageUrl] =
    useState<string | null>(null)

  const [currentImagePath, setCurrentImagePath] =
    useState<string | null>(null)

  const [imageFile, setImageFile] =
    useState<File | null>(null)

  const [imagePreview, setImagePreview] =
    useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function loadCategory() {
      if (!id) {
        navigate("/admin/categorias")
        return
      }

      const { data, error } = await supabase
        .from("categories")
        .select(
          `
            id,
            name,
            slug,
            description,
            image_url,
            image_path
          `,
        )
        .eq("id", Number(id))
        .single()

      if (error || !data) {
        console.error(
          "Erro ao carregar categoria:",
          error,
        )

        setMessage(
          "Não foi possível carregar a categoria.",
        )

        setLoading(false)
        return
      }

      setName(data.name)
      setSlug(data.slug)
      setDescription(data.description ?? "")

      setCurrentImageUrl(
        data.image_url ?? null,
      )

      setCurrentImagePath(
        data.image_path ?? null,
      )

      setLoading(false)
    }

    loadCategory()
  }, [id, navigate])

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

    const previewUrl =
      URL.createObjectURL(file)

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

    if (!id) {
      return
    }

    setSaving(true)
    setMessage("")

    let newImageUrl = currentImageUrl
    let newImagePath = currentImagePath

    /*
     * Se o Admin escolheu uma imagem nova,
     * fazemos upload antes de atualizar
     * a categoria.
     */
    if (imageFile) {
      const extension =
        imageFile.name.split(".").pop()?.toLowerCase() ||
        "png"

      const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${extension}`

      newImagePath =
        `categories/${slug}/${uniqueName}`

      const { error: uploadError } =
        await supabase.storage
          .from("category-images")
          .upload(
            newImagePath,
            imageFile,
            {
              cacheControl: "3600",
              upsert: false,
            },
          )

      if (uploadError) {
        console.error(
          "Erro ao enviar nova imagem:",
          uploadError,
        )

        setMessage(
          "Não foi possível enviar a nova imagem.",
        )

        setSaving(false)
        return
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("category-images")
          .getPublicUrl(newImagePath)

      newImageUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase
      .from("categories")
      .update({
        name,
        description: description || null,
        image_url: newImageUrl,
        image_path: newImagePath,
      })
      .eq("id", Number(id))

    if (error) {
      console.error(
        "Erro ao atualizar categoria:",
        error,
      )

      /*
       * Se enviamos uma imagem nova mas
       * o UPDATE falhou, excluímos essa
       * nova imagem.
       */
      if (
        imageFile &&
        newImagePath &&
        newImagePath !== currentImagePath
      ) {
        await supabase.storage
          .from("category-images")
          .remove([newImagePath])
      }

      setMessage(
        "Não foi possível atualizar a categoria.",
      )

      setSaving(false)
      return
    }

    /*
     * Somente depois que o banco confirmou
     * a atualização apagamos a imagem antiga.
     */
    if (
      imageFile &&
      currentImagePath &&
      newImagePath !== currentImagePath
    ) {
      const { error: removeError } =
        await supabase.storage
          .from("category-images")
          .remove([currentImagePath])

      if (removeError) {
        console.error(
          "Não foi possível remover a imagem antiga:",
          removeError,
        )
      }
    }

    setCurrentImageUrl(newImageUrl)
    setCurrentImagePath(newImagePath)

    setMessage(
      "Categoria atualizada com sucesso.",
    )

    setSaving(false)

    setTimeout(() => {
      navigate("/admin/categorias")
    }, 800)
  }

  if (loading) {
    return (
      <main className="new-category-page">
        <div className="new-category-container">
          Carregando categoria...
        </div>
      </main>
    )
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

          <h1>Editar categoria</h1>

          <p>
            Altere o nome, a descrição ou
            a imagem da categoria.
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
            />
          </label>

          <div className="category-image-field">
            <div className="category-image-field-heading">
              <span>Imagem da categoria</span>

              <small>
                PNG transparente é recomendado.
              </small>
            </div>

            {(imagePreview ||
              currentImageUrl) && (
              <div className="category-image-preview">
                <img
                  src={
                    imagePreview ||
                    currentImageUrl ||
                    ""
                  }
                  alt="Imagem da categoria"
                />
              </div>
            )}

            <label className="category-image-upload">
              <input
                type="file"
                accept="image/png,image/webp,image/jpeg"
                onChange={handleImageChange}
              />

              <span>
                {currentImageUrl || imageFile
                  ? "Trocar imagem"
                  : "Selecionar imagem"}
              </span>
            </label>
          </div>

          {message && (
            <div className="new-category-message">
              {message}
            </div>
          )}

          <button
            className="new-category-submit"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Salvando..."
              : "Salvar alterações"}
          </button>
        </form>
      </div>
    </main>
  )
}

export default EditCategoryPage