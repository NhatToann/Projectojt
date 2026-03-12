import { useState } from "react"
import { Link } from "react-router-dom"
import "../styles/auth.css"

export default function RegisterPage(){

  const [form,setForm] = useState({
    name:"",
    email:"",
    password:"",
    phone:"",
    address:""
  })

  const handleChange = (e)=>{
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e)=>{
    e.preventDefault()
    console.log("Thông tin đăng ký:", form)
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

          <h3>ĐĂNG KÝ</h3>

          <form onSubmit={handleSubmit}>

            <input
              name="name"
              placeholder="Họ và tên"
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />

            <input
              name="phone"
              placeholder="Số điện thoại"
              onChange={handleChange}
              required
            />

            <input
              name="address"
              placeholder="Địa chỉ"
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              onChange={handleChange}
              required
            />

            <button type="submit">
              Đăng ký
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
            Đã có tài khoản?
            <Link to="/login"> Đăng nhập</Link>
          </p>

        </div>

      </div>


  )
}