const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api"

type RequestOptions = RequestInit & {
  isFormData?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem("neri_token")
  const headers = new Headers(options.headers)

  if (!options.isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed")
  }

  return data as T
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "No Data Found"
  return `${Math.round(value)}%`
}
