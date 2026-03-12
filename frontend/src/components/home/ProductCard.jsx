import React from 'react'
import { FaShoppingCart } from "react-icons/fa"

export default function ProductCard({ product, onAddToCart }) {

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getBadge = () => {
    if (product.stockQuantity <= 0) {
      return { text: 'Hết hàng', type: 'out-of-stock' }
    }
    if (product.stockQuantity < 10) {
      return { text: 'Sắp hết', type: 'low-stock' }
    }
    if (product.isNew) {
      return { text: 'Mới', type: 'new' }
    }
    if (product.discount) {
      return { text: `-${product.discount}%`, type: 'sale' }
    }
    return null
  }

  const badge = getBadge()

  const handleAddToCart = () => {
    if (product.stockQuantity > 0) {
      onAddToCart(product)
    }
  }

  return (
    <div className="product-card">

      {/* Badge */}
      {badge && (
        <div className={`product-badge ${badge.type}`}>
          {badge.text}
        </div>
      )}

      {/* Product Image */}
      <div className="product-image-wrapper">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=300'}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />

        {product.stockQuantity <= 0 && (
          <div className="out-of-stock-overlay">
            <span>Hết hàng</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">

        <h3 className="product-name">{product.name}</h3>

        {product.description && (
          <p className="product-description">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="product-price-wrapper">
          {product.oldPrice ? (
            <>
              <span className="product-price sale">
                {formatPrice(product.price)}
              </span>

              <span className="product-old-price">
                {formatPrice(product.oldPrice)}
              </span>
            </>
          ) : (
            <span className="product-price">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="product-stock">
          {product.stockQuantity > 0 ? (
            <span className="in-stock">
              Còn {product.stockQuantity} sản phẩm
            </span>
          ) : (
            <span className="out-of-stock">
              Tạm hết hàng
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="product-meta">
          {product.categoryName && (
            <span className="product-category">
              {product.categoryName}
            </span>
          )}

          {product.supplierName && (
            <span className="product-supplier">
              {product.supplierName}
            </span>
          )}
        </div>

      </div>

      {/* Add to Cart */}
      <button
        className="add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={product.stockQuantity <= 0}
      >
        <span className="btn-icon">
          <FaShoppingCart />
        </span>

        {product.stockQuantity > 0
          ? 'Thêm vào giỏ'
          : 'Hết hàng'}
      </button>

    </div>
  )
}