export async function fetchProducts({ signal } = {}) {
  const res = await fetch('/api/products-temp', { signal })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Fetch products failed (${res.status}): ${text || res.statusText}`)
  }
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

