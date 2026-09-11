import {
  useEffect,
  useRef,
  useState,
} from "react"

import ProductCard from "../ProductCard/ProductCard"

import { searchProducts } from "../../services/products"

import type { Product } from "../../types/Product"

import "./SearchModal.css"

type SearchModalProps = {
  open: boolean
  onClose: () => void
}

function SearchModal({
  open,
  onClose,
}: SearchModalProps) {
  const [term, setTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const inputRef =
    useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    )

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      )
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      return
    }

    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    const searchTerm = term.trim()

    if (searchTerm.length < 2) {
      setProducts([])
      setLoading(false)
      setSearched(false)
      return
    }

    setLoading(true)

    const timeout = window.setTimeout(
      async () => {
        try {
          const results =
            await searchProducts(searchTerm)

          setProducts(results)
          setSearched(true)
        } catch (error) {
          console.error(
            "Erro ao pesquisar produtos:",
            error,
          )

          setProducts([])
          setSearched(true)
        } finally {
          setLoading(false)
        }
      },
      350,
    )

    return () => {
      window.clearTimeout(timeout)
    }
  }, [term])

  function handleClose() {
    setTerm("")
    setProducts([])
    setSearched(false)
    setLoading(false)

    onClose()
  }

  if (!open) {
    return null
  }

  return (
    <div
      className="search-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose()
        }
      }}
    >
      <div
        className="search-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
      >
        <div className="search-modal-header">
          <div>
            <span className="search-modal-eyebrow">
              MAIA&apos;S TECH
            </span>

            <h2 id="search-modal-title">
              Buscar produtos
            </h2>

            <p>
              Encontre hardware e tecnologia
              pelo nome, marca ou modelo.
            </p>
          </div>

          <button
            type="button"
            className="search-modal-close"
            onClick={handleClose}
            aria-label="Fechar busca"
          >
            ×
          </button>
        </div>

        <div className="search-modal-field">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <input
            ref={inputRef}
            type="search"
            value={term}
            onChange={(event) =>
              setTerm(event.target.value)
            }
            placeholder="Ex.: RTX 4060, Ryzen, Kingston..."
            autoComplete="off"
          />

          {term && (
            <button
              type="button"
              className="search-modal-clear"
              onClick={() => setTerm("")}
              aria-label="Limpar pesquisa"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="search-modal-content">
          {term.trim().length < 2 ? (
            <div className="search-modal-empty">
              <div className="search-modal-empty-icon">
                ⌕
              </div>

              <h3>
                O que você está procurando?
              </h3>

              <p>
                Digite pelo menos 2 caracteres
                para começar a busca.
              </p>
            </div>
          ) : loading ? (
            <div className="search-modal-loading">
              <div className="search-modal-spinner" />

              <span>
                Buscando produtos...
              </span>
            </div>
          ) : searched &&
            products.length === 0 ? (
            <div className="search-modal-empty">
              <div className="search-modal-empty-icon">
                !
              </div>

              <h3>
                Nenhum produto encontrado
              </h3>

              <p>
                Tente pesquisar por outro
                nome, marca ou modelo.
              </p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="search-modal-results-header">
                <span>
                  {products.length}{" "}
                  {products.length === 1
                    ? "produto encontrado"
                    : "produtos encontrados"}
                </span>
              </div>

              <div className="search-modal-results">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={handleClose}
                  >
                    <ProductCard
                      product={product}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default SearchModal