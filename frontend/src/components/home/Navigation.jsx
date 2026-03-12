import React from 'react'

import { FaHome, FaGift, FaBookOpen, FaPhoneAlt, FaBlog } from "react-icons/fa"
import { MdCategory } from "react-icons/md"
import { GiTennisBall } from "react-icons/gi"

export default function Navigation() {

  const navItems = [
    { name: 'Trang chủ', href: '/', icon: <FaHome /> },
    { name: 'Sản phẩm', href: '/products', icon: <GiTennisBall /> },
    { name: 'Danh mục', href: '/categories', icon: <MdCategory /> },
    { name: 'Khuyến mãi', href: '/promotions', icon: <FaGift /> },
    { name: 'Giới thiệu', href: '/about', icon: <FaBookOpen /> },
    { name: 'Liên hệ', href: '/contact', icon: <FaPhoneAlt /> },
    { name: 'Blog', href: '/blog', icon: <FaBlog /> }   
  ]

  return (
    <nav className="navigation">
      <div className="container">
        <ul className="nav-list">
          {navItems.map((item, index) => (
            <li key={index} className="nav-item">
              <a href={item.href} className="nav-link">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}