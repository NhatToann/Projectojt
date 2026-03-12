export async function registerApi(payload, { signal } = {}) {
  return requestJson('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
}

export async function loginApi(payload, { signal } = {}) {
  return requestJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
}

export async function googleLoginApi(payload, { signal } = {}) {
  return requestJson('/api/auth/google-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
}

export async function sendEmailOtpApi(payload, { signal } = {}) {
  return requestJson('/api/auth/send-email-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
}

export async function verifyEmailOtpApi(payload, { signal } = {}) {
  return requestJson('/api/auth/verify-email-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
}

export async function resetPasswordApi(payload, { signal } = {}) {
  return requestJson('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
}

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
