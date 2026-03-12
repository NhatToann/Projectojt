import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { googleLoginApi, loginApi } from "../api/authApi"
import "../styles/auth.css"

const GOOGLE_IDENTITY_SCRIPT_ID = "google-identity-services-script"

export default function LoginPage(){

  const navigate = useNavigate()
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [loginResult, setLoginResult] = useState(null)
  const [googleClientId, setGoogleClientId] = useState("")
  const [googleReady, setGoogleReady] = useState(false)

  const googleInitializedRef = useRef(false)

  const isDisabled = useMemo(() => loading, [loading])

  useEffect(() => {
    let mounted = true

    async function loadGoogleClientId() {
      const envClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim()

      if (envClientId) {
        if (mounted) {
          setGoogleClientId(envClientId)
        }
        return
      }

      try {
        const res = await fetch("/api/auth/google-client-id")
        if (!res.ok) {
          return
        }

        const data = await res.json()
        const clientId = (data?.clientId || "").trim()

        if (mounted && clientId) {
          setGoogleClientId(clientId)
        }
      } catch {
        // ignore
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
        return
      }

      googleObj.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          const token = response?.credential || ""
          if (!token) {
            setError("Không lấy được ID Token từ Google.")
            return
          }

          setError("")
          setLoading(true)

          try {
            const data = await googleLoginApi({ idToken: token })
            setLoginResult(data)
            localStorage.setItem("authUser", JSON.stringify(data))
            navigate("/", { replace: true })
          } catch (err) {
            setError(err?.message || "Đăng nhập Google thất bại")
          } finally {
            setLoading(false)
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
        existingScript.addEventListener("load", setupGoogleIdentity, { once: true })
      }
      return
    }

    const script = document.createElement("script")
    script.id = GOOGLE_IDENTITY_SCRIPT_ID
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = setupGoogleIdentity
    script.onerror = () => setError("Không tải được Google Identity Services script.")

    document.head.appendChild(script)
  }, [googleClientId, navigate])

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setError("")
    setLoginResult(null)

    if (!email.trim() || !password.trim()) {
      setError("Vui lòng nhập Email và mật khẩu")
      return
    }

    setLoading(true)
    try {
      const payload = {
        email: email.trim(),
        password,
      }
      const data = await loginApi(payload)
      setLoginResult(data)
      localStorage.setItem("authUser", JSON.stringify(data))
      navigate("/", { replace: true })
    } catch (err) {
      setError(err?.message || "Đăng nhập thất bại")
    } finally {
      setLoading(false)
    }
  }

  function onToggleForgot() {
    setForgotOpen((prev) => {
      const next = !prev
      if (next) {
        setForgotStep(1)
        setOtpForm((s) => ({ ...s, email: email.trim() }))
      } else {
        setForgotStep(1)
        setOtpForm({ email: "", otpCode: "" })
        setResetForm({ email: "", newPassword: "", confirmPassword: "" })
        setResetToken("")
        setOtpResult(null)
        setOtpError("")
        setResetError("")
        setResetResult(null)
      }
      return next
    })
  }

  async function onSendOtp(e) {
    e.preventDefault()
    setOtpError("")
    setOtpResult(null)

    if (!otpForm.email.trim()) {
      setOtpError("Vui lòng nhập email để gửi OTP")
      return
    }

    setSendOtpLoading(true)
    try {
      const data = await sendEmailOtpApi({ email: otpForm.email.trim() })
      setOtpResult(data)
      setResetForm((s) => ({ ...s, email: otpForm.email.trim() }))
      setResetToken("")
      setForgotStep(2)
    } catch (err) {
      setOtpError(err?.message || "Gửi OTP thất bại")
    } finally {
      setSendOtpLoading(false)
    }
  }

  async function onVerifyOtp(e) {
    e.preventDefault()
    setOtpError("")

    if (!otpForm.email.trim() || !otpForm.otpCode.trim()) {
      setOtpError("Vui lòng nhập email và OTP")
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
      setResetToken(data?.message || "")
      setForgotStep(3)
    } catch (err) {
      setOtpError(err?.message || "Xác minh OTP thất bại")
    } finally {
      setVerifyOtpLoading(false)
    }
  }

  async function onResetPassword(e) {
    e.preventDefault()
    setResetError("")
    setResetResult(null)

    if (!resetForm.email.trim()) {
      setResetError("Vui lòng nhập email")
      return
    }

    if (!resetForm.newPassword.trim() || !resetForm.confirmPassword.trim()) {
      setResetError("Vui lòng nhập mật khẩu mới và xác nhận")
      return
    }

    if (!resetToken) {
      setResetError("Reset token chưa được tạo. Hãy xác minh OTP trước.")
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
      setResetError(err?.message || "Reset mật khẩu thất bại")
    } finally {
      setResetLoading(false)
    }
  }

  const handleGoogleLogin = ()=>{
    setError("")

    if (!googleReady || !window.google?.accounts?.id) {
      setError("Google Login chưa sẵn sàng. Vui lòng thử lại sau vài giây.")
      return
    }

    window.google.accounts.id.prompt()
  }

  return(

    <div className="auth-page">

      {/* LOGO */}
      <Link to="/" className="logo-home">
        🐾 PetShop
      </Link>


        {/* BÊN TRÁI */}
        <div className="auth-left">
          <h2>Chào mừng trở lại</h2>
          <p>Vui lòng đăng nhập vào tài khoản của bạn</p>
        </div>

        {/* FORM */}
        <div className="auth-right">

          <h3>ĐĂNG NHẬP</h3>

          <form onSubmit={handleSubmit}>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              disabled={isDisabled}
            />

            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              disabled={isDisabled}
            />

            <Link to="/forgot-password" className="forgot">
              Quên mật khẩu?
            </Link>

            <button type="submit" disabled={isDisabled}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

          </form>

          {error ? <div className="auth-error">{error}</div> : null}
          {loginResult ? (
            <div className="auth-success">
              Đăng nhập thành công: {loginResult?.name} ({loginResult?.role})
            </div>
          ) : null}


          {/* GOOGLE LOGIN */}
          <button
            type="button"
            className="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={isDisabled || !googleReady}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="google"
            />
            <span>{loading ? "Đang đăng nhập..." : "Đăng nhập với Google"}</span>
          </button>

          <p>
            Chưa có tài khoản?
            <Link to="/register"> Đăng ký</Link>
          </p>

        </div>

      </div>


  )
}