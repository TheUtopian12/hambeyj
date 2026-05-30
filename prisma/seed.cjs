require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_PRODUCTS = [
  {
    title: 'LA VOLCÁN',
    description: 'Doble carne de res selecta, queso cheddar derretido, tocino ahumado crujiente, aros de cebolla dorados y nuestra legendaria salsa secreta volcán.',
    price: 149,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    category: 'Hamburguesas',
    isCustom: false
  },
  {
    title: 'COMBO CLÁSICO',
    description: 'Nuestra jugosa hamburguesa clásica (carne premium, queso cheddar, lechuga fresca, rodajas de tomate) acompañada de papas fritas crujientes y bebida helada.',
    price: 179,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    category: 'Combos',
    isCustom: false
  },
  {
    title: 'MARTES DE BURGERS (2X1)',
    description: '¡La promo de la semana! Pide dos de nuestras hamburguesas clásicas con queso por el precio de una. Ideal para compartir.',
    price: 220,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    category: 'Promos',
    isCustom: false
  },
  {
    title: 'PAPAS SUPREMAS',
    description: 'Papas fritas corte francés sazonadas, bañadas en abundante salsa de queso cheddar derretido y espolvoreadas con trocitos crujientes de tocino.',
    price: 89,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    category: 'Otros',
    isCustom: false
  },
  {
    title: 'SODA DE LA CASA',
    description: 'Refresco helado de cola servido con rodaja de limón y hielo en vaso especial coleccionable.',
    price: 35,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    category: 'Bebidas',
    isCustom: false
  },
  {
    title: 'MALTEADA OREO',
    description: 'Deliciosa y cremosa malteada artesanal de vainilla batida con galletas Oreo trituradas, coronada con crema batida y jarabe de chocolate.',
    price: 65,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
    category: 'Bebidas',
    isCustom: false
  }
];

async function main() {
  console.log('🌱 Iniciando semilla de base de datos...');

  // 1. Crear usuarios por defecto
  console.log('👤 Creando usuarios...');
  
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const staffPasswordHash = await bcrypt.hash('staff123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPasswordHash,
      name: 'Administrador Principal',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { username: 'staff' },
    update: {},
    create: {
      username: 'staff',
      password: staffPasswordHash,
      name: 'Personal de Caja',
      role: 'STAFF',
    },
  });

  console.log('✅ Usuarios listos: "admin" / "admin123" y "staff" / "staff123"');

  // 2. Crear productos por defecto
  console.log('🍔 Creando productos...');
  for (const prod of DEFAULT_PRODUCTS) {
    await prisma.product.upsert({
      where: { title: prod.title },
      update: {},
      create: prod,
    });
  }

  console.log('✅ Productos del menú creados correctamente.');
  console.log('🎉 Semilla completada con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando la semilla:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
