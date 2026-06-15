const BASE_URL = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL || ""

export interface ApiError extends Error {
  status?: number
  info?: any
}

export async function apiClient<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.") as ApiError
    error.status = response.status
    try {
      error.info = await response.json()
    } catch {
      error.info = await response.text()
    }
    throw error
  }

  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json() as Promise<T>
  }
  return response.text() as unknown as T
}
