import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom"

import HomePage from "./pages/Home/HomePage"
import CategoryPage from "./pages/Category/CategoryPage"
import ProductPage from "./pages/Product/ProductPage"
import AboutPage from "./pages/About/AboutPage"

import LoginPage from "./pages/Admin/LoginPage"
import AdminPage from "./pages/Admin/AdminPage"
import EditProductPage from "./pages/Admin/EditProductPage"
import NewProductPage from "./pages/Admin/NewProductPage"
import ProductsPage from "./pages/Admin/ProductsPage"
import CategoriesPage from "./pages/Admin/CategoriesPage"
import NewCategoryPage from "./pages/Admin/NewCategoryPage"
import EditCategoryPage from "./pages/Admin/EditCategoryPage"
import MessagesPage from "./pages/Admin/MessagesPage"
import ConversationPage from "./pages/Admin/ConversationPage"
import ResetPasswordPage from "./pages/Admin/ResetPasswordPage"

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"
import ChatWidget from "./components/Chat/ChatWidget"
import Footer from "./components/Footer/Footer"

function App() {
  const location = useLocation()

  const isAdmin =
    location.pathname.startsWith(
      "/admin",
    )

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/quem-somos"
          element={<AboutPage />}
        />

        <Route
          path="/categoria/:slug"
          element={<CategoryPage />}
        />

        <Route
          path="/produto/:slug"
          element={<ProductPage />}
        />

        <Route
          path="/admin/login"
          element={<LoginPage />}
        />

        <Route
          path="/admin/redefinir-senha"
          element={<ResetPasswordPage />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/produtos"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/produtos/novo"
          element={
            <ProtectedRoute>
              <NewProductPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/produtos/:id/editar"
          element={
            <ProtectedRoute>
              <EditProductPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categorias"
          element={
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categorias/nova"
          element={
            <ProtectedRoute>
              <NewCategoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categorias/:id/editar"
          element={
            <ProtectedRoute>
              <EditCategoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/mensagens"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/mensagens/:id"
          element={
            <ProtectedRoute>
              <ConversationPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!isAdmin && <Footer />}

      <ChatWidget />
    </>
  )
}

export default App