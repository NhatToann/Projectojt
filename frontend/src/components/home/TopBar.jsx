import React from 'react'
import { Link } from "react-router-dom"
import { FaPhoneAlt, FaEnvelope, FaUser, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa"

export default function TopBar() {
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

          <Link  to="/login" className="top-bar-link">
            <FaUser className="icon" />
            Đăng nhập
          </Link>

          <Link  to="/register" className="top-bar-link">
            Đăng ký
          </Link>


        </div>

      </div>
    </div>
  )
}