import { useState } from "react"

import {
  Link,
  useNavigate,
} from "react-router-dom"

import SearchModal from "../Search/SearchModal"

import "./Header.css"

import logo from "../../assets/images/logo.jpeg"

function Header() {
  const navigate = useNavigate()

  const [searchOpen, setSearchOpen] =
    useState(false)

  function handleHome() {
    setSearchOpen(false)

    if (
      window.location.pathname === "/"
    ) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })

      return
    }

    navigate("/")

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 100)
  }

  function handleExplore() {
    if (
      window.location.pathname === "/"
    ) {
      const section =
        document.getElementById(
          "categorias",
        )

      section?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })

      return
    }

    navigate("/")

    window.setTimeout(() => {
      const section =
        document.getElementById(
          "categorias",
        )

      section?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 150)
  }

  function handleOpenChat() {
    setSearchOpen(false)

    window.dispatchEvent(
      new Event(
        "maiastech:open-chat",
      ),
    )
  }

  return (
    <>
      <header className="header">
        <div className="header-container">
          <button
            type="button"
            className="header-logo header-logo-button"
            aria-label="Ir para o início"
            onClick={handleHome}
          >
            <img
              src={logo}
              alt="Maia's Tech"
            />
          </button>

          <nav
            className="header-nav"
            aria-label="Navegação principal"
          >
            <button
              type="button"
              className="header-nav-link"
              onClick={handleHome}
            >
              Início
            </button>

            <button
              type="button"
              className="header-nav-link"
              onClick={handleExplore}
            >
              Explorar
            </button>

            <Link
              to="/quem-somos"
              className="header-nav-link"
              onClick={() => {
                window.setTimeout(() => {
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }, 50)
              }}
            >
              Quem somos
            </Link>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="header-search"
              aria-label="Buscar produtos"
              onClick={() =>
                setSearchOpen(true)
              }
            >
              Buscar
            </button>

            <button
              type="button"
              className="header-chat"
              aria-label="Abrir atendimento"
              onClick={handleOpenChat}
            >
              Chat
            </button>
          </div>
        </div>
      </header>

      <SearchModal
        open={searchOpen}
        onClose={() =>
          setSearchOpen(false)
        }
      />
    </>
  )
}

export default Header