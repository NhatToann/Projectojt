export async function getFeaturedProducts(limit = 8, { signal } = {}) {
  const res = await fetch(`/api/products-temp?limit=${limit}`, { signal })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Fetch products failed (${res.status}): ${text || res.statusText}`)
  }

  return await res.json()
}