import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

import { supabase } from "../../services/supabase"

type ProtectedRouteProps = {
  children: React.ReactNode
}

function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] =
    useState(false)

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setAuthenticated(Boolean(session))
      setLoading(false)
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthenticated(Boolean(session))
        setLoading(false)
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div>Verificando acesso...</div>
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedRoute