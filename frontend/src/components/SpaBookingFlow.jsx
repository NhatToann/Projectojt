import { useEffect, useMemo, useState } from 'react'
import {
  createSpaBooking,
  createSpaPayOSPayment,
  estimateSpaBooking,
  fetchPets,
  fetchServiceReviews,
  fetchSpaHistory,
  fetchSpaServices,
  submitSpaReview,
  updateSpaBookingStatus,
} from '../api/spaBookingApi'

const STATUS_OPTIONS = [
  { value: 'Chưa thanh toán', label: 'Chưa thanh toán' },
  { value: 'Chờ xác nhận', label: 'Chờ xác nhận' },
  { value: 'Đã xác nhận', label: 'Đã xác nhận' },
  { value: 'Đã thanh toán', label: 'Đã thanh toán' },
  { value: 'Hoàn thành', label: 'Hoàn thành' },
  { value: 'Đã hủy', label: 'Đã hủy' },
]

export default function SpaBookingFlow({ login }) {
  const isLoggedIn = Boolean(login?.customerId)

  const [services, setServices] = useState([])
  const [pets, setPets] = useState([])
  const [cart, setCart] = useState([])
  const [selectedPetIds, setSelectedPetIds] = useState([])
  const [appointmentStart, setAppointmentStart] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [estimate, setEstimate] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isLoggedIn) return

    const ac = new AbortController()
    setLoading(true)
    setError('')

    Promise.all([
      fetchSpaServices({ signal: ac.signal }),
      fetchPets(login.customerId, { signal: ac.signal }),
      fetchSpaHistory(login.customerId, { signal: ac.signal }),
    ])
      .then(([servicesData, petsData, historyData]) => {
        setServices(Array.isArray(servicesData) ? servicesData : [])
        setPets(Array.isArray(petsData) ? petsData : [])
        setHistory(Array.isArray(historyData) ? historyData : [])
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          setError(err?.message || 'Không tải được dữ liệu')
        }
      })
      .finally(() => setLoading(false))

    return () => ac.abort()
  }, [isLoggedIn, login?.customerId])

  const selectedPets = useMemo(
    () => pets.filter((p) => selectedPetIds.map(String).includes(String(p.petId))),
    [pets, selectedPetIds],
  )

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])

  const totalPrice = useMemo(() => {
    if (!estimate) return 0
    return estimate.totalPrice || 0
  }, [estimate])

  function addToCart(serviceId) {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.serviceId === serviceId)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
        return next
      }
      return [...prev, { serviceId, quantity: 1 }]
    })
  }

  function updateQuantity(serviceId, quantity) {
    setCart((prev) =>
      prev
        .map((item) => (item.serviceId === serviceId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  async function handleEstimate() {
    setError('')
    setMessage('')
    setEstimate(null)

    if (selectedPetIds.length === 0) {
      setError('Vui lòng chọn pet.')
      return
    }

    if (cart.length === 0) {
      setError('Giỏ spa đang trống.')
      return
    }

    try {
      const data = await estimateSpaBooking(login.customerId, {
        petIds: selectedPetIds.map(Number),
        items: cart,
      })
      setEstimate(data)
    } catch (err) {
      setError(err?.message || 'Không thể tính giá')
    }
  }

  async function handleCreateBooking() {
    setError('')
    setMessage('')

    if (!appointmentStart) {
      setError('Vui lòng chọn ngày giờ.')
      return
    }

    if (!estimate) {
      setError('Bạn cần tính giá trước.')
      return
    }

    const selectedTime = new Date(appointmentStart)
    if (!Number.isFinite(selectedTime.getTime())) {
      setError('Thời gian hẹn không hợp lệ.')
      return
    }

    if (selectedTime <= new Date()) {
      setError('Thời gian hẹn không được nằm trong quá khứ.')
      return
    }

    try {
      const data = await createSpaBooking(login.customerId, {
        petIds: selectedPetIds.map(Number),
        appointmentStart: appointmentStart,
        note: note.trim() || null,
        items: cart,
      })

      if (paymentMethod === 'payos') {
        const baseUrl = window.location.origin
        const checkout = await createSpaPayOSPayment(data.bookingId, {
          returnUrl: `${baseUrl}/payos/return?bookingId=${data.bookingId}&type=spa`,
          cancelUrl: `${baseUrl}/payos/cancel?bookingId=${data.bookingId}&type=spa`,
        })

        if (checkout?.checkoutUrl) {
          window.location.href = checkout.checkoutUrl
          return
        }
      }

      setMessage(`Đã tạo booking #${data.bookingId}.`)
      setCart([])
      setEstimate(null)
      setAppointmentStart('')
      setSelectedPetIds([])
      setNote('')
      setPaymentMethod('cash')

      const historyData = await fetchSpaHistory(login.customerId)
      setHistory(Array.isArray(historyData) ? historyData : [])
    } catch (err) {
      setError(err?.message || 'Tạo booking thất bại')
    }
  }

  async function handleUpdateStatus(bookingId, status) {
    setError('')
    setMessage('')

    try {
      await updateSpaBookingStatus(bookingId, status)
      setMessage(`Đã cập nhật trạng thái booking #${bookingId} -> ${status}`)
      const historyData = await fetchSpaHistory(login.customerId)
      setHistory(Array.isArray(historyData) ? historyData : [])
    } catch (err) {
      setError(err?.message || 'Cập nhật trạng thái thất bại')
    }
  }

  async function handleReview(bookingId, serviceId, rating, comment, onDone, onRefresh) {
    setError('')
    setMessage('')

    try {
      await submitSpaReview(login.customerId, {
        bookingId,
        serviceId,
        rating,
        comment,
      })
      setMessage('Đã gửi review')
      onDone()
      if (typeof onRefresh === 'function') {
        await onRefresh()
      }
    } catch (err) {
      setError(err?.message || 'Gửi review thất bại')
    }
  }

  if (!isLoggedIn) {
    return (
      <section className="spa-flow">
        <h2>Đặt dịch vụ Spa</h2>
        <div className="muted">Bạn cần đăng nhập để đặt dịch vụ.</div>
        <div className="login-hint">Vui lòng dùng phần Login phía trên.</div>
      </section>
    )
  }

  return (
    <section className="spa-flow">
      <header className="spa-header">
        <h2>Flow đặt dịch vụ Spa</h2>
        <div className="muted">Đăng nhập → chọn dịch vụ → chọn pet → giỏ spa → thanh toán → lịch sử → review</div>
      </header>

      {loading ? <div className="muted">Đang tải dữ liệu...</div> : null}
      {error ? <div className="msg error">{error}</div> : null}
      {message ? <div className="msg success">{message}</div> : null}

      <div className="spa-grid">
        <div className="spa-card">
          <h3>1. Chọn dịch vụ</h3>
          <div className="service-list">
            {services.map((s) => (
              <div key={s.serviceId} className="service-item">
                <div>
                  <div className="service-name">{s.name}</div>
                  <div className="muted">{s.description || 'Không có mô tả'}</div>
                  <div className="muted">Thời lượng: {s.duration} phút</div>
                </div>
                <div className="service-actions">
                  <div className="price">{formatVnd(s.price)}</div>
                  <button className="btn" type="button" onClick={() => addToCart(s.serviceId)}>
                    Thêm
                  </button>
                </div>
              </div>
            ))}
            {services.length === 0 && <div className="muted">Chưa có dịch vụ spa.</div>}
          </div>
        </div>

        <div className="spa-card">
          <h3>2. Chọn pet & giỏ</h3>
          <label className="field">
            <span>Pet (có thể chọn nhiều)</span>
            <div className="pet-multi">
              {pets.map((p) => {
                const checked = selectedPetIds.map(String).includes(String(p.petId))
                return (
                  <label key={p.petId} className="pet-option">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...selectedPetIds, p.petId]
                          : selectedPetIds.filter((id) => String(id) !== String(p.petId))
                        setSelectedPetIds(next)
                      }}
                    />
                    <span>
                      {p.petName} ({p.breedName || 'N/A'})
                    </span>
                  </label>
                )
              })}
              {pets.length === 0 && <div className="muted">Bạn chưa có pet.</div>}
            </div>
          </label>
          {selectedPets.length > 0 ? (
            <div className="pet-summary">
              {selectedPets.map((pet) => (
                <div key={pet.petId} className="pet-line">
                  <div>{pet.petName}</div>
                  <div className="muted">Giống: {pet.breedName || 'N/A'}</div>
                  <div className="muted">Loài: {pet.speciesName || 'N/A'}</div>
                  <div className="muted">Cân nặng: {pet.weightKg ?? 'N/A'} kg</div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="cart">
            <div className="cart-head">
              <span>Giỏ spa</span>
              <span className="muted">Tổng: {totalItems}</span>
            </div>
            {cart.map((item) => {
              const svc = services.find((s) => s.serviceId === item.serviceId)
              return (
                <div key={item.serviceId} className="cart-item">
                  <span>{svc?.name || `Service #${item.serviceId}`}</span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.serviceId, Number(e.target.value) || 1)}
                  />
                </div>
              )
            })}
            {cart.length === 0 && <div className="muted">Giỏ trống.</div>}
          </div>

          <button className="btn" type="button" onClick={handleEstimate}>
            Tính giá
          </button>

          {estimate ? (
            <div className="estimate">
              <div className="estimate-row">
                <span>Thời lượng / pet</span>
                <strong>{estimate.perPetDurationMin} phút</strong>
              </div>
              <div className="estimate-row">
                <span>Tổng thời lượng</span>
                <strong>{estimate.totalDurationMin} phút</strong>
              </div>
              <div className="estimate-row">
                <span>Số pet</span>
                <strong>{estimate.petCount}</strong>
              </div>
              <div className="estimate-row">
                <span>Tổng giá</span>
                <strong>{formatVnd(totalPrice)}</strong>
              </div>
              <div className="estimate-details">
                {estimate.items.map((it) => (
                  <div key={`${it.petId}-${it.serviceId}`} className="estimate-item">
                    <span>
                      {it.petName} · {it.serviceName}
                    </span>
                    <span>
                      {it.quantity} x {formatVnd(it.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="spa-card">
          <h3>3. Chọn lịch & thanh toán</h3>
          <label className="field">
            <span>Ngày giờ</span>
            <input
              type="datetime-local"
              value={appointmentStart}
              min={minDateTimeLocal()}
              onChange={(e) => setAppointmentStart(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Phương thức thanh toán</span>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                />
                <span>Tiền mặt</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="payos"
                  checked={paymentMethod === 'payos'}
                  onChange={() => setPaymentMethod('payos')}
                />
                <span>Thanh toán online (PayOS)</span>
              </label>
            </div>
          </label>
          <label className="field">
            <span>Ghi chú</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </label>
          <button className="btn" type="button" onClick={handleCreateBooking}>
            Tạo booking
          </button>
          <div className="muted">Chọn PayOS để chuyển sang trang thanh toán sau khi tạo booking.</div>
        </div>

        <div className="spa-card">
          <h3>4. Lịch sử đặt dịch vụ</h3>
          {history.map((bk) => (
            <div key={bk.bookingId} className="history-item">
              <div className="history-head">
                <div>
                  <strong>Booking #{bk.bookingId}</strong>
                  <div className="muted">Pet: {bk.petName}</div>
                </div>
                <div className="status">{bk.status}</div>
              </div>
              <div className="muted">
                {new Date(bk.appointmentStart).toLocaleString()} → {new Date(bk.appointmentEnd).toLocaleString()}
              </div>
              <div className="history-services">
                {bk.items.map((item) => (
                  <div key={item.serviceId} className="history-service">
                    <span>{item.serviceName}</span>
                    <span>{item.quantity} x {formatVnd(item.unitPrice)}</span>
                  </div>
                ))}
              </div>
              <div className="history-actions">
                <select
                  value={bk.status || ''}
                  onChange={(e) => handleUpdateStatus(bk.bookingId, e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <ReviewForm
                booking={bk}
                onSubmit={(serviceId, rating, comment, done, refresh) =>
                  handleReview(bk.bookingId, serviceId, rating, comment, done, refresh)
                }
              />
            </div>
          ))}
          {history.length === 0 && <div className="muted">Chưa có lịch sử booking.</div>}
        </div>
      </div>
    </section>
  )
}

function ReviewForm({ booking, onSubmit }) {
  const [open, setOpen] = useState(false)
  const [serviceId, setServiceId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)

  async function loadReviews(targetServiceId) {
    if (!targetServiceId) {
      setReviews([])
      return
    }
    setLoading(true)
    try {
      const data = await fetchServiceReviews(targetServiceId)
      setReviews(Array.isArray(data) ? data : [])
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setServiceId('')
    setRating(5)
    setComment('')
    setReviews([])
    setOpen(false)
  }

  return (
    <div className="review">
      <button
        className="btn ghost"
        type="button"
        onClick={() => {
          const next = !open
          setOpen(next)
          if (!next) {
            setReviews([])
          }
        }}
      >
        {open ? 'Đóng review' : 'Review dịch vụ'}
      </button>
      {open ? (
        <div className="review-form">
          <select
            value={serviceId}
            onChange={(e) => {
              const value = e.target.value
              setServiceId(value)
              if (value) {
                loadReviews(Number(value))
              } else {
                setReviews([])
              }
            }}
          >
            <option value="">-- Chọn dịch vụ --</option>
            {booking.items.map((item) => (
              <option key={item.serviceId} value={item.serviceId}>
                {item.serviceName}
              </option>
            ))}
          </select>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r} sao
              </option>
            ))}
          </select>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Nhận xét" />
          <div className="review-actions">
            <button
              className="btn"
              type="button"
              disabled={!serviceId}
              onClick={() => onSubmit(Number(serviceId), rating, comment, reset, () => loadReviews(Number(serviceId)))}
            >
              Gửi review
            </button>
            <button className="btn ghost" type="button" onClick={reset}>
              Hủy
            </button>
          </div>

          <div className="review-list">
            <div className="review-list-title">Đánh giá của mọi người</div>
            {loading ? <div className="muted">Đang tải đánh giá...</div> : null}
            {!loading && reviews.length === 0 ? <div className="muted">Chưa có đánh giá.</div> : null}
            {reviews.map((rv) => (
              <div key={rv.reviewId} className="review-item">
                <div className="review-head">
                  <strong>{rv.customerName || 'Ẩn danh'}</strong>
                  <span>{rv.rating} sao</span>
                </div>
                <div className="muted">{new Date(rv.createdAt).toLocaleString()}</div>
                <div>{rv.comment || 'Không có nhận xét.'}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function formatVnd(value) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return '-'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

function minDateTimeLocal() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(
    now.getMinutes(),
  )}`
}
