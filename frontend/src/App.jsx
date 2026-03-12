import './App.css'
import { useEffect, useMemo, useState } from 'react'
import AuthTester from './components/AuthTester'
import PetServiceList from './components/PetServiceList'
import ProductList_temp from './components/ProductList_temp'
import SpaBookingFlow from './components/SpaBookingFlow'

function App() {
  const [loginState, setLoginState] = useState(null)
  const [page, setPage] = useState('login')

  const login = useMemo(() => loginState, [loginState])

  useEffect(() => {
    const saved = localStorage.getItem('petshop_login')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setLoginState(parsed)
        setPage('spa')
      } catch {
        localStorage.removeItem('petshop_login')
      }
    }
  }, [])

  function handleLogin(data) {
    setLoginState(data)
    localStorage.setItem('petshop_login', JSON.stringify(data))
    setPage('spa')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>PetShop - API Test</h1>
        <p>Kiểm thử nhanh chức năng Auth, Product list, Service list và Spa booking.</p>
        <div className="nav-tabs">
          <button className={`tab ${page === 'login' ? 'active' : ''}`} onClick={() => setPage('login')}>
            Login
          </button>
          <button className={`tab ${page === 'spa' ? 'active' : ''}`} onClick={() => setPage('spa')}>
            Spa Booking
          </button>
          <button className={`tab ${page === 'products' ? 'active' : ''}`} onClick={() => setPage('products')}>
            Products
          </button>
          <button className={`tab ${page === 'services' ? 'active' : ''}`} onClick={() => setPage('services')}>
            Services
          </button>
        </div>
      </header>

      {page === 'login' ? <AuthTester onLogin={handleLogin} /> : null}
      {page === 'spa' ? <SpaBookingFlow login={login} /> : null}
      {page === 'products' ? <ProductList_temp /> : null}
      {page === 'services' ? <PetServiceList /> : null}
    </div>
  )
}

export default App
