import React, { useState, useEffect } from 'react'
import TopBar from '../components/home/TopBar'
import Header from '../components/home/Header'
import Navigation from '../components/home/Navigation'
import HeroBanner from '../components/home/HeroBanner'
import FeaturedCategories from '../components/home/FeaturedCategories'
import ProductList from '../components/home/ProductList_temp'
import CustomerReviews from '../components/home/CustomerReviews'
import Footer from '../components/home/Footer'
import Toast from '../components/home/Toast'
import '../styles/home.css'

export default function HomePage() {
  const [cartCount, setCartCount] = useState(0)
  const [toast, setToast] = useState({ show: false, message: '' })

  // Load giỏ hàng từ localStorage khi trang load
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart)
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
        setCartCount(total)
      } catch (e) {
        console.error('Lỗi đọc giỏ hàng:', e)
      }
    }
  }, [])

  const showToastMessage = (message) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 3000)
  }

  const addToCart = (product) => {
    // Lấy giỏ hàng hiện tại
    const savedCart = localStorage.getItem('cart')
    let cart = savedCart ? JSON.parse(savedCart) : []
    
    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.find(item => item.id === product.productId)
    
    if (existingItem) {
      // Tăng số lượng nếu đã có
      existingItem.quantity = (existingItem.quantity || 1) + 1
    } else {
      // Thêm mới nếu chưa có
      cart.push({
        id: product.productId,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        quantity: 1
      })
    }
    
    // Lưu vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart))
    
    // Cập nhật số lượng hiển thị
    const newCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
    setCartCount(newCount)
    
    // Hiển thị thông báo
    showToastMessage('🛒 Đã thêm sản phẩm vào giỏ hàng!')
  }

  return (
    <div className="home-page">
      <TopBar />
      <Header cartCount={cartCount} />
      <Navigation />
      
      <main>
        <HeroBanner />
        <FeaturedCategories />
        
        <div className="container">
          <ProductList onAddToCart={addToCart} />
        </div>
        
        <CustomerReviews />
      </main>
      
      <Footer />
      <Toast show={toast.show} message={toast.message} />
    </div>
  )
}