import { Fragment, useEffect, useMemo, useState } from 'react'
import { fetchPetServices } from '../api/petServicesApi'
import { fetchServiceReviews } from '../api/spaBookingApi'

export default function PetServiceList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openServiceId, setOpenServiceId] = useState(null)
  const [reviewMap, setReviewMap] = useState({})
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError('')
    fetchPetServices({ signal: ac.signal })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((e) => {
        if (e?.name !== 'AbortError') setError(e?.message || 'Không tải được dữ liệu')
      })
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  const total = useMemo(() => items.length, [items.length])

  async function handleToggleReview(serviceId) {
    if (openServiceId === serviceId) {
      setOpenServiceId(null)
      return
    }

    setOpenServiceId(serviceId)

    if (reviewMap[serviceId]) return

    setReviewLoading(true)
    try {
      const data = await fetchServiceReviews(serviceId)
      setReviewMap((prev) => ({ ...prev, [serviceId]: Array.isArray(data) ? data : [] }))
    } catch {
      setReviewMap((prev) => ({ ...prev, [serviceId]: [] }))
    } finally {
      setReviewLoading(false)
    }
  }

  return (
    <section style={{ width: 'min(1100px, 92vw)', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Danh sách dịch vụ</h2>
        <div style={{ opacity: 0.8 }}>Tổng: {total}</div>
      </div>

      {loading && <p style={{ opacity: 0.8 }}>Đang tải...</p>}
      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,0,0,0.08)',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ marginTop: 12, overflow: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.14)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Th>#</Th>
                <Th>Tên</Th>
                <Th>Loại</Th>
                <Th>Giá</Th>
                <Th>Thời lượng</Th>
                <Th>Trạng thái</Th>
                <Th>Review</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <Fragment key={s.serviceId}>
                  <tr>
                    <Td>{s.serviceId}</Td>
                    <Td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      {s.description ? (
                        <div style={{ opacity: 0.75, fontSize: 13, maxWidth: 560, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.description}
                        </div>
                      ) : null}
                    </Td>
                    <Td>{s.serviceType}</Td>
                    <Td>{formatVnd(s.price)}</Td>
                    <Td>{s.duration} phút</Td>
                    <Td>{s.status ?? '-'}</Td>
                    <Td>
                      <button className="btn ghost" type="button" onClick={() => handleToggleReview(s.serviceId)}>
                        {openServiceId === s.serviceId ? 'Ẩn' : 'Xem'}
                      </button>
                    </Td>
                  </tr>
                  {openServiceId === s.serviceId ? (
                    <tr>
                      <Td colSpan={7} style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ padding: '8px 0' }}>
                          <strong>Đánh giá của mọi người</strong>
                          {reviewLoading && !reviewMap[s.serviceId] ? (
                            <div style={{ opacity: 0.7, marginTop: 6 }}>Đang tải đánh giá...</div>
                          ) : null}
                          {!reviewLoading && (reviewMap[s.serviceId]?.length ?? 0) === 0 ? (
                            <div style={{ opacity: 0.7, marginTop: 6 }}>Chưa có đánh giá.</div>
                          ) : null}
                          {(reviewMap[s.serviceId] || []).map((rv) => (
                            <div key={rv.reviewId} style={{ marginTop: 8, padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                <strong>{rv.customerName || 'Ẩn danh'}</strong>
                                <span>{rv.rating} sao</span>
                              </div>
                              <div style={{ opacity: 0.7, marginTop: 4 }}>{new Date(rv.createdAt).toLocaleString()}</div>
                              <div style={{ marginTop: 6 }}>{rv.comment || 'Không có nhận xét.'}</div>
                            </div>
                          ))}
                        </div>
                      </Td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
              {items.length === 0 && (
                <tr>
                  <Td colSpan={7} style={{ opacity: 0.8 }}>
                    Không có dịch vụ nào.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function Th(props) {
  return (
    <th
      {...props}
      style={{
        textAlign: 'left',
        padding: '12px 12px',
        fontSize: 13,
        letterSpacing: 0.2,
        borderBottom: '1px solid rgba(255,255,255,0.14)',
        ...props.style,
      }}
    />
  )
}

function Td(props) {
  return (
    <td
      {...props}
      style={{
        padding: '12px 12px',
        verticalAlign: 'top',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        ...props.style,
      }}
    />
  )
}

function formatVnd(value) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return '-'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}
