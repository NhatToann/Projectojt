import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { FaPhoneAlt, FaEnvelope, FaUser } from "react-icons/fa"

const ROLE_LABELS = {
  admin: "quản trị viên",
  staff: "nhân viên",
  doctor: "bác sĩ",
  user: "khách hàng",
}

const SYSTEM_ROLES = new Set(["admin", "staff", "doctor"])

export default function TopBar() {
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState(false)
  const authUser = useMemo(() => {
    const raw = localStorage.getItem("authUser")
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }, [])

  const greeting = authUser
    ? `Chào ${ROLE_LABELS[authUser.role] || "người dùng"} ${authUser.name || ""}`.trim()
    : null

  const handleToggleMenu = () => {
    setOpenMenu((prev) => !prev)
  }

  const handleLogout = () => {
    localStorage.removeItem("authUser")
    setOpenMenu(false)
    navigate("/login")
  }

  const handleMenuClick = () => {
    setOpenMenu(false)
  }

  return (
    <div className="top-bar">
      <div className="container top-bar-container">

        {/* Left */}
        <div className="top-bar-left">

          <span className="contact-item">
            <FaPhoneAlt className="icon" />
            <span>0123 456 789</span>
          </span>

          <span className="contact-item">
            <FaEnvelope className="icon" />
            <span>hello@petstore.com</span>
          </span>

        </div>

        {/* Right */}
        <div className="top-bar-right">

          {greeting ? (
            <div className="top-bar-dropdown">
              <button type="button" className="top-bar-link" onClick={handleToggleMenu}>
                <FaUser className="icon" />
                {greeting}
              </button>

              {openMenu ? (
                <div className="top-bar-menu">
                  <Link to="/account" className="top-bar-menu-item" onClick={handleMenuClick}>
                    Quản lí tài khoản
                  </Link>

                  {SYSTEM_ROLES.has(authUser.role) ? (
                    <Link to="/system" className="top-bar-menu-item" onClick={handleMenuClick}>
                      Quản lí hệ thống
                    </Link>
                  ) : null}

                  <button type="button" className="top-bar-menu-item" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link to="/login" className="top-bar-link">
                <FaUser className="icon" />
                Đăng nhập
              </Link>

              <Link to="/register" className="top-bar-link">
                Đăng ký
              </Link>
            </>
          )}

        </div>

      </div>
    </div>
  )
}