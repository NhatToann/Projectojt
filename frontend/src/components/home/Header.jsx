import React, { useState } from 'react'
import { FaPhone, FaShoppingCart, FaSearch } from "react-icons/fa"

export default function Header({ cartCount = 0 }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions = [
    'Đồ chơi cho chó',
    'Đồ chơi cho mèo',
    'Bóng tennis',
    'Xương gặm',
    'Cần câu mèo',
    'Đồ chơi thông minh',
    'Frisbee',
    'Đồ chơi vận động'
  ]

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`
    }
  }

  return (
    <header className="header">
      <div className="container header-container">

        {/* Logo */}
        <a href="/" className="logo">
          <div className="logo-image">
            <img
              src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=100"
              alt="Pet Toy Shop"
            />
          </div>
          <div className="logo-text-wrapper">
            <div className="logo-main">pet toy</div>
            <div className="logo-sub">shop</div>
          </div>
        </a>

        {/* Search */}
        <div className="search-wrapper">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm đồ chơi cho pet..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />

            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </form>

          {showSuggestions && searchTerm && filteredSuggestions.length > 0 && (
            <ul className="suggestions-list">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="suggestion-item"
                  onClick={() => {
                    setSearchTerm(suggestion)
                    setShowSuggestions(false)
                    window.location.href = `/search?q=${encodeURIComponent(suggestion)}`
                  }}
                >
                  <FaSearch style={{ marginRight: "6px" }} />
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cart (frontend only) */}
        <div className="header-contact">
          <a href="/cart" className="cart-link">
            <span className="cart-icon">
              <FaShoppingCart />
            </span>
            <span className="cart-text">
              Giỏ hàng{cartCount > 0 ? ` (${cartCount})` : ''}
            </span>
          </a>
        </div>

      </div>
    </header>
  )
}