export async function fetchPetServices({ signal } = {}) {
  const res = await fetch('/api/pet-services', { signal })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Fetch services failed (${res.status}): ${text || res.statusText}`)
  }
  return await res.json()
}
