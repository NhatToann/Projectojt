import { useEffect, useMemo, useState } from "react"
import TopBar from "../components/home/TopBar"
import Header from "../components/home/Header"
import Navigation from "../components/home/Navigation"
import Footer from "../components/home/Footer"
import "../styles/home.css"
import "../styles/service.css"

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=240&q=80"

export default function ServicePage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    const loadServices = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/pet-services")
        if (!res.ok) {
          const text = await res.text().catch(() => "")
          throw new Error(text || `Không tải được danh sách dịch vụ (HTTP ${res.status}).`)
        }
        const data = await res.json()
        if (active) {
          setServices(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Không tải được danh sách dịch vụ.")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadServices()

    return () => {
      active = false
    }
  }, [])

  const cards = useMemo(() => services.map((service) => {
    const name = service?.name || "Dịch vụ chăm sóc"
    const description = service?.description || "Dịch vụ spa chuyên nghiệp cho thú cưng"
    const duration = service?.duration ? `${service.duration} phút` : ""
    const price = typeof service?.price === "number" ? service.price : null
    const ratingValue = typeof service?.rating === "number" ? service.rating : 4.5
    const image = service?.image || service?.imageUrl || DEFAULT_IMAGE

    return {
      id: service?.serviceId || service?.id || name,
      name,
      description,
      duration,
      price,
      ratingValue,
      image,
    }
  }), [services])

  const handleAddToCart = (service) => {
    console.log("Add to cart", service)
  }

  const renderStars = (rating) => {
    const safeRating = Number.isFinite(rating) ? rating : 0
    const fullStars = Math.floor(safeRating)
    const hasHalf = safeRating - fullStars >= 0.5
    const stars = []

    for (let i = 0; i < 5; i += 1) {
      if (i < fullStars) {
        stars.push("★")
      } else if (i === fullStars && hasHalf) {
        stars.push("☆")
      } else {
        stars.push("☆")
      }
    }

    return stars.join("")
  }

  const formatRating = (rating) => {
    if (!Number.isFinite(rating)) return "0"
    return rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)
  }

  return (
    <div className="home-page">
      <TopBar />
      <Header cartCount={0} />
      <Navigation />

      <main>
        <section className="service-hero">
          <div className="container hero-content">
            <h1>Dịch vụ spa thú cưng</h1>
            <p>Danh sách dịch vụ chăm sóc chuyên nghiệp dành cho thú cưng của bạn</p>
          </div>
        </section>

        <section className="service-section">
          <div className="container">
            <h2 className="section-title">Danh sách dịch vụ</h2>

            {loading ? (
              <div className="loading">Đang tải dịch vụ...</div>
            ) : null}

            {error ? (
              <div className="auth-error" style={{ marginBottom: 24 }}>{error}</div>
            ) : null}

            {!loading && !error ? (
              <div className="service-list">
                {cards.length === 0 ? (
                  <div className="empty-state">Chưa có dịch vụ nào được cung cấp.</div>
                ) : (
                  cards.map((card) => (
                    <div key={card.id} className="service-card">
                      <div className="service-card__media">
                        <img src={card.image} alt={card.name} loading="lazy" />
                      </div>
                      <div className="service-card__content">
                        <div className="service-card__header">
                          <h3>{card.name}</h3>
                          <div className="service-card__rating">
                            <span className="service-card__stars">{renderStars(card.ratingValue)}</span>
                            <span>{formatRating(card.ratingValue)}</span>
                          </div>
                        </div>
                        <p className="service-card__desc">{truncateText(card.description, 140)}</p>
                        <div className="service-card__footer">
                          <span>Thời gian: {card.duration || "Liên hệ"}</span>
                          <button className="service-card__price" type="button" onClick={() => handleAddToCart(card)}>
                            {card.price !== null ? `${card.price.toLocaleString("vi-VN")}₫` : "Liên hệ"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function renderStars(rating) {
  const safeRating = Number.isFinite(rating) ? rating : 0
  const fullStars = Math.floor(safeRating)
  const hasHalf = safeRating - fullStars >= 0.5
  const stars = []

  for (let i = 0; i < 5; i += 1) {
    if (i < fullStars) {
      stars.push("★")
    } else if (i === fullStars && hasHalf) {
      stars.push("☆")
    } else {
      stars.push("☆")
    }
  }

  return stars.join("")
}

function formatRating(rating) {
  if (!Number.isFinite(rating)) return "0"
  return rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)
}

function truncateText(text, maxLength) {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}
