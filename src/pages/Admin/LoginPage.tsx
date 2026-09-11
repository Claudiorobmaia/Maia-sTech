import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { supabase } from "../../services/supabase"

import "./LoginPage.css"

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setErrorMessage("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage("E-mail ou senha inválidos.")
      setLoading(false)
      return
    }

    navigate("/admin")
  }

  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <span className="admin-login-label">
          MAIA'S TECH
        </span>

        <h1>Painel administrativo</h1>

        <p>
          Entre com seu usuário administrador para gerenciar produtos,
          categorias, fotos e mensagens.
        </p>

        <form onSubmit={handleLogin}>
          <label>
            E-mail

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
            />
          </label>

          <label>
            Senha

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              autoComplete="current-password"
            />
          </label>

          {errorMessage && (
            <div className="admin-login-error">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <Link className="admin-forgot-password" to="/admin/redefinir-senha"> Esqueci minha senha </Link>
        </form>
      </div>
    </main>
  )
}

export default LoginPage