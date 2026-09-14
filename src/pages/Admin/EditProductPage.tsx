import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"

import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"

import { supabase } from "../../services/supabase"
import { getCategories } from "../../services/categories"

import type { Category } from "../../types/Category"

import "./NewProductPage.css"

type ProductImage = {
  id: number
  image_url: string
  storage_path: string | null
  alt_text: string | null
  position: number
}

type SortableImageProps = {
  image: ProductImage
  index: number
  onDelete: (imageId: number) => void
}

function SortableImage({
  image,
  index,
  onDelete,
}: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: image.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={
        isDragging
          ? "product-image-sortable dragging"
          : "product-image-sortable"
      }
    >
      <div className="product-image-preview-photo">
        <img
          src={image.image_url}
          alt={
            image.alt_text ??
            `Foto ${index + 1}`
          }
          draggable={false}
        />

        {index === 0 && (
          <span className="product-cover-label">
            CAPA
          </span>
        )}

        <button
          type="button"
          onPointerDown={(event) => {
            event.stopPropagation()
          }}
          onMouseDown={(event) => {
            event.stopPropagation()
          }}
          onTouchStart={(event) => {
            event.stopPropagation()
          }}
          onClick={(event) => {
            event.stopPropagation()
            onDelete(image.id)
          }}
          aria-label="Excluir foto"
        >
          ×
        </button>
      </div>

      <p>
        Foto {index + 1}
      </p>
    </article>
  )
}

function EditProductPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [categories, setCategories] =
    useState<Category[]>([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [savingOrder, setSavingOrder] =
    useState(false)

  const [message, setMessage] =
    useState("")

  const [name, setName] =
    useState("")

  const [productSlug, setProductSlug] =
    useState("")

  const [categoryId, setCategoryId] =
    useState("")

  const [brand, setBrand] =
    useState("")

  const [model, setModel] =
    useState("")

  const [condition, setCondition] =
    useState("novo")

  const [price, setPrice] =
    useState("")

  const [stock, setStock] =
    useState("1")

  const [description, setDescription] =
    useState("")

  const [featured, setFeatured] =
    useState(false)

  const [active, setActive] =
    useState(true)

  const [
    productImages,
    setProductImages,
  ] = useState<ProductImage[]>([])

  const [
    newImages,
    setNewImages,
  ] = useState<File[]>([])

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),

    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
  )

  useEffect(() => {
    async function loadData() {
      if (!id) {
        navigate("/admin/produtos")
        return
      }

      const [
        categoriesData,
        productResult,
      ] = await Promise.all([
        getCategories(),

        supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            category_id,
            brand,
            model,
            condition,
            price,
            stock,
            description,
            featured,
            active,
            product_images (
              id,
              image_url,
              storage_path,
              alt_text,
              position
            )
          `)
          .eq(
            "id",
            Number(id),
          )
          .single(),
      ])

      setCategories(categoriesData)

      if (
        productResult.error ||
        !productResult.data
      ) {
        console.error(
          "Erro ao carregar produto:",
          productResult.error,
        )

        setMessage(
          "Não foi possível carregar o produto.",
        )

        setLoading(false)
        return
      }

      const product =
        productResult.data

      setName(product.name)
      setProductSlug(product.slug)

      setCategoryId(
        product.category_id
          ? String(product.category_id)
          : "",
      )

      setBrand(
        product.brand ?? "",
      )

      setModel(
        product.model ?? "",
      )

      setCondition(
        product.condition,
      )

      setPrice(
        String(product.price),
      )

      setStock(
        String(product.stock),
      )

      setDescription(
        product.description ?? "",
      )

      setFeatured(
        product.featured,
      )

      setActive(
        product.active,
      )

      const sortedImages = [
        ...(product.product_images ?? []),
      ].sort(
        (a, b) =>
          (a.position ?? 0) -
          (b.position ?? 0),
      )

      setProductImages(
        sortedImages,
      )

      setLoading(false)
    }

    loadData()
  }, [id, navigate])

  function handleNewImages(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(
      event.target.files ?? [],
    )

    setNewImages(files)
  }

  function removeNewImage(
    index: number,
  ) {
    setNewImages(
      (currentImages) =>
        currentImages.filter(
          (_, imageIndex) =>
            imageIndex !== index,
        ),
    )
  }

  function getStoragePathFromUrl(
    imageUrl: string,
  ) {
    try {
      const url =
        new URL(imageUrl)

      const prefix =
        "/storage/v1/object/public/products/"

      if (
        !url.pathname.includes(
          prefix,
        )
      ) {
        return null
      }

      return decodeURIComponent(
        url.pathname.replace(
          prefix,
          "",
        ),
      )
    } catch {
      return null
    }
  }

  async function saveImageOrder(
    images: ProductImage[],
  ) {
    setSavingOrder(true)

    try {
      for (
        let index = 0;
        index < images.length;
        index++
      ) {
        const image =
          images[index]

        const { error } =
          await supabase
            .from("product_images")
            .update({
              position:
                index + 1,
            })
            .eq(
              "id",
              image.id,
            )

        if (error) {
          console.error(
            "Erro ao salvar posição da foto:",
            error,
          )

          return false
        }
      }

      return true
    } finally {
      setSavingOrder(false)
    }
  }

  async function handleDragEnd(
    event: DragEndEvent,
  ) {
    const {
      active: draggedImage,
      over,
    } = event

    if (!over) {
      return
    }

    if (
      draggedImage.id ===
      over.id
    ) {
      return
    }

    const oldIndex =
      productImages.findIndex(
        (image) =>
          image.id ===
          draggedImage.id,
      )

    const newIndex =
      productImages.findIndex(
        (image) =>
          image.id ===
          over.id,
      )

    if (
      oldIndex === -1 ||
      newIndex === -1
    ) {
      return
    }

    const previousImages =
      [...productImages]

    const reorderedImages =
      arrayMove(
        productImages,
        oldIndex,
        newIndex,
      ).map(
        (image, index) => ({
          ...image,
          position:
            index + 1,
        }),
      )

    /*
     * Primeiro muda visualmente.
     */
    setProductImages(
      reorderedImages,
    )

    setMessage(
      "Salvando nova ordem das fotos...",
    )

    /*
     * Depois salva no Supabase.
     */
    const saved =
      await saveImageOrder(
        reorderedImages,
      )

    if (!saved) {
      setProductImages(
        previousImages,
      )

      setMessage(
        "Não foi possível salvar a nova ordem das fotos.",
      )

      return
    }

    setMessage(
      "Ordem das fotos atualizada com sucesso.",
    )
  }

  async function normalizeImagePositions(
    images: ProductImage[],
  ) {
    const normalized =
      images.map(
        (image, index) => ({
          ...image,
          position:
            index + 1,
        }),
      )

    const saved =
      await saveImageOrder(
        normalized,
      )

    if (!saved) {
      return null
    }

    return normalized
  }

  async function deleteProductImage(
    imageId: number,
  ) {
    const confirmed =
      window.confirm(
        "Deseja realmente excluir esta foto?",
      )

    if (!confirmed) {
      return
    }

    const image =
      productImages.find(
        (item) =>
          item.id === imageId,
      )

    if (!image) {
      return
    }

    try {
      const pathFromUrl =
        getStoragePathFromUrl(
          image.image_url,
        )

      const possiblePaths = [
        image.storage_path,
        pathFromUrl,
      ].filter(
        (
          path,
          index,
          paths,
        ): path is string =>
          Boolean(path) &&
          paths.indexOf(path) ===
            index,
      )

      let storageFileRemoved =
        false

      for (
        const storagePath
        of possiblePaths
      ) {
        const {
          data: removedFiles,
          error: storageError,
        } =
          await supabase.storage
            .from("products")
            .remove([
              storagePath,
            ])

        if (storageError) {
          console.error(
            "Erro ao tentar excluir arquivo:",
            storagePath,
            storageError,
          )

          continue
        }

        if (
          removedFiles &&
          removedFiles.length > 0
        ) {
          storageFileRemoved =
            true

          break
        }
      }

      if (!storageFileRemoved) {
        console.warn(
          "Arquivo não encontrado no Storage. Removendo somente o registro da tabela.",
        )
      }

      const {
        error: databaseError,
      } =
        await supabase
          .from("product_images")
          .delete()
          .eq(
            "id",
            imageId,
          )

      if (databaseError) {
        console.error(
          "Erro ao excluir registro da foto:",
          databaseError,
        )

        alert(
          "Não foi possível excluir o registro da foto.",
        )

        return
      }

      const remainingImages =
        productImages.filter(
          (item) =>
            item.id !== imageId,
        )

      if (
        remainingImages.length === 0
      ) {
        setProductImages([])
        return
      }

      const normalized =
        await normalizeImagePositions(
          remainingImages,
        )

      if (normalized) {
        setProductImages(
          normalized,
        )
      } else {
        setProductImages(
          remainingImages,
        )
      }
    } catch (error) {
      console.error(
        "Erro inesperado ao excluir foto:",
        error,
      )

      alert(
        "Ocorreu um erro ao excluir a foto.",
      )
    }
  }

  async function uploadNewImages() {
    if (
      !id ||
      newImages.length === 0
    ) {
      return true
    }

    const startingPosition =
      productImages.length + 1

    const uploadedImages:
      ProductImage[] = []

    for (
      let index = 0;
      index < newImages.length;
      index++
    ) {
      const image =
        newImages[index]

      const extension =
        image.name
          .split(".")
          .pop()
          ?.toLowerCase() ??
        "jpg"

      const timestamp =
        Date.now()

      const fileName =
        `foto-${timestamp}-${String(
          index + 1,
        ).padStart(
          2,
          "0",
        )}.${extension}`

      const folderName =
        productSlug ||
        `produto-${id}`

      const filePath =
        `${folderName}/${fileName}`

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from("products")
          .upload(
            filePath,
            image,
            {
              cacheControl:
                "3600",

              upsert:
                false,
            },
          )

      if (uploadError) {
        console.error(
          "Erro ao enviar nova imagem:",
          uploadError,
        )

        alert(
          `Não foi possível enviar a foto ${index + 1}.`,
        )

        return false
      }

      const {
        data: {
          publicUrl,
        },
      } =
        supabase.storage
          .from("products")
          .getPublicUrl(
            filePath,
          )

      const newPosition =
        startingPosition +
        index

      const {
        data: imageRecord,
        error: imageError,
      } =
        await supabase
          .from("product_images")
          .insert({
            product_id:
              Number(id),

            image_url:
              publicUrl,

            storage_path:
              filePath,

            alt_text:
              `${name} - Foto ${newPosition}`,

            position:
              newPosition,
          })
          .select(`
            id,
            image_url,
            storage_path,
            alt_text,
            position
          `)
          .single()

      if (
        imageError ||
        !imageRecord
      ) {
        console.error(
          "Erro ao registrar nova imagem:",
          imageError,
        )

        await supabase.storage
          .from("products")
          .remove([
            filePath,
          ])

        alert(
          `A foto ${index + 1} foi enviada, mas não pôde ser registrada.`,
        )

        return false
      }

      uploadedImages.push(
        imageRecord as ProductImage,
      )
    }

    if (
      uploadedImages.length > 0
    ) {
      const allImages = [
        ...productImages,
        ...uploadedImages,
      ].sort(
        (a, b) =>
          a.position -
          b.position,
      )

      setProductImages(
        allImages,
      )
    }

    setNewImages([])

    return true
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!id) {
      return
    }

    setSaving(true)
    setMessage("")

    try {
      const { error } =
        await supabase
          .from("products")
          .update({
            name,

            category_id:
              Number(
                categoryId,
              ),

            brand:
              brand || null,

            model:
              model || null,

            condition,

            price:
              Number(price),

            stock:
              Number(stock),

            description:
              description ||
              null,

            featured,

            active,
          })
          .eq(
            "id",
            Number(id),
          )

      if (error) {
        console.error(
          "Erro ao atualizar produto:",
          error,
        )

        setMessage(
          "Erro ao atualizar produto.",
        )

        return
      }

      const imagesUploaded =
        await uploadNewImages()

      if (!imagesUploaded) {
        setMessage(
          "Os dados foram atualizados, mas ocorreu um erro com as fotos.",
        )

        return
      }

      setMessage(
        "Produto atualizado com sucesso.",
      )
    } catch (error) {
      console.error(
        "Erro inesperado ao atualizar produto:",
        error,
      )

      setMessage(
        "Erro inesperado ao atualizar produto.",
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="new-product-page">
        <div className="new-product-container">
          Carregando produto...
        </div>
      </main>
    )
  }

  return (
    <main className="new-product-page">
      <div className="new-product-container">

        <button
          className="new-product-back"
          type="button"
          onClick={() =>
            navigate(
              "/admin/produtos",
            )
          }
        >
          ← Voltar aos produtos
        </button>

        <div className="new-product-heading">
          <span>
            MAIA'S TECH ADMIN
          </span>

          <h1>
            Editar produto
          </h1>

          <p>
            Altere as informações e
            salve as mudanças.
          </p>
        </div>

        <form
          className="new-product-form"
          onSubmit={
            handleSubmit
          }
        >
          <div className="form-grid">

            <label>
              Nome do produto

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                required
              />
            </label>

            <label>
              Categoria

              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(
                    event.target.value,
                  )
                }
                required
              >
                <option value="">
                  Selecione uma categoria
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              Marca

              <input
                type="text"
                value={brand}
                onChange={(event) =>
                  setBrand(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Modelo

              <input
                type="text"
                value={model}
                onChange={(event) =>
                  setModel(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Condição

              <select
                value={condition}
                onChange={(event) =>
                  setCondition(
                    event.target.value,
                  )
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
                  setPrice(
                    event.target.value,
                  )
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
                  setStock(
                    event.target.value,
                  )
                }
                required
              />
            </label>

            <label className="featured-field">
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) =>
                  setFeatured(
                    event.target.checked,
                  )
                }
              />

              Produto em destaque
            </label>

            <label className="featured-field">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) =>
                  setActive(
                    event.target.checked,
                  )
                }
              />

              Produto ativo no site
            </label>

          </div>

          <label>
            Descrição

            <textarea
              rows={6}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
            />
          </label>

          <div className="product-images-field">

            <div className="product-images-heading">
              <div>
                <strong>
                  Fotos atuais
                </strong>

                <p>
                  Clique, segure e
                  arraste a própria foto
                  para alterar a ordem.
                  A primeira será a capa.
                </p>
              </div>

              <span>
                {productImages.length}{" "}
                {productImages.length === 1
                  ? "foto"
                  : "fotos"}
              </span>
            </div>

            {productImages.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={
                  closestCenter
                }
                onDragEnd={
                  handleDragEnd
                }
              >
                <SortableContext
                  items={productImages.map(
                    (image) =>
                      image.id,
                  )}
                  strategy={
                    rectSortingStrategy
                  }
                >
                  <div className="product-image-preview">
                    {productImages.map(
                      (
                        image,
                        index,
                      ) => (
                        <SortableImage
                          key={image.id}
                          image={image}
                          index={index}
                          onDelete={
                            deleteProductImage
                          }
                        />
                      ),
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <p>
                Este produto não possui fotos.
              </p>
            )}

            {savingOrder && (
              <p>
                Salvando ordem das fotos...
              </p>
            )}

            <div
              style={{
                marginTop: "30px",
              }}
            >
              <div className="product-images-heading">
                <div>
                  <strong>
                    Adicionar novas fotos
                  </strong>

                  <p>
                    As novas fotos serão adicionadas
                    depois das fotos atuais.
                  </p>
                </div>

                <span>
                  {newImages.length}{" "}
                  {newImages.length === 1
                    ? "nova foto"
                    : "novas fotos"}
                </span>
              </div>

              <label className="product-image-upload">

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={
                    handleNewImages
                  }
                />

                <strong>
                  Selecionar novas fotos
                </strong>

                <span>
                  JPG, PNG ou WEBP
                </span>

              </label>
            </div>

            {newImages.length > 0 && (
              <div className="product-image-preview">
                {newImages.map(
                  (
                    image,
                    index,
                  ) => (
                    <article
                      key={`${image.name}-${index}`}
                    >
                      <div className="product-image-preview-photo">

                        <img
                          src={
                            URL.createObjectURL(
                              image,
                            )
                          }
                          alt={`Nova foto ${
                            index + 1
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeNewImage(
                              index,
                            )
                          }
                          aria-label="Remover nova foto"
                        >
                          ×
                        </button>

                      </div>

                      <p>
                        Foto{" "}
                        {productImages.length +
                          index +
                          1}
                      </p>
                    </article>
                  ),
                )}
              </div>
            )}

          </div>

          {message && (
            <div className="new-product-message">
              {message}
            </div>
          )}

          <button
            className="new-product-submit"
            type="submit"
            disabled={
              saving ||
              savingOrder
            }
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

export default EditProductPage