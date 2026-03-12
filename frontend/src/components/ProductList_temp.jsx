import { useEffect, useMemo, useState } from 'react'
import { fetchProducts_temp } from '../api/productsApi_temp'

export default function ProductList_temp() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError('')
    fetchProducts_temp({ signal: ac.signal })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((e) => {
        if (e?.name !== 'AbortError') setError(e?.message || 'Không tải được dữ liệu')
      })
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  const total = useMemo(() => items.length, [items.length])

  return (
    <section style={{ width: 'min(1100px, 92vw)', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Danh sách sản phẩm</h2>
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
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Th>#</Th>
                <Th>Tên</Th>
                <Th>Giá</Th>
                <Th>Tồn</Th>
                <Th>Loại</Th>
                <Th>Nhà cung cấp</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.productId}>
                  <Td>{p.productId}</Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          loading="lazy"
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)' }}
                        />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.08)' }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {p.description ? (
                          <div style={{ opacity: 0.75, fontSize: 13, maxWidth: 520, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </Td>
                  <Td>{formatVnd(p.price)}</Td>
                  <Td>{p.stockQuantity}</Td>
                  <Td>{p.categoryName ?? '-'}</Td>
                  <Td>{p.supplierName ?? '-'}</Td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <Td colSpan={6} style={{ opacity: 0.8 }}>
                    Không có sản phẩm nào.
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

