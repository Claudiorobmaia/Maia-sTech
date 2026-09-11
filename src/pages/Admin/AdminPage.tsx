import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { supabase } from "../../services/supabase"
import {
  getDashboardStats,
  type DashboardStats,
} from "../../services/dashboard"

import "./AdminPage.css"

function AdminPage() {
  const navigate = useNavigate()

  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    categories: 0,
    messages: 0,
  })

  const [loadingStats, setLoadingStats] =
    useState(true)

  useEffect(() => {
    async function loadStats() {
      const data = await getDashboardStats()

      setStats(data)
      setLoadingStats(false)
    }

    loadStats()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()

    navigate("/admin/login")
  }

  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>MAIA'S TECH</span>
          <strong>Admin</strong>
        </div>

        <nav className="admin-menu">
          <button className="active">
            Visão geral
          </button>

          <button
            onClick={() =>
              navigate("/admin/produtos")
            }
          >
            Produtos
          </button>

          <button
            onClick={() =>
              navigate("/admin/produtos/novo")
            }
          >
            + Novo produto
          </button>

          <button
            onClick={() =>
              navigate("/admin/categorias")
            }
          >
            Categorias
          </button>

          <button
            onClick={() =>
              navigate("/admin/mensagens")
            }
          >
            Mensagens
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
          >
            Ver site ↗
          </a>

          <button onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <div>
            <span>PAINEL ADMINISTRATIVO</span>
            <h1>Visão geral</h1>
          </div>

          <div className="admin-status">
            <span></span>
            Sistema online
          </div>
        </header>

        <section className="admin-stats">

          <article>
            <span>PRODUTOS</span>

            <strong>
              {loadingStats ? "—" : stats.products}
            </strong>

            <p>Produtos cadastrados</p>
          </article>

          <article>
            <span>CATEGORIAS</span>

            <strong>
              {loadingStats
                ? "—"
                : stats.categories}
            </strong>

            <p>Categorias disponíveis</p>
          </article>

          <article>
            <span>MENSAGENS</span>

            <strong>
              {loadingStats ? "—" : stats.messages}
            </strong>

            <p>Conversas no chat</p>
          </article>

        </section>

        <section className="admin-welcome">
          <span>MAIA'S TECH</span>

          <h2>
            Gerencie sua loja em um só lugar.
          </h2>

          <p>
            Cadastre produtos, envie fotos,
            altere preços, organize categorias
            e acompanhe as mensagens recebidas
            pelo site.
          </p>

          <button
            onClick={() =>
              navigate("/admin/produtos/novo")
            }
          >
            Cadastrar novo produto
          </button>
        </section>
      </main>
    </div>
  )
}

export default AdminPage