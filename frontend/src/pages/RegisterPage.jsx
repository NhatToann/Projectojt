import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerApi, sendEmailOtpApi, verifyEmailOtpApi } from "../api/authApi"
import "../styles/auth.css"

export default function RegisterPage(){

  const navigate = useNavigate()

  const [form,setForm] = useState({
    name:"",
    email:"",
    password:"",
    phone:"",
    address:""
  })
  const [otpForm, setOtpForm] = useState({
    email: "",
    otpCode: "",
  })
  const [step, setStep] = useState("register")
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e)=>{
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleOtpChange = (e) => {
    setOtpForm({
      ...otpForm,
      [e.target.name]: e.target.value,
    })
  }

  useEffect(() => {
    if (step !== "otp" || resendCountdown <= 0) {
      return
    }

    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [step, resendCountdown])

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Vui lòng nhập đầy đủ Họ và tên, Email, Mật khẩu.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      }

      await registerApi(payload)
      setSuccess("Đã gửi OTP đến email. Vui lòng nhập OTP để kích hoạt tài khoản.")
      setOtpForm({
        email: payload.email,
        otpCode: "",
      })
      setResendCountdown(120)
      setStep("otp")
    } catch (err) {
      setError(err?.message || "Đăng ký thất bại")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!otpForm.email.trim() || !otpForm.otpCode.trim()) {
      setError("Vui lòng nhập email và OTP.")
      return
    }

    setOtpLoading(true)
    try {
      await verifyEmailOtpApi({
        email: otpForm.email.trim(),
        otpCode: otpForm.otpCode.trim(),
      })
      setSuccess("Xác thực OTP thành công. Vui lòng đăng nhập.")
      setResendCountdown(0)
      setTimeout(() => navigate("/login"), 800)
    } catch (err) {
      setError(err?.message || "Xác thực OTP thất bại")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resendLoading) {
      return
    }

    setError("")
    setSuccess("")

    if (!otpForm.email.trim()) {
      setError("Vui lòng nhập email để gửi lại OTP.")
      return
    }

    setResendLoading(true)
    try {
      await sendEmailOtpApi({ email: otpForm.email.trim() })
      setSuccess("Đã gửi lại OTP đến email của bạn.")
      setResendCountdown(120)
    } catch (err) {
      setError(err?.message || "Gửi lại OTP thất bại")
    } finally {
      setResendLoading(false)
    }
  }

  const handleGoogleLogin = ()=>{
    console.log("Đăng nhập bằng Google")
  }

  return(

    <div className="auth-page">

      {/* LOGO */}
      <Link to="/" className="logo-home">
        🐾 PetShop
      </Link>


        {/* BÊN TRÁI */}
        <div className="auth-left">
          <h2>Tạo tài khoản</h2>
          <p>Tham gia cùng chúng tôi ngay hôm nay</p>
        </div>

        {/* FORM */}
        <div className="auth-right">

          <h3>{step === "register" ? "ĐĂNG KÝ" : "XÁC THỰC OTP"}</h3>

          {step === "register" ? (
            <form onSubmit={handleSubmit}>

              <input
                name="name"
                placeholder="Họ và tên"
                onChange={handleChange}
                value={form.name}
                required
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                value={form.email}
                required
              />

              <input
                name="phone"
                placeholder="Số điện thoại"
                onChange={handleChange}
                value={form.phone}
                required
              />

              <input
                name="address"
                placeholder="Địa chỉ"
                onChange={handleChange}
                value={form.address}
              />

              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                onChange={handleChange}
                value={form.password}
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>

              {error ? <p className="auth-error">{error}</p> : null}
              {success ? <p className="auth-success">{success}</p> : null}

            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleOtpChange}
                value={otpForm.email}
                required
              />

              <input
                name="otpCode"
                placeholder="Nhập OTP"
                onChange={handleOtpChange}
                value={otpForm.otpCode}
                required
              />

              <button type="submit" disabled={otpLoading}>
                {otpLoading ? "Đang xác thực..." : "Xác thực OTP"}
              </button>

              <button
                type="button"
                className="google-login-btn"
                onClick={handleResendOtp}
                disabled={otpLoading || resendLoading || resendCountdown > 0}
              >
                {resendLoading
                  ? "Đang gửi lại OTP..."
                  : resendCountdown > 0
                    ? `Gửi lại OTP (${resendCountdown}s)`
                    : "Gửi lại OTP"}
              </button>

              {error ? <p className="auth-error">{error}</p> : null}
              {success ? <p className="auth-success">{success}</p> : null}

              <button
                type="button"
                className="google-login-btn"
                onClick={() => {
                  setStep("register")
                  setResendCountdown(0)
                  setError("")
                  setSuccess("")
                }}
                disabled={otpLoading || resendLoading}
              >
                Quay lại đăng ký
              </button>
            </form>
          )}

          {step === "register" ? (
            <>
              {/* GOOGLE LOGIN */}
              <button
                type="button"
                className="google-login-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="google"
                />
                <span>Đăng nhập với Google</span>
              </button>

              <p>
                Đã có tài khoản?
                <Link to="/login"> Đăng nhập</Link>
              </p>
            </>
          ) : null}

        </div>

      </div>


  )
}