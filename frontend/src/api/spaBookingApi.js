async function requestJson(url, options) {
  const res = await fetch(url, options)
  const text = await res.text().catch(() => '')
  let data = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    const message = data?.message || text || `Request failed (${res.status})`
    throw new Error(message)
  }

  return data
}

export async function fetchSpaServices({ signal } = {}) {
  return requestJson('/api/spa-booking/services', { signal })
}

export async function fetchPets(customerId, { signal } = {}) {
  return requestJson(`/api/spa-booking/pets?customerId=${customerId}`, { signal })
}

export async function estimateSpaBooking(customerId, payload, { signal } = {}) {
  return requestJson(`/api/spa-booking/estimate?customerId=${customerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
}

export async function createSpaBooking(customerId, payload, { signal } = {}) {
  return requestJson(`/api/spa-booking?customerId=${customerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
}

export async function createSpaPayOSPayment(bookingId, payload, { signal } = {}) {
  return requestJson('/api/payos/spa/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, ...payload }),
    signal,
  })
}

export async function fetchSpaHistory(customerId, { signal } = {}) {
  return requestJson(`/api/spa-booking/history?customerId=${customerId}`, { signal })
}

export async function updateSpaBookingStatus(bookingId, status, { signal } = {}) {
  return requestJson(`/api/spa-booking/${bookingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
    signal,
  })
}

export async function submitSpaReview(customerId, payload, { signal } = {}) {
  return requestJson(`/api/spa-booking/review?customerId=${customerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
}

export async function fetchServiceReviews(serviceId, { signal } = {}) {
  return requestJson(`/api/reviews/services/${serviceId}`, { signal })
}
