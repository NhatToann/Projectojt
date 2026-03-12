import React from 'react'
import { FaBullseye } from "react-icons/fa"

export default function HeroBanner() {
  return (
    <section className="hero-banner">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Thế giới đồ chơi <span className="highlight">cho thú cưng</span>
            </h1>

            <p className="hero-description">
              Hơn 1000+ món đồ chơi chất lượng, an toàn cho bé cưng của bạn. 
              Từ đồ chơi thông minh đến đồ chơi vận động, tất cả đều có tại Pet Toy Shop!
            </p>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Sản phẩm</span>
              </div>

              <div className="stat-item">
                <span className="stat-number">5000+</span>
                <span className="stat-label">Khách hàng</span>
              </div>

              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">An toàn</span>
              </div>
            </div>

            <button
              className="hero-cta"
              onClick={() => window.location.href = '/products'}
            >
              Khám phá ngay
              <span className="cta-icon">
                <FaBullseye />
              </span>
            </button>
          </div>

          <div className="hero-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600"
              alt="Happy pets playing with toys"
              className="hero-image"
            />
            <div className="hero-image-decoration"></div>
          </div>
        </div>
      </div>
    </section>
  )
}