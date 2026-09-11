import { supabase } from "./supabase"

import type { Category } from "../types/Category"

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, name, slug, description, image_url, image_path, created_at",
    )
    .order("id", { ascending: true })

  if (error) {
    console.error(
      "Erro ao carregar categorias:",
      error,
    )

    return []
  }

  return data ?? []
}