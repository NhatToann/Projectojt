import { useEffect, useMemo, useState } from 'react'
import { fetchProducts } from '../api/productsApi'

export default function ProductBrowse() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [q, setQ] = useState('')
  const [category, setCategory] = useState('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState('featured')

  useEffect(() => {
    const ac = new AbortController()
    fetchProducts({ signal: ac.signal })
      .then(setItems)
      .catch((e) => {
        if (e?.name !== 'AbortError') setError(e?.message || 'Không tải được dữ liệu')
      })
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  const categories = useMemo(() => {
    const map = new Map()
    for (const p of items) {
      const id = p.categoryId ?? null
      const name = p.categoryName ?? 'Khác'
      if (!map.has(id)) map.set(id, name)
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'vi'))
  }, [items])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = items
    if (category !== 'all') {
      const catId = category === 'null' ? null : Number(category)
      list = list.filter((p) => (p.categoryId ?? null) === catId)
    }
    if (inStockOnly) list = list.filter((p) => Number(p.stockQuantity) > 0)
    if (needle) {
      list = list.filter((p) => {
        const hay = `${p.name ?? ''} ${p.description ?? ''} ${p.categoryName ?? ''} ${p.supplierName ?? ''}`.toLowerCase()
        return hay.includes(needle)
      })
    }
    const toNum = (v) => (typeof v === 'number' ? v : Number(v))
    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => toNum(a.price) - toNum(b.price))
        break
      case 'price-desc':
        list = [...list].sort((a, b) => toNum(b.price) - toNum(a.price))
        break
      case 'name-asc':
        list = [...list].sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? ''), 'vi'))
        break
      default:
        break
    }
    return list
  }, [items, q, category, inStockOnly, sort])

  const stats = useMemo(() => {
    const total = items.length
    const showing = filtered.length
    return { total, showing }
  }, [items.length, filtered.length])

  const detailsHref = (productId) => `http://localhost:5286/products/${productId}`

  return (
    <section className="ps-shell">
      <header className="ps-head">
        <div>
          <div className="ps-kicker">PetShop</div>
          <h1 className="ps-title">Chọn sản phẩm</h1>
          <div className="ps-sub">
            Hiển thị <b>{stats.showing}</b> / {stats.total} sản phẩm
          </div>
        </div>

        <div className="ps-controls">
          <label className="ps-field">
            <span>Tìm</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên, mô tả, loại, nhà cung cấp..." />
          </label>

          <label className="ps-field">
            <span>Loại</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">Tất cả</option>
              {categories.map((c) => (
                <option key={String(c.id)} value={c.id === null ? 'null' : String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="ps-check">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
            <span>Còn hàng</span>
          </label>

          <label className="ps-field">
            <span>Sắp xếp</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Mặc định</option>
              <option value="price-asc">Giá: thấp → cao</option>
              <option value="price-desc">Giá: cao → thấp</option>
              <option value="name-asc">Tên: A → Z</option>
            </select>
          </label>
        </div>
      </header>

      {loading && <p className="ps-note">Đang tải sản phẩm…</p>}
      {error && (
        <div className="ps-error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="ps-grid" role="list">
          {filtered.map((p) => (
            <a
              key={p.productId}
              className="ps-card"
              role="listitem"
              href={detailsHref(p.productId)}
              title="Xem chi tiết"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <div className="ps-imgWrap">
                {p.imageUrl ? <img className="ps-img" src={p.imageUrl} alt={p.name} loading="lazy" /> : <div className="ps-imgFallback" />}
                {Number(p.stockQuantity) <= 0 ? <div className="ps-badge ps-badgeOut">Hết hàng</div> : <div className="ps-badge">Còn {p.stockQuantity}</div>}
              </div>

              <div className="ps-body">
                <div className="ps-name" title={p.name}>
                  {p.name}
                </div>

                <div className="ps-meta">
                  <div>{p.categoryName ?? '—'}</div>
                  <div className="ps-dot" />
                  <div>{p.supplierName ?? '—'}</div>
                </div>

                {p.description ? <div className="ps-desc">{p.description}</div> : <div className="ps-desc ps-descEmpty">Không có mô tả.</div>}

                <div className="ps-foot">
                  <div className="ps-price">{formatVnd(p.price)}</div>
                  <span className="ps-btn" aria-hidden="true">
                    Xem chi tiết →
                  </span>
                </div>
              </div>
            </a>
          ))}

          {filtered.length === 0 && <div className="ps-empty">Không tìm thấy sản phẩm phù hợp.</div>}
        </div>
      )}
    </section>
  )
}

function formatVnd(value) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return '-'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

