import React from 'react'
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaFacebook, 
  FaInstagram, 
  FaYoutube, 
  FaTiktok,
  FaHeart,
  FaPaw,
  FaArrowRight
} from 'react-icons/fa'
import { SiZalo } from 'react-icons/si'
import { MdEmail, MdLocationOn } from 'react-icons/md'
import { BsFillSendFill } from 'react-icons/bs'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <h3 className="footer-title">
              <FaPaw className="title-icon" /> Về chúng tôi
            </h3>
            <div className="footer-logo">
              <img 
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=50" 
                alt="Pet Toy Shop"
              />
              <span>Pet Toy Shop</span>
            </div>
            <p className="footer-description">
              Thế giới đồ chơi cho thú cưng với hơn 1000+ sản phẩm chất lượng, 
              an toàn và thân thiện với mọi loài vật.
            </p>
            <div className="footer-contact">
              <p>
                <FaMapMarkerAlt className="contact-icon" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </p>
              <p>
                <FaPhone className="contact-icon" />
                <span>0123 456 789</span>
              </p>
              <p>
                <FaEnvelope className="contact-icon" />
                <span>contact@pettoy.com</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">
              <FaArrowRight className="title-icon" /> Liên kết nhanh
            </h3>
            <ul className="footer-links">
              <li><a href="/about">Giới thiệu</a></li>
              <li><a href="/products">Sản phẩm</a></li>
              <li><a href="/categories">Danh mục</a></li>
              <li><a href="/promotions">Khuyến mãi</a></li>
              <li><a href="/contact">Liên hệ</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="footer-section">
            <h3 className="footer-title">
              <FaHeart className="title-icon" /> Chính sách
            </h3>
            <ul className="footer-links">
              <li><a href="/policy">Chính sách bảo mật</a></li>
              <li><a href="/terms">Điều khoản sử dụng</a></li>
              <li><a href="/shipping">Chính sách vận chuyển</a></li>
              <li><a href="/return">Chính sách đổi trả</a></li>
              <li><a href="/payment">Hình thức thanh toán</a></li>
              <li><a href="/warranty">Chính sách bảo hành</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section">
            <h3 className="footer-title">
              <MdEmail className="title-icon" /> Đăng ký nhận tin
            </h3>
            <p className="newsletter-text">
              Nhận thông tin khuyến mãi và sản phẩm mới nhất từ chúng tôi
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-button">
                <BsFillSendFill className="send-icon" />
                Đăng ký
              </button>
            </form>
            
            <div className="social-links">
              <h4 className="social-title">Kết nối với chúng tôi</h4>
              <div className="social-icons">
                <a 
                  href="/facebook" 
                  className="social-icon" 
                  aria-label="Facebook"
                  style={{ backgroundColor: '#1877F2' }}
                >
                  <FaFacebook />
                </a>
                <a 
                  href="/instagram" 
                  className="social-icon" 
                  aria-label="Instagram"
                  style={{ background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)' }}
                >
                  <FaInstagram />
                </a>
                <a 
                  href="/youtube" 
                  className="social-icon" 
                  aria-label="YouTube"
                  style={{ backgroundColor: '#FF0000' }}
                >
                  <FaYoutube />
                </a>
                <a 
                  href="/tiktok" 
                  className="social-icon" 
                  aria-label="TikTok"
                  style={{ backgroundColor: '#000000' }}
                >
                  <FaTiktok />
                </a>
                <a 
                  href="/zalo" 
                  className="social-icon" 
                  aria-label="Zalo"
                  style={{ backgroundColor: '#0068FF' }}
                >
                  <SiZalo />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} Pet Toy Shop. Tất cả quyền được bảo lưu.</p>
          <p className="footer-made-with">
            Made with <FaHeart className="heart-icon" /> for your beloved pets
          </p>
        </div>
      </div>
    </footer>
  )
}