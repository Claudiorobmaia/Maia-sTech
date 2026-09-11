import { supabase } from "./supabase"

import type { Product } from "../types/Product"

export async function searchProducts(
  term: string,
): Promise<Product[]> {
  const searchTerm = term.trim()

  if (!searchTerm) {
    return []
  }

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      category_id,
      name,
      slug,
      brand,
      model,
      condition,
      price,
      description,
      stock,
      featured,
      active,
      product_images (
        id,
        image_url,
        alt_text,
        position
      )
    `)
    .eq("active", true)
    .or(
      [
        `name.ilike.%${searchTerm}%`,
        `brand.ilike.%${searchTerm}%`,
        `model.ilike.%${searchTerm}%`,
        `description.ilike.%${searchTerm}%`,
      ].join(","),
    )
    .order("position", {
      referencedTable: "product_images",
      ascending: true,
    })

  if (error) {
    console.error(
      "Erro ao buscar produtos:",
      error,
    )

    return []
  }

  return (data ?? []) as Product[]
}

export async function getProductsByCategory(
  categorySlug: string,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      category_id,
      name,
      slug,
      brand,
      model,
      condition,
      price,
      description,
      stock,
      featured,
      active,
      product_images (
        id,
        image_url,
        alt_text,
        position
      ),
      categories!inner (
        slug
      )
    `)
    .eq(
      "categories.slug",
      categorySlug,
    )
    .eq("active", true)
    .order("position", {
      referencedTable:
        "product_images",
      ascending: true,
    })

  if (error) {
    console.error(
      "Erro ao carregar produtos:",
      error,
    )

    return []
  }

  return (data ?? []) as Product[]
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      category_id,
      name,
      slug,
      brand,
      model,
      condition,
      price,
      description,
      stock,
      featured,
      active,
      product_images (
        id,
        image_url,
        alt_text,
        position
      ),
      product_specs (
        id,
        name,
        value,
        position
      )
    `)
    .eq("slug", slug)
    .eq("active", true)
    .single()

  if (error) {
    console.error(
      "Erro ao carregar produto:",
      error,
    )

    return null
  }

  return data as Product
}