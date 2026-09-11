import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../../services/supabase"
import "./LoginPage.css"

function ResetPasswordPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [recoveryMode, setRecoveryMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        setRecoveryMode(true)
      }
    }

    checkSession()

    const { data } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setRecoveryMode(true)
        }
      },
    )

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  async function handleRecoveryEmail(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setLoading(true)
    setMessage("")
    setErrorMessage("")

    const redirectTo =
      `${window.location.origin}/admin/redefinir-senha`

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo,
        },
      )

    if (error) {
      console.error(
        "Erro ao enviar recuperação:",
        error,
      )

      setErrorMessage(
        "Não foi possível enviar o e-mail de recuperação.",
      )

      setLoading(false)
      return
    }

    setMessage(
      "Enviamos um link para seu e-mail. Abra o link para criar uma nova senha.",
    )

    setLoading(false)
  }

  async function handleNewPassword(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setMessage("")
    setErrorMessage("")

    if (password.length < 6) {
      setErrorMessage(
        "A senha precisa ter pelo menos 6 caracteres.",
      )
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "As duas senhas precisam ser iguais.",
      )
      return
    }

    setLoading(true)

    const { error } =
      await supabase.auth.updateUser({
        password,
      })

    if (error) {
      console.error(
        "Erro ao alterar senha:",
        error,
      )

      setErrorMessage(
        "Não foi possível alterar a senha. Solicite um novo link.",
      )

      setLoading(false)
      return
    }

    setMessage(
      "Senha alterada com sucesso!",
    )

    await supabase.auth.signOut()

    setTimeout(() => {
      navigate("/admin/login")
    }, 1200)
  }

  return (
    <main className="admin-login">
      <div className="admin-login-card">

        <span className="admin-login-label">
          MAIA'S TECH
        </span>

        <h1>
          {recoveryMode
            ? "Criar nova senha"
            : "Recuperar senha"}
        </h1>

        <p>
          {recoveryMode
            ? "Digite e confirme sua nova senha."
            : "Informe o e-mail do administrador para receber o link de recuperação."}
        </p>

        {recoveryMode ? (
          <form onSubmit={handleNewPassword}>

            <label>
              Nova senha

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>

            <label>
              Confirmar nova senha

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>

            {errorMessage && (
              <div className="admin-login-error">
                {errorMessage}
              </div>
            )}

            {message && (
              <div className="admin-login-success">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Alterando..."
                : "Salvar nova senha"}
            </button>

          </form>
        ) : (
          <form onSubmit={handleRecoveryEmail}>

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

            {errorMessage && (
              <div className="admin-login-error">
                {errorMessage}
              </div>
            )}

            {message && (
              <div className="admin-login-success">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Enviando..."
                : "Enviar link de recuperação"}
            </button>

          </form>
        )}

        <Link
          className="admin-forgot-password"
          to="/admin/login"
        >
          ← Voltar para o login
        </Link>

      </div>
    </main>
  )
}

export default ResetPasswordPage