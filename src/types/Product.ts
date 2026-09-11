export type ProductImage = {
  id: number
  image_url: string
  alt_text: string | null
  position: number
}

export type ProductSpec = {
  id: number
  name: string
  value: string
  position: number
}

export type Product = {
  id: number
  category_id: number | null
  name: string
  slug: string
  brand: string | null
  model: string | null
  condition: "novo" | "seminovo" | "usado"
  price: number
  description: string | null
  stock: number
  featured: boolean
  active: boolean
  product_images: ProductImage[]
  product_specs?: ProductSpec[]
}