import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  resetPasswordApi,
  sendEmailOtpApi,
  verifyEmailOtpApi,
} from "../api/authApi"
import "../styles/auth.css"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1)
  const [otpForm, setOtpForm] = useState({ email: "", otpCode: "" })
  const [resetForm, setResetForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [resetToken, setResetToken] = useState("")
  const [otpError, setOtpError] = useState("")
  const [resetError, setResetError] = useState("")
  const [otpResult, setOtpResult] = useState(null)
  const [resetResult, setResetResult] = useState(null)
  const [sendOtpLoading, setSendOtpLoading] = useState(false)
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const isBusy = useMemo(
    () => sendOtpLoading || verifyOtpLoading || resetLoading,
    [sendOtpLoading, verifyOtpLoading, resetLoading],
  )

  const onSendOtp = async (e) => {
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
      setStep(2)
    } catch (err) {
      setOtpError(err?.message || "Send OTP failed")
    } finally {
      setSendOtpLoading(false)
    }
  }

  const onVerifyOtp = async (e) => {
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
      setStep(3)
    } catch (err) {
      setOtpError(err?.message || "Verify OTP failed")
    } finally {
      setVerifyOtpLoading(false)
    }
  }

  const onResetPassword = async (e) => {
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
      setResetError(err?.message || "Reset password failed")
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <Link to="/" className="logo-home">
        🐾 PetShop
      </Link>

      <div className="auth-card">
        <div className="auth-left">
          <h2>Quên mật khẩu</h2>
          <p>Thực hiện theo từng bước để đặt lại mật khẩu</p>
        </div>

        <div className="auth-right">
          <h3>ĐẶT LẠI MẬT KHẨU</h3>

          {step === 1 ? (
            <form onSubmit={onSendOtp}>
              <input
                type="email"
                placeholder="Email"
                value={otpForm.email}
                onChange={(e) => setOtpForm((s) => ({ ...s, email: e.target.value }))}
                disabled={isBusy}
                required
              />
              <button type="submit" disabled={isBusy}>
                {sendOtpLoading ? "Đang gửi OTP..." : "Gửi OTP"}
              </button>
              {otpError ? <div className="auth-error">{otpError}</div> : null}
              {otpResult ? <div className="auth-success">Đã gửi OTP đến email.</div> : null}
            </form>
          ) : null}

          {step === 2 ? (
            <form onSubmit={onVerifyOtp}>
              <input
                type="email"
                placeholder="Email"
                value={otpForm.email}
                onChange={(e) => setOtpForm((s) => ({ ...s, email: e.target.value }))}
                disabled={isBusy}
                required
              />
              <input
                type="text"
                placeholder="OTP Code"
                value={otpForm.otpCode}
                onChange={(e) => setOtpForm((s) => ({ ...s, otpCode: e.target.value }))}
                disabled={isBusy}
                required
              />
              <button type="submit" disabled={isBusy}>
                {verifyOtpLoading ? "Đang xác minh..." : "Xác minh OTP"}
              </button>
              {otpError ? <div className="auth-error">{otpError}</div> : null}
            </form>
          ) : null}

          {step === 3 ? (
            <form onSubmit={onResetPassword}>
              <input
                type="email"
                placeholder="Email"
                value={resetForm.email}
                onChange={(e) => setResetForm((s) => ({ ...s, email: e.target.value }))}
                disabled={isBusy}
                required
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={resetForm.newPassword}
                onChange={(e) => setResetForm((s) => ({ ...s, newPassword: e.target.value }))}
                disabled={isBusy}
                required
              />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                value={resetForm.confirmPassword}
                onChange={(e) => setResetForm((s) => ({ ...s, confirmPassword: e.target.value }))}
                disabled={isBusy}
                required
              />
              <button type="submit" disabled={isBusy}>
                {resetLoading ? "Đang reset..." : "Reset Password"}
              </button>
              {resetError ? <div className="auth-error">{resetError}</div> : null}
              {resetToken ? <div className="auth-success">Xác minh OTP thành công. Bạn có thể đặt mật khẩu mới.</div> : null}
              {resetResult ? <div className="auth-success">Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.</div> : null}
            </form>
          ) : null}

          <p>
            <Link to="/login">Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
