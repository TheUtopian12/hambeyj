import React, { useState, useEffect } from 'react'

// --- INTERFACES ---
interface FoodItem {
  id: string
  title: string
  description: string
  price: number
  image: string
  category: 'Hamburguesas' | 'Combos' | 'Bebidas' | 'Promos' | 'Otros'
  isCustom?: boolean
}

interface CartItem {
  product: FoodItem
  quantity: number
  customNotes?: string
}

interface Order {
  id: string
  orderNumber: number
  customerName: string
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'Efectivo' | 'Transferencia'
  paymentAmountReceived?: number
  notes?: string
  timestamp: string | number
  status: 'Pendiente' | 'En Cocina' | 'Listo' | 'Entregado' | 'Cancelado'
  isPaid: boolean
}

interface User {
  id: string
  username: string
  name: string
  role: 'ADMIN' | 'STAFF'
  createdAt?: string
}

interface ToastMessage {
  id: string
  text: string
  type: 'success' | 'info' | 'error'
}

// --- MOCK CONSTANT USER PROFILE (NO LOGIN WALL) ---
const CURRENT_USER: User = {
  id: 'admin-id-default',
  username: 'admin',
  name: 'Administrador Principal',
  role: 'ADMIN'
}

// --- IMAGES PRESETS ---
const PRESET_IMAGES = [
  { label: 'Volcán Burger (Doble queso y aros)', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
  { label: 'Combo Burger (Papas y refresco)', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80' },
  { label: 'Doble Clásica Stack', url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80' },
  { label: 'Papas Cheddar & Tocino', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80' },
  { label: 'Refresco Cola Helado', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80' },
  { label: 'Malteada Oreo', url: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80' },
]

// --- DEFAULT MENU SEED DATA ---
const DEFAULT_PRODUCTS: FoodItem[] = [
  {
    id: 'prod-volcan',
    title: 'LA VOLCÁN',
    description: 'Doble carne de res selecta, queso cheddar derretido, tocino ahumado crujiente, aros de cebolla dorados y nuestra legendaria salsa secreta volcán.',
    price: 149,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    category: 'Hamburguesas'
  },
  {
    id: 'prod-combo',
    title: 'COMBO CLÁSICO',
    description: 'Nuestra jugosa hamburguesa clásica (carne premium, queso cheddar, lechuga fresca, rodajas de tomate) acompañada de papas fritas crujientes y bebida helada.',
    price: 179,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    category: 'Combos'
  },
  {
    id: 'prod-promo',
    title: 'MARTES DE BURGERS (2X1)',
    description: '¡La promo de la semana! Pide dos de nuestras hamburguesas clásicas con queso por el precio de una. Ideal para compartir.',
    price: 220,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    category: 'Promos'
  },
  {
    id: 'prod-papas',
    title: 'PAPAS SUPREMAS',
    description: 'Papas fritas corte francés sazonadas, bañadas en abundante salsa de queso cheddar derretido y espolvoreadas con trocitos crujientes de tocino.',
    price: 89,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    category: 'Otros'
  },
  {
    id: 'prod-soda',
    title: 'SODA DE LA CASA',
    description: 'Refresco helado de cola servido con rodaja de limón y hielo en vaso especial coleccionable.',
    price: 35,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    category: 'Bebidas'
  },
  {
    id: 'prod-malteada',
    title: 'MALTEADA OREO',
    description: 'Deliciosa y cremosa malteada artesanal de vainilla batida con galletas Oreo trituradas, coronada con crema batida y jarabe de chocolate.',
    price: 65,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
    category: 'Bebidas'
  }
]

// --- BEAUTIFUL SVG ICONS ---
const BurgerLogoIcon = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 max-w-full mx-auto select-none">
    <defs>
      <path id="archPath" d="M 12,50 a 38,38 0 1,1 76,0" fill="none" />
      <path id="archBottomPath" d="M 88,50 a 38,38 0 1,1 -76,0" fill="none" />
    </defs>
    <circle cx="50" cy="50" r="48" fill="#000000" stroke="#FF282B" strokeWidth="2" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="#FFA726" strokeWidth="0.5" strokeDasharray="3,3" />
    
    <text fill="#FFFFFF" fontSize="6" fontFamily="Bebas Neue" letterSpacing="1.2">
      <textPath href="#archPath" startOffset="50%" textAnchor="middle">
        SABOR QUE PRENDE • ESTILO QUE SORPRENDE
      </textPath>
    </text>

    {/* Burger illustration in logo */}
    <g transform="translate(25, 34) scale(0.42)">
      {/* Top Bun */}
      <path d="M 10,40 C 10,15, 110,15, 110,40 Z" fill="#FFA726" stroke="#000000" strokeWidth="2" />
      {/* Sesame Seeds */}
      <circle cx="35" cy="23" r="2" fill="#FFFFFF" />
      <circle cx="55" cy="20" r="2" fill="#FFFFFF" />
      <circle cx="75" cy="22" r="2" fill="#FFFFFF" />
      <circle cx="45" cy="30" r="2" fill="#FFFFFF" />
      <circle cx="65" cy="32" r="2" fill="#FFFFFF" />
      <circle cx="85" cy="28" r="2" fill="#FFFFFF" />
      
      {/* Lettuce */}
      <path d="M 5,38 Q 15,48, 25,38 Q 35,48, 45,38 Q 55,48, 65,38 Q 75,48, 85,38 Q 95,48, 105,38 Q 115,48, 115,38" fill="#4CAF50" stroke="#000000" strokeWidth="2" />
      
      {/* Cheese dripping */}
      <polygon points="10,48 25,58 40,48 55,64 70,48 90,56 110,48" fill="#FFD54F" stroke="#000000" strokeWidth="1" />
      
      {/* Meat Patty */}
      <rect x="8" y="46" width="104" height="12" rx="6" fill="#5D4037" stroke="#000000" strokeWidth="2" />
      <line x1="20" y1="52" x2="100" y2="52" stroke="#4E342E" strokeWidth="3" strokeDasharray="6,4" />
      
      {/* Bottom Bun */}
      <path d="M 10,58 C 10,68, 110,68, 110,58 Z" fill="#FFA726" stroke="#000000" strokeWidth="2" />
    </g>

    <text x="50" y="77" fill="#FFFFFF" fontSize="11" fontFamily="Bebas Neue" textAnchor="middle" fontWeight="bold" letterSpacing="1">
      BURGERS
    </text>
    <text x="50" y="86" fill="#FF282B" fontSize="8" fontFamily="Bebas Neue" textAnchor="middle" fontWeight="bold" letterSpacing="3">
      J & E
    </text>
  </svg>
)

const HeaderNeonBurger = () => (
  <svg viewBox="0 0 100 100" className="w-14 h-14" stroke="#FF282B" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <filter id="neon-glow-red-svg">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <g filter="url(#neon-glow-red-svg)">
      {/* Top Bun */}
      <path d="M 15,45 C 15,20, 85,20, 85,45 Z" />
      {/* Lettuce */}
      <path d="M 10,45 Q 20,53, 30,45 Q 40,53, 50,45 Q 60,53, 70,45 Q 80,53, 90,45" stroke="#FFA726" />
      {/* Meat Patty */}
      <rect x="12" y="53" width="76" height="8" rx="4" />
      {/* Bottom Bun */}
      <path d="M 15,61 C 15,75, 85,75, 85,61 Z" />
    </g>
  </svg>
)

const IconBurger = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
)

const IconSteak = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" />
  </svg>
)

const IconLeaves = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const IconDelivery = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const IconFire = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

// --- TOAST ITEM COMPONENT ---
interface ToastItemProps {
  toast: ToastMessage
  onClose: (id: string) => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, 1500)
    return () => clearTimeout(timer)
  }, [toast.id])

  return (
    <div
      className="pointer-events-auto p-4 rounded-lg shadow-2xl flex items-center justify-between border transition-all duration-300 transform translate-y-0 opacity-100 bg-zinc-950 border-zinc-800"
      style={{
        borderColor:
          toast.type === 'success'
            ? 'var(--green-whatsapp)'
            : toast.type === 'error'
              ? 'var(--neon-red)'
              : 'var(--orange-fire)',
        color:
          toast.type === 'success'
            ? 'var(--green-whatsapp)'
            : toast.type === 'error'
              ? 'var(--neon-red)'
              : 'var(--orange-fire)'
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl mt-0.5">
          {toast.type === 'success' ? '🔥' : toast.type === 'error' ? '❌' : '⚡'}
        </span>
        <p className="text-sm font-semibold m-0 leading-tight text-white">{toast.text}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-zinc-500 hover:text-white ml-4 focus:outline-none text-xl font-bold cursor-pointer transition-colors"
      >
        ×
      </button>
    </div>
  )
}

const generateUniqueId = (prefix: string = '') => {
  const cleanPrefix = prefix ? `${prefix}-` : ''
  return `${cleanPrefix}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export default function App() {
  // --- POS DATA STATES ---
  const [products, setProducts] = useState<FoodItem[]>(() => {
    try {
      const local = localStorage.getItem('burgers_je_products')
      if (local) {
        return JSON.parse(local)
      } else {
        localStorage.setItem('burgers_je_products', JSON.stringify(DEFAULT_PRODUCTS))
        return DEFAULT_PRODUCTS
      }
    } catch (e) {
      console.error(e)
      return DEFAULT_PRODUCTS
    }
  })
  const [cart, setCart] = useState<CartItem[]>(() => {
    const local = localStorage.getItem('burgers_je_cart')
    return local ? JSON.parse(local) : []
  })
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const local = localStorage.getItem('burgers_je_orders')
      return local ? JSON.parse(local) : []
    } catch (e) {
      console.error(e)
      return []
    }
  })
  /*
  const [posUsers, setPosUsers] = useState<User[]>(() => {
    try {
      const local = localStorage.getItem('burgers_je_users')
      if (local) {
        return JSON.parse(local)
      } else {
        const defaultUsers: User[] = [
          { id: 'admin-id-default', username: 'admin', name: 'Administrador Principal', role: 'ADMIN', createdAt: new Date().toISOString() },
          { id: 'staff-id-default', username: 'staff', name: 'Personal de Caja', role: 'STAFF', createdAt: new Date().toISOString() }
        ]
        localStorage.setItem('burgers_je_users', JSON.stringify(defaultUsers))
        return defaultUsers
      }
    } catch (e) {
      console.error(e)
      return []
    }
  })
  */

  const [activeTab, setActiveTab] = useState<'pos' | 'pedidos' | 'admin'>('pos')
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Checkout Form states
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia'>('Efectivo')
  const [cashReceived, setCashReceived] = useState<string>('')
  const [checkoutNotes, setCheckoutNotes] = useState('')
  const [checkoutErrors, setCheckoutErrors] = useState<{ name?: string; cash?: string }>({})
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart')
  const [expandedNotesProductIds, setExpandedNotesProductIds] = useState<string[]>([])

  // Admin Food Form states
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formCategory, setFormCategory] = useState<'Hamburguesas' | 'Combos' | 'Bebidas' | 'Promos' | 'Otros'>('Hamburguesas')
  const [formImage, setFormImage] = useState('')
  const [adminErrors, setAdminErrors] = useState<{ title?: string; price?: string; desc?: string }>({})
  const [imagePreviewMode, setImagePreviewMode] = useState<'preset' | 'url'>('preset')

  // Admin User Form states
  /*
  const [newUserUsername, setNewUserUsername] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'STAFF'>('STAFF')
  const [userFormError, setUserFormError] = useState('')
  */

  // Filter state for orders panel
  const [orderFilter, setOrderFilter] = useState<'Todos' | 'Pendiente' | 'En Cocina' | 'Listo' | 'Entregado' | 'Cancelado'>('Todos')

  // CLIENT MENU ROUTE DETECTION
  const [isMenuView, setIsMenuView] = useState(() => {
    return window.location.pathname === '/menu' || 
           window.location.search.includes('menu') || 
           window.location.hash.includes('menu')
  })

  useEffect(() => {
    const handlePopState = () => {
      setIsMenuView(
        window.location.pathname === '/menu' || 
        window.location.search.includes('menu') || 
        window.location.hash.includes('menu')
      )
    }
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('hashchange', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('hashchange', handlePopState)
    }
  }, [])

  // FEATURED RECOMMENDATION STATES
  const [featuredProductId, setFeaturedProductId] = useState<string>(() => {
    return localStorage.getItem('burgers_je_featured_product_id') || ''
  })

  const handleSetFeaturedProduct = (id: string) => {
    setFeaturedProductId(id)
    if (id) {
      localStorage.setItem('burgers_je_featured_product_id', id)
      showToast('Recomendación del día actualizada', 'success')
    } else {
      localStorage.removeItem('burgers_je_featured_product_id')
      showToast('Recomendación del día reestablecida a automático', 'info')
    }
  }

  // Inline Cash Out states for Orders View
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null)
  const [payingMethod, setPayingMethod] = useState<'Efectivo' | 'Transferencia'>('Efectivo')
  const [payingCashReceived, setPayingCashReceived] = useState<string>('')
  const [payingError, setPayingError] = useState<string>('')

  // Notifications Log states
  const [notificationLog, setNotificationLog] = useState<Array<{ id: string; text: string; time: number; type: 'success' | 'info' | 'error' }>>(() => {
    try {
      const localLogs = localStorage.getItem('burgers_je_notifications')
      if (localLogs) {
        return JSON.parse(localLogs)
      } else {
        const initialLogs: Array<{ id: string; text: string; time: number; type: 'success' | 'info' | 'error' }> = [
          { id: 'notif-welcome', text: 'Sistema POS Burgers J&E iniciado correctamente. 🔥', time: Date.now(), type: 'info' },
          { id: 'notif-seed', text: 'Menú predeterminado y recetas cargados con éxito. 🍔', time: Date.now() - 5000, type: 'success' }
        ]
        localStorage.setItem('burgers_je_notifications', JSON.stringify(initialLogs))
        return initialLogs
      }
    } catch (e) {
      console.error(e)
      return []
    }
  })
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null)

  // --- PERSISTENCE FOR LOCAL CART & LOGS ---
  useEffect(() => {
    localStorage.setItem('burgers_je_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (notificationLog.length > 0) {
      localStorage.setItem('burgers_je_notifications', JSON.stringify(notificationLog))
    }
  }, [notificationLog])

  // --- TOAST FUNCTION ---
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = generateUniqueId()
    setToasts((prev) => [...prev, { id, text, type }])

    // Add to notifications log
    setNotificationLog((prev) => [
      { id, text, time: Date.now(), type },
      ...prev.slice(0, 49) // Limit to last 50 notifications
    ])
    setUnreadNotificationsCount((prev) => prev + 1)
  }

  // --- CART FUNCTIONS ---
  const handleAddToCart = (product: FoodItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        showToast(`Incrementado: ${product.title} en el pedido`, 'info')
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        showToast(`Agregado: ${product.title} al pedido`, 'success')
        return [...prev, { product, quantity: 1 }]
      }
    })
  }

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    })
  }

  const handleUpdateCartItemNotes = (productId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, customNotes: notes } : item
      )
    )
  }

  const toggleNoteExpand = (productId: string) => {
    setExpandedNotesProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const handleRemoveFromCart = (productId: string, productName: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
    showToast(`Eliminado ${productName} del pedido`, 'error')
  }

  const handleClearCart = () => {
    setCart([])
    setCustomerName('')
    setCashReceived('')
    setCheckoutNotes('')
    setCheckoutErrors({})
    setCheckoutStep('cart')
    showToast('Pedido actual limpiado', 'info')
  }

  // --- FINANCIAL CALCULATIONS ---
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const taxRate = 0.16 // 16% IVA
  const taxAmount = Math.round(subtotal * taxRate)
  const grandTotal = subtotal + taxAmount

  const cashChange =
    paymentMethod === 'Efectivo' && cashReceived && parseFloat(cashReceived) >= grandTotal
      ? parseFloat(cashReceived) - grandTotal
      : null

  // --- CHECKOUT SUBMISSION TO DATABASE ---
  const handleConfirmOrder = async (e: React.FormEvent, isPaidWorkflow: boolean) => {
    e.preventDefault()
    const errors: { name?: string; cash?: string } = {}

    if (!customerName.trim()) {
      errors.name = 'El nombre del cliente es obligatorio'
    }

    if (cart.length === 0) {
      showToast('No hay productos en el pedido actual', 'error')
      return
    }

    if (isPaidWorkflow && paymentMethod === 'Efectivo') {
      const received = parseFloat(cashReceived)
      if (isNaN(received)) {
        errors.cash = 'Ingrese el monto recibido en efectivo'
      } else if (received < grandTotal) {
        errors.cash = `El efectivo recibido debe ser de al menos $${grandTotal}`
      }
    }

    if (Object.keys(errors).length > 0) {
      setCheckoutErrors(errors)
      showToast('Por favor corrige los errores del pedido', 'error')
      return
    }

    try {
      const localOrdersStr = localStorage.getItem('burgers_je_orders')
      const currentOrders: Order[] = localOrdersStr ? JSON.parse(localOrdersStr) : []
      const nextOrderNumber = currentOrders.length > 0 
        ? Math.max(...currentOrders.map(o => o.orderNumber || 0)) + 1 
        : 1

      const newOrder: Order = {
        id: generateUniqueId('order'),
        orderNumber: nextOrderNumber,
        customerName: customerName.trim(),
        items: cart,
        subtotal,
        tax: taxAmount,
        total: grandTotal,
        paymentMethod: isPaidWorkflow ? paymentMethod : 'Efectivo',
        paymentAmountReceived: (isPaidWorkflow && paymentMethod === 'Efectivo') ? parseFloat(cashReceived) : undefined,
        notes: checkoutNotes.trim() || undefined,
        status: 'Pendiente',
        isPaid: isPaidWorkflow,
        timestamp: new Date().toISOString()
      }

      const updatedOrders = [newOrder, ...currentOrders]
      localStorage.setItem('burgers_je_orders', JSON.stringify(updatedOrders))
      setOrders(updatedOrders)

      showToast(
        isPaidWorkflow
          ? `¡Pedido #${String(newOrder.orderNumber).padStart(4, '0')} cobrado y enviado a cocina!`
          : `¡Pedido #${String(newOrder.orderNumber).padStart(4, '0')} enviado a cocina! (Pago pendiente)`,
        'success'
      )
      
      // Reset POS sidebar state
      setCart([])
      setCustomerName('')
      setCashReceived('')
      setCheckoutNotes('')
      setCheckoutErrors({})
      setCheckoutStep('cart')
    } catch (err) {
      console.error(err)
      showToast('Error al guardar el pedido localmente', 'error')
    }
  }

  // --- INLINE ORDER CASH OUT SYNCS TO DATABASE ---
  const handleCashOutOrder = async (e: React.FormEvent, order: Order) => {
    e.preventDefault()
    setPayingError('')

    if (payingMethod === 'Efectivo') {
      const received = parseFloat(payingCashReceived)
      if (isNaN(received) || received < order.total) {
        setPayingError(`El efectivo debe ser de al menos $${order.total}`)
        return
      }
    }

    try {
      const localOrdersStr = localStorage.getItem('burgers_je_orders')
      const currentOrders: Order[] = localOrdersStr ? JSON.parse(localOrdersStr) : []
      const updatedOrders = currentOrders.map((o) => {
        if (o.id === order.id) {
          return {
            ...o,
            isPaid: true,
            paymentMethod: payingMethod,
            paymentAmountReceived: payingMethod === 'Efectivo' ? parseFloat(payingCashReceived) : undefined
          }
        }
        return o
      })

      localStorage.setItem('burgers_je_orders', JSON.stringify(updatedOrders))
      setOrders(updatedOrders)
      showToast(`¡Pedido #${String(order.orderNumber).padStart(4, '0')} cobrado con éxito!`, 'success')
      
      // Reset states
      setPayingOrderId(null)
      setPayingCashReceived('')
      setPayingError('')
    } catch (err) {
      console.error(err)
      showToast('Error al procesar el pago del pedido', 'error')
    }
  }

  // --- DELETE PAST ORDERS FROM DATABASE ---
  const handleDeleteOrder = async (orderId: string, orderNumber: number) => {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el Pedido #${String(orderNumber).padStart(4, '0')}?`)) {
      try {
        const localOrdersStr = localStorage.getItem('burgers_je_orders')
        const currentOrders: Order[] = localOrdersStr ? JSON.parse(localOrdersStr) : []
        const updatedOrders = currentOrders.filter((o) => o.id !== orderId)
        
        localStorage.setItem('burgers_je_orders', JSON.stringify(updatedOrders))
        setOrders(updatedOrders)
        showToast(`Pedido #${String(orderNumber).padStart(4, '0')} eliminado`, 'error')
      } catch (err) {
        console.error(err)
        showToast('Error al eliminar el pedido', 'error')
      }
    }
  }

  const handleClearOrderHistory = () => {
    if (confirm('¿Estás seguro de que deseas vaciar todo el historial de pedidos de forma permanente?')) {
      localStorage.setItem('burgers_je_orders', JSON.stringify([]))
      setOrders([])
      showToast('Historial de pedidos vaciado por completo', 'error')
    }
  }

  // --- ORDER STATUS TRANSITIONS TO DATABASE ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const localOrdersStr = localStorage.getItem('burgers_je_orders')
      const currentOrders: Order[] = localOrdersStr ? JSON.parse(localOrdersStr) : []
      const updatedOrders = currentOrders.map((o) => {
        if (o.id === orderId) {
          return { ...o, status: newStatus }
        }
        return o
      })

      localStorage.setItem('burgers_je_orders', JSON.stringify(updatedOrders))
      setOrders(updatedOrders)
      showToast(`Pedido actualizado a estado: ${newStatus}`, 'info')
    } catch (err) {
      console.error(err)
      showToast('Error al actualizar estado del pedido', 'error')
    }
  }

  // --- ADMIN FOOD MENU CRUD OPERATIONS ON DB ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: { title?: string; price?: string; desc?: string } = {}

    if (!formTitle.trim()) {
      errors.title = 'El título de la comida es obligatorio'
    }
    
    const priceNum = parseFloat(formPrice)
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Ingrese un precio válido mayor a 0'
    }

    if (!formDescription.trim()) {
      errors.desc = 'La descripción es obligatoria para el menú'
    }

    if (Object.keys(errors).length > 0) {
      setAdminErrors(errors)
      showToast('Corrige los datos del formulario de comida', 'error')
      return
    }

    const finalImage = formImage.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'

    try {
      const localProductsStr = localStorage.getItem('burgers_je_products')
      const currentProducts: FoodItem[] = localProductsStr ? JSON.parse(localProductsStr) : []

      if (editingItem) {
        // Edit product
        const updatedProducts = currentProducts.map((item) => {
          if (item.id === editingItem.id) {
            return {
              ...item,
              title: formTitle.trim().toUpperCase(),
              description: formDescription.trim(),
              price: priceNum,
              image: finalImage,
              category: formCategory
            }
          }
          return item
        })

        localStorage.setItem('burgers_je_products', JSON.stringify(updatedProducts))
        setProducts(updatedProducts)
        showToast(`Producto "${formTitle.toUpperCase()}" actualizado`, 'success')
        handleResetAdminForm()
      } else {
        // Create product
        const normalizedTitle = formTitle.trim().toUpperCase()
        const existing = currentProducts.some((item) => item.title === normalizedTitle)

        if (existing) {
          showToast('Ya existe un producto con este título', 'error')
          return
        }

        const newProduct: FoodItem = {
          id: generateUniqueId('prod'),
          title: normalizedTitle,
          description: formDescription.trim(),
          price: priceNum,
          image: finalImage,
          category: formCategory,
          isCustom: true
        }

        const updatedProducts = [...currentProducts, newProduct]
        localStorage.setItem('burgers_je_products', JSON.stringify(updatedProducts))
        setProducts(updatedProducts)
        showToast(`Producto "${newProduct.title}" añadido al menú`, 'success')
        handleResetAdminForm()
      }
    } catch (err) {
      console.error(err)
      showToast('Error al guardar el producto', 'error')
    }
  }

  const handleResetAdminForm = () => {
    setEditingItem(null)
    setFormTitle('')
    setFormDescription('')
    setFormPrice('')
    setFormCategory('Hamburguesas')
    setFormImage('')
    setAdminErrors({})
    setImagePreviewMode('preset')
  }

  const handleEditProductClick = (item: FoodItem) => {
    setEditingItem(item)
    setFormTitle(item.title)
    setFormDescription(item.description)
    setFormPrice(item.price.toString())
    setFormCategory(item.category)
    setFormImage(item.image)
    setAdminErrors({})

    if (PRESET_IMAGES.some((p) => p.url === item.image)) {
      setImagePreviewMode('preset')
    } else {
      setImagePreviewMode('url')
    }
    showToast(`Editando "${item.title}"`, 'info')
  }

  const handleDeleteProduct = async (productId: string, title: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${title}" del menú?`)) {
      try {
        const localProductsStr = localStorage.getItem('burgers_je_products')
        const currentProducts: FoodItem[] = localProductsStr ? JSON.parse(localProductsStr) : []
        const updatedProducts = currentProducts.filter((item) => item.id !== productId)

        localStorage.setItem('burgers_je_products', JSON.stringify(updatedProducts))
        setProducts(updatedProducts)
        setCart((prev) => prev.filter((item) => item.product.id !== productId))
        showToast(`"${title}" eliminado del menú`, 'error')
        if (editingItem?.id === productId) {
          handleResetAdminForm()
        }
      } catch (err) {
        console.error(err)
        showToast('Error al eliminar producto', 'error')
      }
    }
  }

  const handleRestoreDefaultProducts = async () => {
    if (confirm('¿Restaurar base de datos de productos a los valores por defecto del sistema de diseño?')) {
      try {
        showToast('Restableciendo catálogo de comida...', 'info')
        localStorage.setItem('burgers_je_products', JSON.stringify(DEFAULT_PRODUCTS))
        setProducts(DEFAULT_PRODUCTS)
        showToast('Base de datos de productos reestablecida con éxito', 'success')
      } catch (err) {
        console.error(err)
        showToast('Error al reestablecer productos', 'error')
      }
    }
  }

  // --- ADMIN SYSTEM USER MANAGEMENT CRUD ---
  /*
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserFormError('')

    if (!newUserUsername.trim() || !newUserPassword.trim() || !newUserName.trim() || !newUserRole) {
      setUserFormError('Todos los campos son obligatorios para crear personal')
      return
    }

    try {
      const normalizedUsername = newUserUsername.trim().toLowerCase()
      const localUsersStr = localStorage.getItem('burgers_je_users')
      const currentUsers: User[] = localUsersStr ? JSON.parse(localUsersStr) : []

      if (currentUsers.some((u) => u.username === normalizedUsername)) {
        setUserFormError('El nombre de usuario ya está registrado')
        return
      }

      const newUser: User = {
        id: generateUniqueId('user'),
        username: normalizedUsername,
        name: newUserName.trim(),
        role: newUserRole,
        createdAt: new Date().toISOString()
      }

      const updatedUsers = [newUser, ...currentUsers]
      localStorage.setItem('burgers_je_users', JSON.stringify(updatedUsers))
      setPosUsers(updatedUsers)
      showToast(`Usuario "${newUser.username.toUpperCase()}" creado correctamente`, 'success')
      
      // Reset user forms
      setNewUserUsername('')
      setNewUserPassword('')
      setNewUserName('')
      setNewUserRole('STAFF')
    } catch (err) {
      console.error(err)
      setUserFormError('Error al guardar el usuario')
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (confirm(`¿Estás seguro de que deseas desactivar la cuenta del personal "${username.toUpperCase()}"?`)) {
      try {
        if (userId === 'admin-id-default') {
          showToast('No puedes eliminar la cuenta de administrador principal por defecto', 'error')
          return
        }
        const localUsersStr = localStorage.getItem('burgers_je_users')
        const currentUsers: User[] = localUsersStr ? JSON.parse(localUsersStr) : []
        const updatedUsers = currentUsers.filter((u) => u.id !== userId)

        localStorage.setItem('burgers_je_users', JSON.stringify(updatedUsers))
        setPosUsers(updatedUsers)
        showToast(`Cuenta de personal "${username.toUpperCase()}" eliminada`, 'error')
      } catch (err) {
        console.error(err)
        showToast('Error al borrar personal', 'error')
      }
    }
  }
  */

  // --- STATS CALCULATIONS ---
  const statsSalesTotal = orders
    .filter((o) => o.isPaid)
    .reduce((sum, o) => sum + o.total, 0)

  const statsActiveOrders = orders.filter(
    (o) => o.status === 'Pendiente' || o.status === 'En Cocina' || o.status === 'Listo'
  ).length

  const statsBurgersSold = orders
    .filter((o) => o.isPaid)
    .reduce((sum, o) => {
      const burgerItems = o.items.filter((item) => item.product.category === 'Hamburguesas' || item.product.category === 'Combos')
      const count = burgerItems.reduce((s, b) => s + b.quantity, 0)
      return sum + count
    }, 0)

  const paidOrdersList = orders.filter((o) => o.isPaid)
  const statsAverageTicket = paidOrdersList.length > 0 ? Math.round(statsSalesTotal / paidOrdersList.length) : 0

  // --- RENDER MENU ITEMS (POS & VISUAL MENU) ---
  const filteredProducts = products.filter((item) => {
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (isMenuView) {
    return <DigitalMenuBoard products={products} featuredProductId={featuredProductId} />
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative font-poppins selection:bg-red-600 selection:text-white">
      {/* Decorative neon backdrop */}
      <div className="neon-backdrop-burger"></div>

      {/* --- NOTIFICATIONS / TOASTS --- */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            toast={t}
            onClose={(id) => setToasts((prev) => prev.filter((item) => item.id !== id))}
          />
        ))}
      </div>

      {/* --- BRAND HEADER --- */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <HeaderNeonBurger />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bebas text-2xl tracking-wider text-white">BURGERS</span>
              <span className="font-bebas text-2xl tracking-widest text-red-600 neon-glow-text-red">J&E</span>
            </div>
            <p className="text-xs font-semibold text-amber-500 font-bebas m-0 tracking-widest uppercase">
              {CURRENT_USER.name} ({CURRENT_USER.role})
            </p>
          </div>
        </div>

        {/* --- NAVIGATION AND NOTIFICATIONS --- */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <nav className="flex items-center bg-zinc-900 p-1.5 rounded-xl border border-zinc-800/80">
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bebas text-sm sm:text-base tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'pos'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              🛒 PUNTO DE VENTA (POS)
            </button>
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bebas text-sm sm:text-base tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'pedidos'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              📋 CONTROL DE PEDIDOS
              {orders.filter((o) => o.status === 'En Cocina' || o.status === 'Pendiente').length > 0 && (
                <span className="bg-amber-500 text-black font-poppins text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-extrabold animate-pulse">
                  {orders.filter((o) => o.status === 'En Cocina' || o.status === 'Pendiente').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bebas text-sm sm:text-base tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              ⚙️ CONFIGURACIÓN
            </button>
            <a
              href={`?view=menu${featuredProductId ? `&featured=${featuredProductId}` : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bebas text-sm sm:text-base tracking-wider transition-all duration-200 text-yellow-500 hover:text-yellow-400 hover:bg-zinc-800/60 cursor-pointer"
            >
              📺 VER MENÚ
            </a>
          </nav>

          {/* --- NOTIFICATIONS BELL & DROPDOWN --- */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen)
                setUnreadNotificationsCount(0)
              }}
              className={`relative p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 transition-all text-white flex items-center justify-center cursor-pointer ${
                unreadNotificationsCount > 0 ? 'neon-glow-red shake-element' : ''
              }`}
              title="Alertas de Actividad"
            >
              <svg className="w-5.5 h-5.5 text-zinc-300 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse shadow shadow-red-900">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Dropdown Card */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-3">
                  <span className="font-bebas text-base text-white tracking-wider">ALERTAS DE ACTIVIDAD</span>
                  {notificationLog.length > 0 && (
                    <button
                      onClick={() => setNotificationLog([])}
                      className="text-[10px] text-zinc-500 hover:text-red-500 underline font-semibold cursor-pointer"
                    >
                      Limpiar historial
                    </button>
                  )}
                </div>

                {/* Notifications list */}
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {notificationLog.length === 0 ? (
                    <div className="py-8 text-center text-zinc-600 text-xs">
                      <span className="text-2xl block mb-1">📭</span>
                      No hay alertas recientes
                    </div>
                  ) : (
                    notificationLog.map((notif) => (
                      <div
                        key={notif.id}
                        className="bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-900/60 flex gap-2.5 items-start hover:bg-zinc-900/80 transition-colors"
                      >
                        <span className="text-sm mt-0.5 select-none">
                          {notif.type === 'success' ? '🔥' : notif.type === 'error' ? '❌' : '⚡'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-zinc-200 leading-tight m-0 font-medium break-words">
                            {notif.text}
                          </p>
                          <span className="text-[9px] text-zinc-500 font-mono block mt-1.5">
                            {new Date(notif.time).toLocaleTimeString('es-MX', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- MAIN BODY CONTENT --- */}
      <main className="flex-1 flex flex-col z-10">
        
        {/* ======================================= */}
        {/* 1. PUNTO DE VENTA (POS) TAB */}
        {/* ======================================= */}
        {activeTab === 'pos' && (
          <div className="flex-1 flex flex-col lg:flex-row">
            
            {/* LEFT SIDE: MENU LIST (2/3 width) */}
            <div className="flex-1 p-6 border-r border-zinc-900 flex flex-col">
              
              {/* Category Grid and Search bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {['Todas', 'Hamburguesas', 'Combos', 'Bebidas', 'Promos', 'Otros'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`category-badge cursor-pointer ${selectedCategory === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar comida o bebida..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="custom-input pl-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Products Display Grid */}
              {filteredProducts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-zinc-950/40 rounded-2xl border border-dashed border-zinc-800">
                  <span className="text-5xl mb-4">🍔</span>
                  <h3 className="font-bebas text-2xl text-amber-500">No se encontraron productos</h3>
                  <p className="text-zinc-500 text-sm max-w-md mt-1">
                    No hay productos configurados en esta categoría o que coincidan con tu búsqueda. Puedes agregar nuevos platos en la pestaña de <strong>Configuración</strong>.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleAddToCart(item)}
                      className="card-classic cursor-pointer select-none active:scale-[0.98] transition-transform duration-100 group"
                    >
                      {/* Product Image */}
                      <div className="card-classic-img-container">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="card-classic-img"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
                          }}
                        />
                        {item.category === 'Promos' && (
                          <div className="card-classic-badge font-bold">🔥</div>
                        )}
                        <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded text-amber-500 uppercase">
                          {item.category}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="card-classic-title">{item.title}</h3>
                      <p className="card-classic-desc">{item.description}</p>

                      {/* Footer */}
                      <div className="card-classic-footer border-t border-zinc-900/60 pt-2.5 mt-auto">
                        <span className="card-classic-price">${item.price}</span>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 group-hover:text-red-500 transition-colors flex items-center gap-1.5">
                          ➕ AGREGAR AL PEDIDO
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT SIDE: CURRENT ORDER SIDEBAR (1/3 width) */}
            <div className="w-full lg:w-[420px] bg-zinc-950 p-6 flex flex-col border-t lg:border-t-0 border-zinc-900 sticky top-24 self-start max-h-[calc(100vh-96px)] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛒</span>
                  <h2 className="font-bebas text-2xl tracking-wider text-white m-0">PEDIDO ACTUAL</h2>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-xs text-red-500 hover:text-red-400 underline font-semibold focus:outline-none cursor-pointer"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4">
                  <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                    <span className="text-4xl">🍔</span>
                  </div>
                  <h3 className="font-bebas text-xl text-zinc-400">PEDIDO VACÍO</h3>
                  <p className="text-zinc-600 text-xs max-w-xs mt-1">
                    Selecciona productos del menú de la izquierda para comenzar a armar el pedido de Burgers J&E.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {checkoutStep === 'cart' ? (
                    <>
                      {/* Cart Item Cards */}
                      <div className="space-y-3 mb-4 max-h-[380px] overflow-y-auto pr-1">
                        {cart.map((item) => (
                          <div
                            key={item.product.id}
                            className="bg-zinc-900 p-3 rounded-xl border border-zinc-800/60 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={item.product.image}
                                  alt={item.product.title}
                                  className="w-12 h-12 object-cover rounded-lg border border-zinc-800"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
                                  }}
                                />
                                <div className="min-w-0">
                                  <h4 className="font-bebas text-base text-yellow-accent truncate m-0">
                                    {item.product.title}
                                  </h4>
                                  <span className="text-xs text-zinc-500 block font-semibold">
                                    ${item.product.price} x {item.quantity} = ${item.product.price * item.quantity}
                                  </span>
                                </div>
                              </div>

                              {/* Quantity controls */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center bg-black rounded-lg border border-zinc-800">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.product.id, -1)}
                                    className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-l-lg font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 text-sm font-bold font-mono text-white">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item.product.id, 1)}
                                    className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-r-lg font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                                
                                <button
                                  onClick={() => handleRemoveFromCart(item.product.id, item.product.title)}
                                  className="text-zinc-600 hover:text-red-500 p-1 transition-colors duration-150 cursor-pointer"
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>

                            {/* Collapsible / Expanding Notes for this Product */}
                            <div className="border-t border-zinc-900/60 pt-2 flex flex-col">
                              {expandedNotesProductIds.includes(item.product.id) ? (
                                <div className="flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-100">
                                  <input
                                    type="text"
                                    placeholder="Nota (ej. sin cebolla, extra salsa...)"
                                    value={item.customNotes || ''}
                                    onChange={(e) => handleUpdateCartItemNotes(item.product.id, e.target.value)}
                                    className="flex-1 bg-black/60 text-[11px] px-2.5 py-1.5 rounded border border-zinc-800 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-500/60"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => toggleNoteExpand(item.product.id)}
                                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[10px] px-2.5 py-1.5 rounded text-white font-bold cursor-pointer transition-colors"
                                  >
                                    Listo
                                  </button>
                                </div>
                              ) : item.customNotes ? (
                                <div className="flex items-center justify-between text-[11px] bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 px-2.5 py-1 mt-0.5 animate-in fade-in duration-150">
                                  <span className="truncate font-semibold italic">📝 "{item.customNotes}"</span>
                                  <button
                                    type="button"
                                    onClick={() => toggleNoteExpand(item.product.id)}
                                    className="text-[10px] text-zinc-400 hover:text-white underline ml-2 cursor-pointer font-bold"
                                  >
                                    Editar
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => toggleNoteExpand(item.product.id)}
                                  className="text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold flex items-center gap-1.5 self-start pt-0.5 cursor-pointer transition-colors"
                                >
                                  📝 + Agregar nota al cocinero (sin cebolla, etc.)
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary math */}
                      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800/80 mb-4 space-y-2">
                        <div className="flex justify-between text-sm text-zinc-400">
                          <span>Subtotal:</span>
                          <span className="font-mono text-white font-semibold">${subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm text-zinc-400">
                          <span>IVA (16% Incl.):</span>
                          <span className="font-mono text-white font-semibold">${taxAmount}</span>
                        </div>
                        <div className="border-t border-zinc-800 my-2 pt-2 flex justify-between">
                          <span className="font-bebas text-lg text-white">TOTAL A COBRAR:</span>
                          <span className="font-mono text-xl text-red-600 neon-glow-text-red font-bold">
                            ${grandTotal}
                          </span>
                        </div>
                      </div>

                      {/* Next step button */}
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('details')}
                        className="btn-primary w-full py-3.5 pulse-red-glow font-bebas text-base flex items-center justify-center gap-2 cursor-pointer"
                      >
                        CONTINUAR CON LOS DATOS ➔
                      </button>
                    </>
                  ) : (
                    <div className="animate-in slide-in-from-right-2 duration-150 flex flex-col h-full">
                      {/* Back link */}
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('cart')}
                        className="text-xs text-zinc-500 hover:text-white flex items-center gap-1.5 mb-4 font-semibold focus:outline-none cursor-pointer self-start transition-colors"
                      >
                        ⬅️ Volver a la lista de comida
                      </button>

                      {/* Quick account badge */}
                      <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-900 mb-4 flex justify-between items-center text-sm">
                        <span className="text-zinc-400 font-semibold uppercase font-bebas tracking-wide">Total a pagar:</span>
                        <span className="font-mono text-emerald-400 font-extrabold text-base">${grandTotal} MXN</span>
                      </div>

                      {/* Checkout Payment Form */}
                      <div className="space-y-4">
                        {/* Customer Name */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                            Nombre del Cliente *
                          </label>
                          <input
                            type="text"
                            placeholder="Ingresa nombre de cliente"
                            value={customerName}
                            onChange={(e) => {
                              setCustomerName(e.target.value)
                              if (e.target.value.trim()) {
                                setCheckoutErrors((prev) => ({ ...prev, name: undefined }))
                              }
                            }}
                            className={`custom-input ${checkoutErrors.name ? 'custom-input-error' : ''}`}
                            autoFocus
                          />
                          {checkoutErrors.name && (
                            <p className="error-message">{checkoutErrors.name}</p>
                          )}
                        </div>

                        {/* Payment Method */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                            Método de Pago (Si cobra ahora)
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['Efectivo', 'Transferencia'] as const).map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => {
                                  setPaymentMethod(method)
                                  setCheckoutErrors((prev) => ({ ...prev, cash: undefined }))
                                }}
                                className={`py-2 px-1 text-xs rounded-lg font-bebas tracking-wide border transition-all duration-150 cursor-pointer ${
                                  paymentMethod === method
                                    ? 'bg-amber-500 border-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                                    : 'bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                                }`}
                              >
                                {method === 'Efectivo' ? '💵 EFECTIVO' : '🏦 TRANSF.'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Cash received calculator */}
                        {paymentMethod === 'Efectivo' && (
                          <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 space-y-3">
                            <div>
                              <label className="block text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                                Efectivo Recibido ($)
                              </label>
                              <input
                                type="number"
                                placeholder="Monto de dinero pagado"
                                value={cashReceived}
                                onChange={(e) => {
                                  setCashReceived(e.target.value)
                                  setCheckoutErrors((prev) => ({ ...prev, cash: undefined }))
                                }}
                                className={`custom-input py-2 text-sm ${checkoutErrors.cash ? 'custom-input-error' : ''}`}
                              />
                              {checkoutErrors.cash && (
                                <p className="error-message">{checkoutErrors.cash}</p>
                              )}
                            </div>

                            {/* Quick amount shortcuts */}
                            <div className="flex flex-wrap gap-1.5">
                              {[grandTotal, 100, 200, 500, 1000].map((amt) => {
                                if (amt < grandTotal && amt !== grandTotal) return null
                                return (
                                  <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setCashReceived(amt.toString())}
                                    className="bg-black border border-zinc-800 hover:border-zinc-600 text-[11px] px-2 py-1 rounded text-zinc-300 cursor-pointer"
                                  >
                                    ${amt}
                                  </button>
                                )
                              })}
                            </div>

                            {cashChange !== null && (
                              <div className="bg-emerald-950/40 border border-emerald-500 p-2 rounded flex justify-between items-center text-xs">
                                <span className="text-emerald-400 font-semibold">Cambio a entregar:</span>
                                <span className="font-mono text-emerald-400 font-bold text-sm">
                                  ${Math.round(cashChange)} MXN
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notes / Special Requests */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                            Notas Especiales del Pedido (Mesa, Dirección, etc.)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Ej. Entregar en la mesa 3..."
                            value={checkoutNotes}
                            onChange={(e) => setCheckoutNotes(e.target.value)}
                            className="custom-input py-2.5 text-sm resize-none"
                          />
                        </div>

                        {/* Dual Checkout Buttons */}
                        <div className="grid grid-cols-1 gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={(e) => handleConfirmOrder(e, false)}
                            className="btn-secondary w-full py-3 font-bebas text-base"
                          >
                            👨‍🍳 ENVIAR A COCINA (PAGO PENDIENTE)
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleConfirmOrder(e, true)}
                            className="btn-primary w-full py-3 pulse-red-glow font-bebas text-lg"
                          >
                            🔥 COBRAR Y ENVIAR A COCINA
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* 2. CONTROL DE PEDIDOS TAB */}
        {/* ======================================= */}
        {activeTab === 'pedidos' && (
          <div className="flex-1 p-6 space-y-6">
            
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-xl">
                  💰
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider m-0">Ventas Totales</p>
                  <h3 className="font-mono text-2xl text-emerald-400 font-bold m-0">${statsSalesTotal}</h3>
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-xl">
                  🍔
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider m-0">Activos en Cocina</p>
                  <h3 className="font-mono text-2xl text-amber-400 font-bold m-0">{statsActiveOrders}</h3>
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-xl">
                  🔥
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider m-0">Platos Entregados</p>
                  <h3 className="font-mono text-2xl text-red-500 font-bold m-0">{statsBurgersSold}</h3>
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-xl">
                  📈
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider m-0">Ticket Promedio</p>
                  <h3 className="font-mono text-2xl text-purple-400 font-bold m-0">${statsAverageTicket}</h3>
                </div>
              </div>
            </div>

            {/* ORDERS FILTER NAVIGATION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <h2 className="font-bebas text-2xl tracking-wider text-white m-0">PANEL DE CONTROL DE PEDIDOS</h2>
                </div>
                {orders.length > 0 && (
                  <button
                    onClick={handleClearOrderHistory}
                    className="text-xs text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500 bg-zinc-900/40 px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all cursor-pointer animate-in fade-in duration-200"
                  >
                    🗑️ Vaciar Historial de Pedidos
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                {(['Todos', 'Pendiente', 'En Cocina', 'Listo', 'Entregado', 'Cancelado'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-lg font-bebas text-xs sm:text-sm tracking-wider transition-all cursor-pointer ${
                      orderFilter === st
                        ? 'bg-zinc-800 text-white font-bold border border-zinc-700 shadow'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {st === 'Todos' ? '📂 TODOS' : st.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* ORDERS GRID DISPLAY */}
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-16 bg-zinc-950/40 rounded-2xl border border-dashed border-zinc-900">
                <span className="text-5xl mb-4">📝</span>
                <h3 className="font-bebas text-2xl text-zinc-500">Sin historial de pedidos</h3>
                <p className="text-zinc-600 text-sm max-w-sm mt-1">
                  Aquí aparecerán los pedidos de hamburguesas que registres en el Punto de Venta (POS).
                </p>
              </div>
            ) : orders.filter((o) => orderFilter === 'Todos' || o.status === orderFilter).length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-16 bg-zinc-950/40 rounded-2xl border border-dashed border-zinc-900">
                <span className="text-4xl mb-3">🔍</span>
                <h3 className="font-bebas text-xl text-zinc-500">Ningún pedido con estado "{orderFilter}"</h3>
                <p className="text-zinc-600 text-xs mt-1">
                  No hay órdenes actuales que correspondan con este filtro de estado seleccionado.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {orders
                  .filter((o) => orderFilter === 'Todos' || o.status === orderFilter)
                  .map((order) => {
                    const paddedNum = String(order.orderNumber).padStart(4, '0')
                    return (
                      <div
                        key={order.id}
                        className={`bg-zinc-950 rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                          order.status === 'Pendiente'
                            ? 'border-zinc-800/80 hover:border-orange-500/50'
                            : order.status === 'En Cocina'
                              ? 'border-amber-500/30 hover:border-amber-500/60'
                              : order.status === 'Listo'
                                ? 'border-emerald-500/30 hover:border-emerald-500/60'
                                : 'border-zinc-900'
                        }`}
                      >
                        {/* Header card info */}
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div>
                                <h3 className="font-bebas text-lg text-white m-0">
                                  PEDIDO <span className="text-red-500 text-xl font-bold">#{paddedNum}</span>
                                </h3>
                                <span className="text-xs text-zinc-500 block font-semibold mt-0.5">
                                  {new Date(order.timestamp).toLocaleTimeString('es-MX', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })}{' '}
                                  - {new Date(order.timestamp).toLocaleDateString('es-MX')}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                                className="bg-zinc-900 hover:bg-red-950/60 border border-zinc-800 p-1.5 rounded-lg text-xs hover:text-red-400 cursor-pointer transition-all"
                                title="Eliminar este pedido permanentemente"
                              >
                                🗑️
                              </button>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <span
                                className={`status-pill ${
                                  order.status === 'Pendiente'
                                    ? 'status-pendiente'
                                    : order.status === 'En Cocina'
                                      ? 'status-cocina'
                                      : order.status === 'Listo'
                                        ? 'status-listo'
                                        : order.status === 'Entregado'
                                          ? 'status-entregado'
                                          : 'status-cancelado'
                                }`}
                              >
                                {order.status}
                              </span>
                              {!order.isPaid ? (
                                <span className="bg-red-950/80 border border-red-500 text-red-500 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow shadow-red-950/20 uppercase animate-pulse">
                                  ⚠️ PAGO PENDIENTE
                                </span>
                              ) : (
                                <span className="bg-emerald-950/80 border border-emerald-500 text-emerald-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow shadow-emerald-950/20 uppercase">
                                  ✅ PAGADO
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Customer Name */}
                          <div className="mb-3">
                            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Cliente</span>
                            <p className="text-sm font-semibold text-white m-0 truncate">{order.customerName}</p>
                          </div>

                          {/* Order Items list */}
                          <div className="space-y-2.5 my-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-900">
                            {order.items.map((item, index) => (
                              <div key={index} className="space-y-1 text-xs border-b border-zinc-800/40 pb-1.5 last:border-b-0 last:pb-0">
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-300 font-medium">
                                    {item.quantity}x <span className="text-white font-semibold">{item.product.title}</span>
                                  </span>
                                  <span className="text-zinc-500 font-mono">${item.product.price * item.quantity}</span>
                                </div>
                                {item.customNotes && (
                                  <div className="text-[11px] text-amber-500 font-semibold italic bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                                    ↳ "Nota: {item.customNotes}"
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Order Notes */}
                          {order.notes && (
                            <div className="bg-amber-950/10 border border-amber-900/40 p-2.5 rounded-lg mb-3">
                              <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest block">Notas Generales</span>
                              <p className="text-xs text-amber-100/90 italic m-0">"{order.notes}"</p>
                            </div>
                          )}
                        </div>

                        {/* Totals & Payment Method */}
                        <div className="border-t border-zinc-900 pt-3 mt-3">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              {order.isPaid ? (
                                <>
                                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Pago: {order.paymentMethod}</span>
                                  {order.paymentAmountReceived && (
                                    <span className="text-[10px] text-zinc-500 block">Recibido: ${order.paymentAmountReceived}</span>
                                  )}
                                </>
                              ) : (
                                <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-wider block">⚠️ SIN COBRAR</span>
                              )}
                            </div>
                            <span className="font-mono text-lg text-emerald-400 font-bold">
                              ${order.total}
                            </span>
                          </div>

                          {/* Inline Payment Collection Drawer */}
                          {!order.isPaid && payingOrderId === order.id && (
                            <form onSubmit={(e) => handleCashOutOrder(e, order)} className="bg-zinc-900 p-3 rounded-lg border border-amber-500/30 mb-4 space-y-3">
                              <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5">
                                <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">💵 Registrar Cobro</span>
                                <button
                                  type="button"
                                  onClick={() => setPayingOrderId(null)}
                                  className="text-zinc-500 hover:text-white text-xs font-semibold cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Método de Pago</label>
                                <div className="grid grid-cols-2 gap-1 bg-black p-0.5 rounded-lg border border-zinc-800">
                                  {(['Efectivo', 'Transferencia'] as const).map((method) => (
                                    <button
                                      key={method}
                                      type="button"
                                      onClick={() => setPayingMethod(method)}
                                      className={`py-1.5 text-[10px] rounded font-bebas tracking-wide transition-all cursor-pointer ${
                                        payingMethod === method
                                          ? 'bg-amber-500 text-black font-bold'
                                          : 'text-zinc-500 hover:text-white'
                                      }`}
                                    >
                                      {method === 'Efectivo' ? '💵 EF' : '🏦 TR'}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {payingMethod === 'Efectivo' && (
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Efectivo Recibido ($)</label>
                                  <input
                                    type="number"
                                    placeholder={`Min: $${order.total}`}
                                    value={payingCashReceived}
                                    onChange={(e) => setPayingCashReceived(e.target.value)}
                                    className="custom-input py-1.5 px-2 text-xs bg-black"
                                  />
                                  {payingCashReceived && parseFloat(payingCashReceived) >= order.total && (
                                    <div className="text-[10px] text-emerald-400 font-bold bg-emerald-950/20 p-1 rounded flex justify-between">
                                      <span>Cambio:</span>
                                      <span>${parseFloat(payingCashReceived) - order.total}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {payingError && (
                                <p className="text-[10px] text-red-500 font-semibold m-0">{payingError}</p>
                              )}

                              <button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bebas text-xs py-2 rounded-lg font-bold tracking-wide transition-all uppercase cursor-pointer"
                              >
                                💸 Confirmar y Cobrar
                              </button>
                            </form>
                          )}

                          {/* Chef and payment Actions */}
                          <div className="flex flex-col gap-2 pt-1">
                            
                            {/* Show the trigger Cobrar button if not paid yet & not currently paying */}
                            {!order.isPaid && payingOrderId !== order.id && (
                              <button
                                onClick={() => {
                                  setPayingOrderId(order.id)
                                  setPayingMethod('Efectivo')
                                  setPayingCashReceived('')
                                  setPayingError('')
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bebas text-xs py-2 px-3 rounded-lg font-bold tracking-wide transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                💵 REGISTRAR COBRO / COBRAR PEDIDO
                              </button>
                            )}

                            <div className="flex gap-2">
                              {order.status === 'Pendiente' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'En Cocina')}
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bebas text-xs py-2 px-1 rounded-lg font-bold tracking-wide transition-colors cursor-pointer"
                                  >
                                    👨‍🍳 PREPARAR (A COCINA)
                                  </button>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'Cancelado')}
                                    className="border border-red-950 hover:bg-red-950/50 text-red-500 font-bebas text-xs py-2 px-2.5 rounded-lg font-bold tracking-wide transition-all cursor-pointer"
                                  >
                                    CANCELAR
                                  </button>
                                </>
                              )}

                              {order.status === 'En Cocina' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'Listo')}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bebas text-xs py-2 px-1 rounded-lg font-bold tracking-wide transition-colors cursor-pointer"
                                  >
                                    🔔 MARCAR LISTO
                                  </button>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'Cancelado')}
                                    className="border border-zinc-800 text-zinc-500 hover:text-red-500 font-bebas text-xs py-2 px-2.5 rounded-lg transition-colors cursor-pointer"
                                  >
                                    CANCELAR
                                  </button>
                                </>
                              )}

                              {order.status === 'Listo' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'Entregado')}
                                    className="flex-1 bg-white hover:bg-zinc-200 text-black font-bebas text-xs py-2 px-1 rounded-lg font-bold tracking-wide transition-colors cursor-pointer"
                                  >
                                    📦 ENTREGAR PEDIDO
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Print receipt action */}
                            <button
                              onClick={() => setPrintingOrder(order)}
                              className="btn-secondary w-full flex items-center justify-center gap-2 text-xs py-2 mt-1 font-bebas tracking-wide"
                            >
                              🖨️ IMPRIMIR TICKET DE VENTA
                            </button>
                          </div>
                        </div>

                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* 3. CONFIGURACIÓN TAB (ADMIN ONLY) */}
        {/* ======================================= */}
        {activeTab === 'admin' && (
          <div className="flex-1 p-6 flex flex-col xl:flex-row gap-6">
            
            {/* COLUMN 1: FOOD MENU CRUD FORM (1/3) */}
            <div className="w-full xl:w-[400px] bg-zinc-950 rounded-2xl border border-zinc-900 p-6 self-start">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛠️</span>
                  <h2 className="font-bebas text-2xl tracking-wider text-white m-0">
                    {editingItem ? 'EDITAR ALIMENTO' : 'AGREGAR AL MENÚ'}
                  </h2>
                </div>
                {editingItem && (
                  <button
                    onClick={handleResetAdminForm}
                    className="text-xs text-zinc-500 hover:text-white underline font-semibold cursor-pointer"
                  >
                    Nuevo plato
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Título del Alimento *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. LA VOLCÁN, COMBO DOBLE, PAPAS..."
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value)
                      if (e.target.value.trim()) {
                        setAdminErrors((prev) => ({ ...prev, title: undefined }))
                      }
                    }}
                    className={`custom-input uppercase font-bebas tracking-wide ${
                      adminErrors.title ? 'custom-input-error' : ''
                    }`}
                  />
                  {adminErrors.title && (
                    <p className="error-message">{adminErrors.title}</p>
                  )}
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as FoodItem['category'])}
                    className="custom-input cursor-pointer font-bebas text-sm tracking-wide bg-zinc-950 text-white"
                  >
                    <option value="Hamburguesas">🍔 HAMBURGUESAS</option>
                    <option value="Combos">🍟 COMBOS</option>
                    <option value="Bebidas">🥤 BEBIDAS</option>
                    <option value="Promos">🔥 PROMOS</option>
                    <option value="Otros">🥓 OTROS</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Precio de Venta ($) *
                  </label>
                  <input
                    type="number"
                    placeholder="Ej. 149"
                    value={formPrice}
                    onChange={(e) => {
                      setFormPrice(e.target.value)
                      if (e.target.value.trim() && parseFloat(e.target.value) > 0) {
                        setAdminErrors((prev) => ({ ...prev, price: undefined }))
                      }
                    }}
                    className={`custom-input ${adminErrors.price ? 'custom-input-error' : ''}`}
                  />
                  {adminErrors.price && (
                    <p className="error-message">{adminErrors.price}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Descripción del Ingrediente/Plato *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ingredientes detallados de la hamburguesa..."
                    value={formDescription}
                    onChange={(e) => {
                      setFormDescription(e.target.value)
                      if (e.target.value.trim()) {
                        setAdminErrors((prev) => ({ ...prev, desc: undefined }))
                      }
                    }}
                    className={`custom-input py-2 text-sm ${adminErrors.desc ? 'custom-input-error' : ''}`}
                  />
                  {adminErrors.desc && (
                    <p className="error-message">{adminErrors.desc}</p>
                  )}
                </div>

                {/* Image configuration */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider m-0">
                    Imagen del Producto
                  </label>
                  
                  {/* Image source selector buttons */}
                  <div className="grid grid-cols-2 gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setImagePreviewMode('preset')}
                      className={`py-1 text-[10px] rounded font-bold uppercase transition-all cursor-pointer ${
                        imagePreviewMode === 'preset' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-350'
                      }`}
                    >
                      Predeterminadas
                    </button>
                    <button
                      type="button"
                      onClick={() => setImagePreviewMode('url')}
                      className={`py-1 text-[10px] rounded font-bold uppercase transition-all cursor-pointer ${
                        imagePreviewMode === 'url' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-350'
                      }`}
                    >
                      Enlace URL
                    </button>
                  </div>

                  {/* PRESET CHIPS */}
                  {imagePreviewMode === 'preset' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        {PRESET_IMAGES.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormImage(img.url)}
                            className={`relative h-14 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                              formImage === img.url
                                ? 'border-amber-500 shadow-md shadow-amber-500/20'
                                : 'border-zinc-800 hover:border-zinc-600'
                            }`}
                            title={img.label}
                          >
                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                            {formImage === img.url && (
                              <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center">
                                <span className="bg-amber-500 text-black text-[9px] px-1 rounded font-bold">LISTO</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EXTERNAL URL INPUT */}
                  {imagePreviewMode === 'url' && (
                    <div>
                      <input
                        type="url"
                        placeholder="Inserta enlace HTTPS de imagen..."
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="custom-input py-2 text-xs"
                      />
                    </div>
                  )}

                  {/* Image Preview Box */}
                  {formImage && (
                    <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800 flex items-center gap-3">
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded border border-zinc-800"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">Vista Previa de Imagen</span>
                        <p className="text-[10px] text-zinc-400 truncate m-0">{formImage}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormImage('')}
                        className="text-zinc-500 hover:text-red-500 text-xs px-2 cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="btn-primary flex-1 py-3 font-bebas text-base cursor-pointer"
                  >
                    {editingItem ? '💾 GUARDAR CAMBIOS' : '➕ GUARDAR PLATO EN MENÚ'}
                  </button>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={handleResetAdminForm}
                      className="btn-outline-red py-3 text-base px-4 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* COLUMN 2: FOOD LIST IN DATABASE (1/3) */}
            <div className="flex-1 bg-zinc-950 rounded-2xl border border-zinc-900 p-6 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4 mb-6">
                  <div>
                    <h2 className="font-bebas text-2xl tracking-wider text-white m-0">ALIMENTOS EN BASE DE DATOS ({products.length})</h2>
                    <p className="text-xs text-zinc-500 m-0">Lista guardada de forma remota en tu PostgreSQL de Neon.</p>
                  </div>
                  
                  <button
                    onClick={handleRestoreDefaultProducts}
                    className="text-xs text-amber-500 hover:text-amber-400 font-bold border border-amber-500/20 hover:border-amber-500 bg-zinc-900 py-2 px-3 rounded-lg transition-all cursor-pointer"
                  >
                    🔄 REESTABLECER BASE DE DATOS
                  </button>
                </div>

                {/* Table list */}
                <div className="overflow-y-auto max-h-[450px]">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 w-16">Foto</th>
                        <th className="pb-3 pl-4">Plato</th>
                        <th className="pb-3">Categoría</th>
                        <th className="pb-3 text-right">Precio</th>
                        <th className="pb-3 text-right pr-4">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {products.map((item) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-zinc-900/40 transition-colors group ${
                            editingItem?.id === item.id ? 'bg-amber-950/10' : ''
                          }`}
                        >
                          <td className="py-3">
                            <img
                              src={item.image}
                              alt=""
                              className="w-10 h-10 object-cover rounded-md border border-zinc-800"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
                              }}
                            />
                          </td>
                          <td className="py-3 pl-4">
                            <h4 className="font-bebas text-base text-yellow-accent m-0 group-hover:text-white transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-xs text-zinc-500 m-0 line-clamp-1 max-w-xs">
                              {item.description}
                            </p>
                          </td>
                          <td className="py-3">
                            <span className="text-xs font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded uppercase">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono text-sm text-red-500 font-bold">
                            ${item.price}
                          </td>
                          <td className="py-3 text-right pr-4">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleEditProductClick(item)}
                                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-1.5 rounded-lg text-xs hover:text-white cursor-pointer"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(item.id, item.title)}
                                className="bg-zinc-900 hover:bg-red-950/60 border border-zinc-800 p-1.5 rounded-lg text-xs hover:text-red-400 cursor-pointer"
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* COLUMN 3: STAFF ACCOUNTS USER CONFIG (1/3) - HIDDEN BY USER REQUEST
            <div className="w-full xl:w-[420px] bg-zinc-950 rounded-2xl border border-zinc-900 p-6 flex flex-col justify-between">
              <div>
                <div className="border-b border-zinc-900 pb-4 mb-5">
                  <h2 className="font-bebas text-2xl tracking-wider text-white m-0">👥 GESTIÓN DE PERSONAL</h2>
                  <p className="text-xs text-zinc-500 m-0">Da de alta cajeros y administradores con roles de seguridad.</p>
                </div>

                <form onSubmit={handleCreateUserSubmit} className="space-y-4 mb-6 border-b border-zinc-900/60 pb-5">
                  {userFormError && (
                    <p className="bg-red-950/20 border border-red-500/40 p-2 rounded-lg text-[11px] text-red-400 font-semibold">{userFormError}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        placeholder="Ej. Juan López"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="custom-input py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Usuario de Acceso</label>
                      <input
                        type="text"
                        placeholder="Ej. juan123"
                        value={newUserUsername}
                        onChange={(e) => setNewUserUsername(e.target.value)}
                        className="custom-input py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Contraseña</label>
                      <input
                        type="password"
                        placeholder="Mín. 4 caracteres"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="custom-input py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Rol de Usuario</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as 'ADMIN' | 'STAFF')}
                        className="custom-input py-2 text-xs bg-zinc-950 text-white cursor-pointer"
                      >
                        <option value="STAFF">🙋‍♂️ STAFF (SÓLO ORDENAR)</option>
                        <option value="ADMIN">👑 ADMIN (CONTROL TOTAL)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bebas text-sm py-2 px-3 rounded-lg font-bold tracking-wide transition-colors cursor-pointer"
                  >
                    ➕ DAR DE ALTA PERSONAL
                  </button>
                </form>

                <div>
                  <h3 className="font-bebas text-lg text-white mb-2.5 tracking-wider">Cuentas Registradas</h3>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {posUsers.map((u) => (
                      <div
                        key={u.id}
                        className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-900 flex justify-between items-center gap-3"
                      >
                        <div className="min-w-0">
                          <h4 className="font-bebas text-base text-yellow-accent m-0 flex items-center gap-2">
                            {u.name}
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              u.role === 'ADMIN' ? 'bg-red-950 text-red-400 border border-red-900/60' : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {u.role}
                            </span>
                          </h4>
                          <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Usuario: @{u.username}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          disabled={CURRENT_USER.id === u.id || u.username === 'admin'}
                          className="bg-zinc-950 hover:bg-red-950/40 border border-zinc-850 p-1.5 rounded-lg text-xs hover:text-red-400 disabled:opacity-30 disabled:hover:bg-zinc-950 disabled:hover:text-zinc-600 cursor-pointer disabled:cursor-not-allowed"
                          title="Eliminar usuario"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            */}

            {/* COLUMN 3: FEATURED RECOMMENDATION SELECTION (1/3) */}
            <div className="w-full xl:w-[420px] bg-zinc-950 rounded-2xl border border-zinc-900 p-6 flex flex-col justify-between">
              <div>
                <div className="border-b border-zinc-900 pb-4 mb-5">
                  <h2 className="font-bebas text-2xl tracking-wider text-white m-0">✨ RECOMENDACIÓN DE HOY</h2>
                  <p className="text-xs text-zinc-500 m-0">Elige el plato destacado que se mostrará en la pantalla gigante de los clientes.</p>
                </div>

                {/* Select product */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Seleccionar Producto
                    </label>
                    <select
                      value={featuredProductId}
                      onChange={(e) => handleSetFeaturedProduct(e.target.value)}
                      className="custom-input py-2.5 text-xs bg-zinc-950 text-white cursor-pointer w-full"
                    >
                      <option value="">🔄 Rotación Automática (Combos/Promos)</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.category.toUpperCase()}] - {p.title} (${p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Featured product preview card */}
                  {(() => {
                    const featProd = products.find((p) => p.id === featuredProductId)
                    if (!featProd) {
                      return (
                        <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center text-zinc-600 text-xs font-medium">
                          Modo automático activo. El sistema rotará los combos y promociones principales en la pantalla de clientes.
                        </div>
                      )
                    }
                    return (
                      <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-4">
                        <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                          Vista previa en pantalla:
                        </div>
                        <div className="flex gap-4 items-center">
                          {featProd.image && (
                            <img
                              src={featProd.image}
                              alt={featProd.title}
                              className="w-16 h-16 object-cover rounded-xl border border-zinc-800"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
                              }}
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bebas text-lg text-yellow-accent truncate m-0">
                              {featProd.title}
                            </h4>
                            <span className="font-mono text-sm text-red-500 font-bold">
                              ${featProd.price}
                            </span>
                            <p className="text-[10px] text-zinc-500 truncate m-0 mt-1">
                              {featProd.description}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSetFeaturedProduct('')}
                          className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-bebas text-xs py-2 rounded-lg tracking-wide transition-colors cursor-pointer"
                        >
                          ❌ QUITAR DESTACADO
                        </button>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* --- DESIGN SYSTEM LOGO FOOTER --- */}
      <footer className="bg-black border-t border-zinc-950 py-10 px-6 flex flex-col items-center justify-center text-center gap-6 z-10 relative overflow-hidden">
        <BurgerLogoIcon />
        
        <div className="space-y-1">
          <p className="font-bebas text-lg text-white m-0 tracking-wider">
            SISTEMA DE DISEÑO • BURGERS J&E
          </p>
          <p className="text-xs text-zinc-500 m-0 font-poppins">
            Sabor que prende, estilo que sorprende. Sistema POS de alto rendimiento para control de ventas.
          </p>
        </div>

        {/* Icons row from design system Section 03 */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-2 text-zinc-500">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="text-red-500 neon-glow-text-red">
              <IconBurger />
            </div>
            <span className="text-[9px] font-bold font-bebas uppercase tracking-wider text-zinc-400">HAMBURGUESA</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="text-red-500">
              <IconSteak />
            </div>
            <span className="text-[9px] font-bold font-bebas uppercase tracking-wider text-zinc-400">CARNE PREMIUM</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="text-red-500">
              <IconLeaves />
            </div>
            <span className="text-[9px] font-bold font-bebas uppercase tracking-wider text-zinc-400">FRESCOS</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="text-red-500">
              <IconDelivery />
            </div>
            <span className="text-[9px] font-bold font-bebas uppercase tracking-wider text-zinc-400">ENTREGA RÁPIDA</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="text-red-500 neon-glow-text-red">
              <IconFire />
            </div>
            <span className="text-[9px] font-bold font-bebas uppercase tracking-wider text-zinc-400">SABOR ÚNICO</span>
          </div>
        </div>

        <div className="text-[10px] text-zinc-700 font-mono mt-4">
          © {new Date().getFullYear()} BURGERS J&E. Todos los derechos reservados.
        </div>
      </footer>

      {/* --- PRINT PREVIEW MODAL --- */}
      {printingOrder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-zinc-900 border-b border-zinc-850 px-5 py-4 flex items-center justify-between">
              <span className="font-bebas text-lg tracking-wider text-white">🖨️ TICKET DE VENTA (PREVISTA)</span>
              <button
                onClick={() => setPrintingOrder(null)}
                className="text-zinc-500 hover:text-white font-bold text-xl cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Receipt Screen Preview Container */}
            <div className="p-6 overflow-y-auto bg-zinc-900/40 flex justify-center">
              <div
                id="print-receipt-area"
                className="receipt-preview-container w-[80mm] p-6 bg-white text-black text-xs font-mono"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-sm font-extrabold tracking-wider">🍔 BURGERS J&E 🍔</h2>
                  <p className="text-[10px] uppercase font-bold text-zinc-600">Sabor que prende, estilo que sorprende</p>
                  <p className="text-[9px] text-zinc-500">ZACATECAS, MÉXICO</p>
                  <p className="text-[9px] text-zinc-500">TEL: (999) 999-9999</p>
                </div>

                <div className="my-4 border-t border-dashed border-black/40 pt-3 space-y-1 text-[10px]">
                  <p><strong>FOLIO:</strong> #{String(printingOrder.orderNumber).padStart(4, '0')}</p>
                  <p><strong>FECHA:</strong> {new Date(printingOrder.timestamp).toLocaleDateString('es-MX')} {new Date(printingOrder.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p><strong>CLIENTE:</strong> {printingOrder.customerName.toUpperCase()}</p>
                  <p><strong>ESTADO:</strong> {printingOrder.status.toUpperCase()}</p>
                  <p><strong>PAGO:</strong> {printingOrder.isPaid ? 'PAGADO (' + printingOrder.paymentMethod.toUpperCase() + ')' : '⚠️ COBRO PENDIENTE'}</p>
                </div>

                {/* Items */}
                <div className="border-t border-dashed border-black/40 py-2 space-y-1.5 text-[10px]">
                  {printingOrder.items.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between">
                        <span>{item.quantity}x {item.product.title.toUpperCase()}</span>
                        <span>${item.product.price * item.quantity}</span>
                      </div>
                      {item.customNotes && (
                        <p className="text-[9px] text-zinc-600 pl-3 font-semibold italic">↳ "{item.customNotes}"</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-dashed border-black/40 pt-2.5 space-y-1 text-[10px] text-right">
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>${printingOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (16% INC.):</span>
                    <span>${printingOrder.tax}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold border-t border-dashed border-black/20 pt-1">
                    <span>TOTAL:</span>
                    <span>${printingOrder.total} MXN</span>
                  </div>
                </div>

                {/* Cash & Change if applicable */}
                {printingOrder.isPaid && printingOrder.paymentMethod === 'Efectivo' && printingOrder.paymentAmountReceived && (
                  <div className="border-t border-dotted border-black/20 mt-2 pt-1.5 text-[10px] text-right space-y-0.5">
                    <div className="flex justify-between">
                      <span>RECIBIDO:</span>
                      <span>${printingOrder.paymentAmountReceived}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>CAMBIO:</span>
                      <span>${printingOrder.paymentAmountReceived - printingOrder.total}</span>
                    </div>
                  </div>
                )}

                {/* General notes */}
                {printingOrder.notes && (
                  <div className="border-t border-dashed border-black/40 mt-3 pt-2 text-[9px] italic">
                    <span className="font-bold block not-italic">Notas:</span>
                    "{printingOrder.notes}"
                  </div>
                )}

                <div className="border-t border-dashed border-black/40 mt-4 pt-3 text-center text-[9px] space-y-1 font-bold text-zinc-600">
                  <p>¡GRACIAS POR SU PREFERENCIA! 🔥</p>
                  <p>SABOR QUE PRENDE, ESTILO QUE SORPRENDE</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-zinc-900 border-t border-zinc-850 px-5 py-4 flex gap-3">
              <button
                onClick={() => setPrintingOrder(null)}
                className="btn-outline-red flex-1 py-2.5 text-sm cursor-pointer"
              >
                CERRAR
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary flex-1 py-2.5 text-sm pulse-red-glow cursor-pointer"
              >
                🖨️ IMPRIMIR TICKET
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

function DigitalMenuBoard({ products, featuredProductId }: { products: FoodItem[], featuredProductId: string }) {
  const hamburguesas = products.filter(p => p.category === 'Hamburguesas')
  const combos = products.filter(p => p.category === 'Combos')
  const bebidas = products.filter(p => p.category === 'Bebidas')
  const promos = products.filter(p => p.category === 'Promos')
  const otros = products.filter(p => p.category === 'Otros')

  // Resolve featured item (checks URL first, then State/Prop, then localStorage, then fallbacks)
  const urlParams = new URLSearchParams(window.location.search)
  const urlFeaturedId = urlParams.get('featured')
  const finalFeaturedId = urlFeaturedId || featuredProductId || localStorage.getItem('burgers_je_featured_product_id') || ''
  const selectedFeatured = products.find(p => p.id === finalFeaturedId)

  // Rotating featured item as fallback
  const fallbackFeaturedProducts = products.filter(p => p.category === 'Promos' || p.category === 'Combos' || p.category === 'Hamburguesas').slice(0, 5)
  const [featuredIndex, setFeaturedIndex] = useState(0)

  useEffect(() => {
    if (fallbackFeaturedProducts.length <= 1) return
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % fallbackFeaturedProducts.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [fallbackFeaturedProducts.length])

  const featured = selectedFeatured || fallbackFeaturedProducts[featuredIndex]

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col font-poppins selection:bg-red-600 selection:text-white relative overflow-hidden">
      {/* Neon effect backdrop */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* --- BOARD HEADER --- */}
      <header className="border-b border-zinc-900 bg-zinc-950/40 backdrop-blur pb-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-4">
          <HeaderNeonBurger />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bebas text-3xl tracking-wider text-white">BURGERS</span>
              <span className="font-bebas text-3xl tracking-widest text-red-600 neon-glow-text-red">J&E</span>
            </div>
            <p className="text-xs text-zinc-500 m-0 font-poppins uppercase tracking-widest font-semibold">SABOR QUE PRENDE, ESTILO QUE SORPRENDE</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Ordena por WhatsApp</span>
            <span className="text-sm font-mono text-yellow-accent font-bold">🍔 J&E POS Digital</span>
          </div>
        </div>
      </header>

      {/* --- TWO COLUMNS LAYOUT: LEFT IS SPECIAL/FEATURED SLIDESHOW, RIGHT IS ENTIRE MENU GRID --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 items-stretch">
        {/* LEFT COLUMN: FEATURED HIGHLIGHT (4/12 width) */}
        {featured && (
          <div className="lg:col-span-4 flex flex-col bg-zinc-950/80 rounded-3xl border border-zinc-900 p-6 justify-between relative overflow-hidden group min-h-[500px]">
            {/* Corner Decorative ribbon */}
            <div className="absolute top-4 right-4 bg-red-600 text-white font-bebas text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold shadow-lg shadow-red-600/20 animate-pulse">
              Recomendación de Hoy ✨
            </div>

            <div className="space-y-6">
              <h2 className="font-bebas text-3xl text-white tracking-wide border-b border-zinc-900 pb-3 m-0">🔥 RECOMENDADO</h2>
              
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/50">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-all duration-700 ease-out transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
                  }}
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-bebas text-2xl text-yellow-accent tracking-wider m-0">
                  {featured.title}
                </h3>
                <p className="text-sm text-zinc-400 font-poppins leading-relaxed m-0">
                  {featured.description}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-900 flex justify-between items-center mt-6">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">PRECIO ESPECIAL</span>
                <span className="text-3xl font-mono text-red-500 font-bold">${featured.price}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">CATEGORÍA</span>
                <span className="text-xs bg-zinc-900 text-zinc-300 border border-zinc-800 px-2 py-1 rounded uppercase font-semibold font-mono block mt-1">
                  {featured.category}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: CATEGORIES LISTING (8/12 width) */}
        <div className="lg:col-span-8 flex flex-col gap-8 h-full overflow-y-auto pr-2 max-h-[85vh] custom-scrollbar">
          
          {/* HAMBURGUESAS */}
          {hamburguesas.length > 0 && (
            <div className="bg-zinc-950/40 rounded-3xl border border-zinc-900/80 p-6 space-y-5">
              <h2 className="font-bebas text-2xl tracking-wider text-yellow-accent m-0 flex items-center gap-2 pb-2 border-b border-zinc-900/60">
                🍔 HAMBURGUESAS PREMIUM
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hamburguesas.map(item => (
                  <MenuListItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* COMBOS */}
          {combos.length > 0 && (
            <div className="bg-zinc-950/40 rounded-3xl border border-zinc-900/80 p-6 space-y-5">
              <h2 className="font-bebas text-2xl tracking-wider text-yellow-accent m-0 flex items-center gap-2 pb-2 border-b border-zinc-900/60">
                🍟 COMBOS CON PAPAS Y BEBIDA
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {combos.map(item => (
                  <MenuListItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* PROMOS */}
          {promos.length > 0 && (
            <div className="bg-zinc-950/40 rounded-3xl border border-zinc-900/80 p-6 space-y-5">
              <h2 className="font-bebas text-2xl tracking-wider text-yellow-accent m-0 flex items-center gap-2 pb-2 border-b border-zinc-900/60">
                📢 PROMOS IMPERDIBLES
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promos.map(item => (
                  <MenuListItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* BEBIDAS & OTROS */}
          {(bebidas.length > 0 || otros.length > 0) && (
            <div className="bg-zinc-950/40 rounded-3xl border border-zinc-900/80 p-6 space-y-5">
              <h2 className="font-bebas text-2xl tracking-wider text-yellow-accent m-0 flex items-center gap-2 pb-2 border-b border-zinc-900/60">
                🥤 BEBIDAS Y EXTRAS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...bebidas, ...otros].map(item => (
                  <MenuListItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function MenuListItem({ item }: { item: FoodItem }) {
  return (
    <div className="bg-zinc-950 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all duration-300 overflow-hidden flex flex-col h-full shadow-lg shadow-black/40">
      {item.image ? (
        <div className="relative aspect-video w-full overflow-hidden border-b border-zinc-900 bg-zinc-900">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
            }}
          />
        </div>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden border-b border-zinc-900 bg-zinc-900 flex items-center justify-center">
          <span className="text-4xl">🍔</span>
        </div>
      )}
      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <div>
          <h3 className="font-bebas text-xl sm:text-2xl tracking-wider text-yellow-accent m-0 leading-tight">
            {item.title}
          </h3>
          <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed font-poppins m-0">
            {item.description}
          </p>
        </div>
        <div className="flex justify-between items-center border-t border-zinc-900/80 pt-3">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">PRECIO</span>
          <span className="font-mono text-lg sm:text-xl text-red-500 font-bold">
            ${item.price}
          </span>
        </div>
      </div>
    </div>
  )
}
