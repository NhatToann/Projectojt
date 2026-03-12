import { useEffect, useMemo, useRef, useState } from 'react'
import {
  googleLoginApi,
  loginApi,
  registerApi,
  resetPasswordApi,
  sendEmailOtpApi,
  verifyEmailOtpApi,
} from '../api/authApi'

const initialRegister = {
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
}

const initialLogin = {
  email: '',
  password: '',
}

const initialOtp = {
  email: '',
  otpCode: '',
}

const initialResetPassword = {
  email: '',
  newPassword: '',
  confirmPassword: '',
}

const GOOGLE_IDENTITY_SCRIPT_ID = 'google-identity-services-script'

export default function AuthTester({ onLogin }) {
  const [registerForm, setRegisterForm] = useState(initialRegister)
  const [loginForm, setLoginForm] = useState(initialLogin)
  const [otpForm, setOtpForm] = useState(initialOtp)
  const [resetForm, setResetForm] = useState(initialResetPassword)
  const [resetToken, setResetToken] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState(1)

  const [registerLoading, setRegisterLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [sendOtpLoading, setSendOtpLoading] = useState(false)
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const [registerResult, setRegisterResult] = useState(null)
  const [loginResult, setLoginResult] = useState(null)
  const [googleResult, setGoogleResult] = useState(null)
  const [otpResult, setOtpResult] = useState(null)
  const [resetResult, setResetResult] = useState(null)

  const [registerError, setRegisterError] = useState('')
  const [loginError, setLoginError] = useState('')
  const [googleError, setGoogleError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resetError, setResetError] = useState('')

  const [googleClientId, setGoogleClientId] = useState('')
  const [googleReady, setGoogleReady] = useState(false)

  const googleInitializedRef = useRef(false)

  const isBusy = useMemo(
    () =>
      registerLoading ||
      loginLoading ||
      googleLoading ||
      sendOtpLoading ||
      verifyOtpLoading ||
      resetLoading,
    [registerLoading, loginLoading, googleLoading, sendOtpLoading, verifyOtpLoading, resetLoading],
  )

  useEffect(() => {
    let mounted = true

    async function loadGoogleClientId() {
      const envClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()

      if (envClientId) {
        if (mounted) {
          setGoogleClientId(envClientId)
          setGoogleError('')
        }
        return
      }

      try {
        const res = await fetch('/api/auth/google-client-id')
        if (!res.ok) {
          const errorText = await res.text().catch(() => '')
          if (mounted) {
            setGoogleError(`Không lấy được Google Client ID từ backend (HTTP ${res.status}). ${errorText || ''}`.trim())
          }
          return
        }

        const data = await res.json()
        const clientId = (data?.clientId || '').trim()

        if (!clientId) {
          if (mounted) setGoogleError('Google Client ID chưa cấu hình.')
          return
        }

        if (mounted) {
          setGoogleClientId(clientId)
          setGoogleError('')
        }
      } catch (err) {
        if (mounted) {
          setGoogleError(`Không thể tải cấu hình Google Login. ${err?.message || ''}`.trim())
        }
      }
    }

    loadGoogleClientId()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!googleClientId || googleInitializedRef.current) {
      return
    }

    const setupGoogleIdentity = () => {
      const googleObj = window.google
      if (!googleObj?.accounts?.id) {
        setGoogleError('Google Identity chưa sẵn sàng.')
        return
      }

      googleObj.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          const token = response?.credential || ''
          if (!token) {
            setGoogleError('Không lấy được ID Token từ Google.')
            return
          }

          setGoogleError('')
          setGoogleResult(null)
          setGoogleLoading(true)

          try {
            const data = await googleLoginApi({ idToken: token })
            setGoogleResult(data)
            setOtpForm((s) => ({ ...s, email: data?.email || s.email }))
          } catch (err) {
            setGoogleError(err?.message || 'Google login failed')
          } finally {
            setGoogleLoading(false)
          }
        },
      })

      googleInitializedRef.current = true
      setGoogleReady(true)
    }

    const existingScript = document.getElementById(GOOGLE_IDENTITY_SCRIPT_ID)

    if (existingScript) {
      if (window.google?.accounts?.id) {
        setupGoogleIdentity()
      } else {
        existingScript.addEventListener('load', setupGoogleIdentity, { once: true })
      }
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_IDENTITY_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = setupGoogleIdentity
    script.onerror = () => setGoogleError('Không tải được Google Identity Services script.')

    document.head.appendChild(script)
  }, [googleClientId])

  function fillDemoData() {
    const stamp = Date.now()
    const demoEmail = `test${stamp}@petshop.local`
    const demoPassword = '123456'

    setRegisterForm({
      name: 'Test User',
      email: demoEmail,
      password: demoPassword,
      phone: '0900000000',
      address: 'Ha Noi',
    })

    setLoginForm({
      email: demoEmail,
      password: demoPassword,
    })

    setOtpForm((s) => ({ ...s, email: demoEmail }))
    setResetForm((s) => ({ ...s, email: demoEmail, newPassword: demoPassword, confirmPassword: demoPassword }))
  }

  function onToggleForgot() {
    setForgotOpen((prev) => {
      const next = !prev
      if (next) {
        setForgotStep(1)
      } else {
        setOtpForm(initialOtp)
        setResetForm(initialResetPassword)
        setResetToken('')
        setOtpResult(null)
        setResetResult(null)
        setOtpError('')
        setResetError('')
        setForgotStep(1)
      }
      return next
    })
  }

  async function onRegisterSubmit(e) {
    e.preventDefault()
    setRegisterError('')
    setRegisterResult(null)

    if (!registerForm.name.trim() || !registerForm.email.trim() || !registerForm.password.trim()) {
      setRegisterError('Vui lòng nhập Name, Email, Password')
      return
    }

    setRegisterLoading(true)
    try {
      const payload = {
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
        phone: registerForm.phone.trim() || null,
        address: registerForm.address.trim() || null,
      }

      const data = await registerApi(payload)
      setRegisterResult(data)
      setLoginForm((s) => ({ ...s, email: payload.email, password: payload.password }))
      setOtpForm((s) => ({ ...s, email: payload.email }))
    } catch (err) {
      setRegisterError(err?.message || 'Register failed')
    } finally {
      setRegisterLoading(false)
    }
  }

  async function onLoginSubmit(e) {
    e.preventDefault()
    setLoginError('')
    setLoginResult(null)

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setLoginError('Vui lòng nhập Email và Password')
      return
    }

    setLoginLoading(true)
    try {
      const payload = {
        email: loginForm.email.trim(),
        password: loginForm.password,
      }

      const data = await loginApi(payload)
      setLoginResult(data)
      if (typeof onLogin === 'function') {
        onLogin(data)
      }
    } catch (err) {
      setLoginError(err?.message || 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  function onGoogleSignIn() {
    setGoogleError('')
    setGoogleResult(null)

    if (!googleReady || !window.google?.accounts?.id) {
      setGoogleError('Google Login chưa sẵn sàng. Vui lòng thử lại sau vài giây.')
      return
    }

    window.google.accounts.id.prompt()
  }

  async function onSendOtp(e) {
    e.preventDefault()
    setOtpError('')
    setOtpResult(null)

    if (!otpForm.email.trim()) {
      setOtpError('Vui lòng nhập email để gửi OTP')
      return
    }

    setSendOtpLoading(true)
    try {
      const data = await sendEmailOtpApi({ email: otpForm.email.trim() })
      setOtpResult(data)
      setResetForm((s) => ({ ...s, email: otpForm.email.trim() }))
      setResetToken('')
      setForgotStep(2)
    } catch (err) {
      setOtpError(err?.message || 'Send OTP failed')
    } finally {
      setSendOtpLoading(false)
    }
  }

  async function onVerifyOtp(e) {
    e.preventDefault()
    setOtpError('')

    if (!otpForm.email.trim() || !otpForm.otpCode.trim()) {
      setOtpError('Vui lòng nhập email và OTP')
      return
    }

    setVerifyOtpLoading(true)
    try {
      const data = await verifyEmailOtpApi({
        email: otpForm.email.trim(),
        otpCode: otpForm.otpCode.trim(),
      })
      setOtpResult(data)
      setResetForm((s) => ({ ...s, email: otpForm.email.trim() }))
      setResetToken(data?.message || '')
      setForgotStep(3)
    } catch (err) {
      setOtpError(err?.message || 'Verify OTP failed')
    } finally {
      setVerifyOtpLoading(false)
    }
  }

  async function onResetPassword(e) {
    e.preventDefault()
    setResetError('')
    setResetResult(null)

    if (!resetForm.email.trim()) {
      setResetError('Vui lòng nhập email')
      return
    }

    if (!resetForm.newPassword.trim() || !resetForm.confirmPassword.trim()) {
      setResetError('Vui lòng nhập mật khẩu mới và xác nhận')
      return
    }

    if (!resetToken) {
      setResetError('Reset token chưa được tạo. Hãy xác minh OTP trước.')
      return
    }

    setResetLoading(true)
    try {
      const payload = {
        email: resetForm.email.trim(),
        resetToken,
        newPassword: resetForm.newPassword,
        confirmPassword: resetForm.confirmPassword,
      }

      const data = await resetPasswordApi(payload)
      setResetResult(data)
    } catch (err) {
      setResetError(err?.message || 'Reset password failed')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <section className="auth-wrap">
      <div className="auth-head">
        <h2>Auth Test</h2>
        <div className="muted">Test nhanh API: register, login, google-login, send-email-otp, verify-email-otp</div>
        <div className="auth-actions">
          <button type="button" className="btn ghost" onClick={fillDemoData} disabled={isBusy}>
            Điền dữ liệu mẫu
          </button>
        </div>
      </div>

      <div className="auth-grid">
        <form onSubmit={onRegisterSubmit} className="auth-card">
          <h3>Register</h3>
          <Input label="Name" value={registerForm.name} onChange={(v) => setRegisterForm((s) => ({ ...s, name: v }))} required />
          <Input label="Email" value={registerForm.email} onChange={(v) => setRegisterForm((s) => ({ ...s, email: v }))} type="email" required />
          <Input
            label="Password"
            value={registerForm.password}
            onChange={(v) => setRegisterForm((s) => ({ ...s, password: v }))}
            type="password"
            required
          />
          <Input label="Phone" value={registerForm.phone} onChange={(v) => setRegisterForm((s) => ({ ...s, phone: v }))} />
          <Input label="Address" value={registerForm.address} onChange={(v) => setRegisterForm((s) => ({ ...s, address: v }))} />

          <button className="btn" type="submit" disabled={isBusy}>
            {registerLoading ? 'Đang register...' : 'Register'}
          </button>

          {registerError ? <Message type="error" text={registerError} /> : null}
          {registerResult ? <JsonBox data={registerResult} /> : null}
        </form>

        <form onSubmit={onLoginSubmit} className="auth-card">
          <h3>Login</h3>
          <Input label="Email" value={loginForm.email} onChange={(v) => setLoginForm((s) => ({ ...s, email: v }))} type="email" required />
          <Input
            label="Password"
            value={loginForm.password}
            onChange={(v) => setLoginForm((s) => ({ ...s, password: v }))}
            type="password"
            required
          />

          <button className="btn" type="submit" disabled={isBusy}>
            {loginLoading ? 'Đang login...' : 'Login'}
          </button>

          {loginError ? <Message type="error" text={loginError} /> : null}
          {loginResult ? <JsonBox data={loginResult} /> : null}
        </form>

        <div className="auth-card">
          <h3>Google Login</h3>

          <button className="btn" type="button" disabled={isBusy || !googleReady} onClick={onGoogleSignIn}>
            {googleLoading ? 'Đang login Google...' : 'Đăng nhập với Google'}
          </button>

          {!googleReady ? <div className="muted" style={{ marginTop: 8 }}>Đang khởi tạo Google Sign-In...</div> : null}

          {googleError ? <Message type="error" text={googleError} /> : null}
          {googleResult ? <JsonBox data={googleResult} /> : null}
        </div>

        <div className="auth-card">
          <h3>Forgot Password</h3>
          <div className="muted">Nhấn để bắt đầu flow reset mật khẩu (email → OTP → mật khẩu mới).</div>
          <div className="auth-actions" style={{ marginTop: 12 }}>
            <button type="button" className="btn ghost" onClick={onToggleForgot} disabled={isBusy}>
              {forgotOpen ? 'Đóng Forgot Password' : 'Bắt đầu Forgot Password'}
            </button>
          </div>

          {forgotOpen ? (
            <div className="forgot-flow">
              {forgotStep === 1 ? (
                <div className="step">
                  <div className="step-title">Bước 1: Nhập email để gửi OTP</div>
                  <Input label="Email" value={otpForm.email} onChange={(v) => setOtpForm((s) => ({ ...s, email: v }))} type="email" />
                  <button className="btn" type="button" disabled={isBusy} onClick={onSendOtp}>
                    {sendOtpLoading ? 'Đang gửi OTP...' : 'Gửi OTP'}
                  </button>
                  {otpError ? <Message type="error" text={otpError} /> : null}
                  {otpResult ? <JsonBox data={otpResult} /> : null}
                </div>
              ) : null}

              {forgotStep === 2 ? (
                <div className="step">
                  <div className="step-title">Bước 2: Nhập OTP</div>
                  <Input label="OTP Code" value={otpForm.otpCode} onChange={(v) => setOtpForm((s) => ({ ...s, otpCode: v }))} />
                  <button className="btn" type="button" disabled={isBusy} onClick={onVerifyOtp}>
                    {verifyOtpLoading ? 'Đang xác minh...' : 'Xác minh OTP'}
                  </button>
                  {otpError ? <Message type="error" text={otpError} /> : null}
                </div>
              ) : null}

              {forgotStep === 3 ? (
                <form onSubmit={onResetPassword} className="step">
                  <div className="step-title">Bước 3: Đặt mật khẩu mới</div>
                  <Input label="Email" value={resetForm.email} onChange={(v) => setResetForm((s) => ({ ...s, email: v }))} type="email" required />
                  <Input
                    label="New Password"
                    value={resetForm.newPassword}
                    onChange={(v) => setResetForm((s) => ({ ...s, newPassword: v }))}
                    type="password"
                    required
                  />
                  <Input
                    label="Confirm Password"
                    value={resetForm.confirmPassword}
                    onChange={(v) => setResetForm((s) => ({ ...s, confirmPassword: v }))}
                    type="password"
                    required
                  />

                  <button className="btn" type="submit" disabled={isBusy}>
                    {resetLoading ? 'Đang reset...' : 'Reset Password'}
                  </button>

                  {resetError ? <Message type="error" text={resetError} /> : null}
                  {resetToken ? <Message type="success" text="Reset token đã tạo. Có thể đặt mật khẩu mới." /> : null}
                  {resetResult ? <JsonBox data={resetResult} /> : null}
                </form>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function Input({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </label>
  )
}

function Message({ type, text }) {
  return <div className={`msg ${type}`}>{text}</div>
}

function JsonBox({ data }) {
  return (
    <pre className="json-box" aria-label="json-response">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
