import { supabase } from "./supabase"

export type DashboardStats = {
  products: number
  categories: number
  messages: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const productsResult = await supabase
    .from("products")
    .select("id")

  const categoriesResult = await supabase
    .from("categories")
    .select("id")

  if (productsResult.error) {
    console.error(
      "Erro ao carregar produtos:",
      productsResult.error,
    )
  }

  if (categoriesResult.error) {
    console.error(
      "Erro ao carregar categorias:",
      categoriesResult.error,
    )
  }

  return {
    products: productsResult.data?.length ?? 0,
    categories: categoriesResult.data?.length ?? 0,
    messages: 0,
  }
}