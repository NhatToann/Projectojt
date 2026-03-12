import { useState } from "react"
import { Link } from "react-router-dom"
import "../styles/auth.css"

export default function LoginPage(){

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const handleSubmit = (e)=>{
    e.preventDefault()

    console.log("Thông tin đăng nhập:",{
      email,
      password
    })
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

      <div className="auth-card">

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
              onChange={(e)=>setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              onChange={(e)=>setPassword(e.target.value)}
              required
            />

            <a className="forgot">
              Quên mật khẩu?
            </a>

            <button type="submit">
              Đăng nhập
            </button>

          </form>

          {/* GOOGLE LOGIN */}
          <button
            type="button"
            className="google-login-btn"
            onClick={handleGoogleLogin}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="google"
            />
            <span>Đăng nhập với Google</span>
          </button>

          <p>
            Chưa có tài khoản?
            <Link to="/register"> Đăng ký</Link>
          </p>

        </div>

      </div>

    </div>

  )
}