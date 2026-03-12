export async function fetchProducts_temp({ signal } = {}) {
  const res = await fetch('/api/products-temp', { signal })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Fetch products failed (${res.status}): ${text || res.statusText}`)
  }
  return await res.json()
}

