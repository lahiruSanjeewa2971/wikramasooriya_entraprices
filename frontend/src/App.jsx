import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice.js'
import { fetchCategories } from './store/slices/productSlice.js'
import { fetchCart } from './store/slices/cartSlice.js'

// Components
import TopNav from './components/layout/TopNav.jsx'
import Footer from './components/layout/Footer.jsx'
import Toast from './components/ui/Toast.jsx'
import LoadingSpinner from './components/ui/LoadingSpinner.jsx'

// Pages
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Products from './pages/Products.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Cart from './pages/Cart.jsx'

function App() {
  const dispatch = useDispatch()
  const { token, isAuthenticated } = useSelector(state => state.auth)
  const { loading } = useSelector(state => state.ui)

  useEffect(() => {
    // Fetch categories on app load
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    // If user has token, get current user and cart
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser())
    }
  }, [token, isAuthenticated, dispatch])

  useEffect(() => {
    // If user is authenticated, fetch cart
    if (isAuthenticated) {
      dispatch(fetchCart())
    }
  }, [isAuthenticated, dispatch])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>

      <Footer />
      <Toast />
    </div>
  )
}

export default App
