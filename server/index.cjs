require('dotenv').config()
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 5001
const JWT_SECRET = process.env.JWT_SECRET || 'burgers_je_secret_jwt_key_2026_pos'

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' })) // Support large base64 image uploads

// --- AUTHORIZATION MIDDLEWARES ---
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido o expirado' })
      }
      req.user = user
      next()
    })
  } else {
    res.status(401).json({ error: 'Acceso denegado. Se requiere autenticación' })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next()
  } else {
    res.status(403).json({ error: 'Acceso restringido. Se requiere rol de Administrador' })
  }
}

// --- ROUTES ---

// 1. AUTHENTICATION & LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Nombre de usuario y contraseña requeridos' })
    }

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() }
    })

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Sign JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error interno en el servidor' })
  }
})

// 2. USER MANAGEMENT (Admin Only)
app.get('/api/auth/users', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(users)
  } catch (error) {
    console.error('Error al listar usuarios:', error)
    res.status(500).json({ error: 'Error al listar usuarios' })
  }
})

app.post('/api/auth/users', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { username, password, name, role } = req.body

    if (!username || !password || !name || !role) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' })
    }

    const normalizedUser = username.toLowerCase().trim()
    const existing = await prisma.user.findUnique({
      where: { username: normalizedUser }
    })

    if (existing) {
      return res.status(400).json({ error: 'El nombre de usuario ya está registrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        username: normalizedUser,
        password: hashedPassword,
        name: name.trim(),
        role: role.toUpperCase() // 'ADMIN' or 'STAFF'
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    res.status(201).json(newUser)
  } catch (error) {
    console.error('Error al crear usuario:', error)
    res.status(500).json({ error: 'Error al crear usuario' })
  }
})

app.delete('/api/auth/users/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Prevent deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de administrador' })
    }

    await prisma.user.delete({
      where: { id }
    })

    res.json({ message: 'Usuario eliminado con éxito' })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({ error: 'Error al eliminar usuario' })
  }
})

// 3. PRODUCTS MENU (Staff view / Admin CRUD)
app.get('/api/products', authenticateJWT, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' }
    })
    res.json(products)
  } catch (error) {
    console.error('Error al obtener productos:', error)
    res.status(500).json({ error: 'Error al obtener productos' })
  }
})

app.post('/api/products', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { title, description, price, image, category } = req.body

    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' })
    }

    const normalizedTitle = title.trim().toUpperCase()
    const existing = await prisma.product.findUnique({
      where: { title: normalizedTitle }
    })

    if (existing) {
      return res.status(400).json({ error: 'Ya existe un producto con este título' })
    }

    const newProduct = await prisma.product.create({
      data: {
        title: normalizedTitle,
        description: description.trim(),
        price: parseFloat(price),
        image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        category,
        isCustom: true
      }
    })

    res.status(201).json(newProduct)
  } catch (error) {
    console.error('Error al crear producto:', error)
    res.status(500).json({ error: 'Error al crear producto en menú' })
  }
})

app.put('/api/products/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, price, image, category } = req.body

    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: 'Campos requeridos vacíos' })
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: title.trim().toUpperCase(),
        description: description.trim(),
        price: parseFloat(price),
        image,
        category
      }
    })

    res.json(updatedProduct)
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    res.status(500).json({ error: 'Error al actualizar producto' })
  }
})

app.delete('/api/products/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    await prisma.product.delete({
      where: { id }
    })
    res.json({ message: 'Producto eliminado del menú' })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    res.status(500).json({ error: 'Error al eliminar producto' })
  }
})

// 4. ORDERS CONTROL (Staff & Admin)
app.get('/api/orders', authenticateJWT, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { timestamp: 'desc' }
    })
    res.json(orders)
  } catch (error) {
    console.error('Error al obtener pedidos:', error)
    res.status(500).json({ error: 'Error al obtener pedidos de la base de datos' })
  }
})

app.post('/api/orders', authenticateJWT, async (req, res) => {
  try {
    const { customerName, items, subtotal, tax, total, paymentMethod, paymentAmountReceived, notes, status, isPaid } = req.body

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ error: 'Nombre de cliente e ítems requeridos para guardar pedido' })
    }

    const newOrder = await prisma.order.create({
      data: {
        customerName: customerName.trim(),
        items, // receives array of items
        subtotal: parseFloat(subtotal),
        tax: parseFloat(tax),
        total: parseFloat(total),
        paymentMethod: paymentMethod || 'Efectivo',
        paymentAmountReceived: paymentAmountReceived ? parseFloat(paymentAmountReceived) : null,
        notes: notes ? notes.trim() : null,
        status: status || 'Pendiente',
        isPaid: isPaid || false
      }
    })

    res.status(201).json(newOrder)
  } catch (error) {
    console.error('Error al registrar pedido:', error)
    res.status(500).json({ error: 'Error al registrar pedido en base de datos' })
  }
})

app.put('/api/orders/:id/status', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'El estado es obligatorio' })
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    })

    res.json(updatedOrder)
  } catch (error) {
    console.error('Error al actualizar estado:', error)
    res.status(500).json({ error: 'Error al actualizar estado del pedido' })
  }
})

app.put('/api/orders/:id/pay', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params
    const { paymentMethod, paymentAmountReceived } = req.body

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        isPaid: true,
        paymentMethod,
        paymentAmountReceived: paymentAmountReceived ? parseFloat(paymentAmountReceived) : null
      }
    })

    res.json(updatedOrder)
  } catch (error) {
    console.error('Error al registrar pago:', error)
    res.status(500).json({ error: 'Error al registrar pago del pedido' })
  }
})

app.delete('/api/orders/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params
    await prisma.order.delete({
      where: { id }
    })
    res.json({ message: 'Pedido eliminado permanentemente' })
  } catch (error) {
    console.error('Error al eliminar pedido:', error)
    res.status(500).json({ error: 'Error al eliminar pedido' })
  }
})

// Root endpoint test
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', database: 'connected', pos: 'Burgers J&E' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor API de Burgers J&E corriendo en puerto ${PORT}`)
})
