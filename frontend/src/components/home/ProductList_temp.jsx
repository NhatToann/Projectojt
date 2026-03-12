import React, { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { getFeaturedProducts } from '../../api/productsApi_temp'
import { MdPets, MdToys } from 'react-icons/md'

export default function ProductList_temp({ onAddToCart }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAll, setShowAll] = useState(false)   // thêm state

  useEffect(() => {
    const fetchProducts = async () => {
      const abortController = new AbortController()
      
      try {
        setLoading(true)
        setError(null)

        // lấy tất cả sản phẩm
        const data = await getFeaturedProducts()

        setProducts(data)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Không thể tải sản phẩm. Vui lòng thử lại sau.')
          console.error('Error fetching products:', err)
        }
      } finally {
        setLoading(false)
      }

      return () => abortController.abort()
    }

    fetchProducts()
  }, [])

  const visibleProducts = showAll ? products : products.slice(0, 10)

  if (loading) {
    return (
      <section className="products-section">
        <h2 className="section-title">
          <span className="title-icon"><MdPets /></span>
          Danh mục nổi bật
          <span className="title-icon"><MdToys /></span>
        </h2>

        <div className="products-grid">
          {[1,2,3,4,5,6,7,8].map(n => (
            <div key={n} className="product-card-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-price"></div>
              <div className="skeleton-button"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="products-section">
        <h2 className="section-title">
          <span className="title-icon"><MdPets /></span>
          Danh mục nổi bật
          <span className="title-icon"><MdToys /></span>
        </h2>

        <div className="error-message" style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(255,140,148,0.1)',
          borderRadius: '22px',
          color: '#FF8C94'
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>❌ {error}</p>

          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
            style={{
              padding: '0.8rem 2rem',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              border: 'none',
              borderRadius: '18px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Thử lại
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="products-section">
      <h2 className="section-title">
        <span className="title-icon"><MdPets /></span>
        Sản phẩm nổi bật
        <span className="title-icon"><MdToys /></span>
      </h2>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
          Chưa có sản phẩm nào.
        </div>
      ) : (
        <div className="products-grid">
          {visibleProducts.map(product => (
            <ProductCard 
              key={product.productId} 
              product={product} 
              onAddToCart={() => {}}   // bỏ backend add to cart
            />
          ))}
        </div>
      )}

      {/* chỉ hiện nút khi còn sản phẩm chưa hiển thị */}
      {!showAll && products.length > 10 && (
        <div className="view-more-wrapper" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            className="view-more-btn"
            onClick={() => setShowAll(true)}
            style={{
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              border: 'none',
              borderRadius: '30px',
              color: 'white',
              fontWeight: 600,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-button)',
              transition: 'var(--transition)'
            }}
          >
            Xem tất cả sản phẩm
            <span className="btn-icon" style={{ marginLeft: '0.5rem' }}>→</span>
          </button>
        </div>
      )}
    </section>
  )
}