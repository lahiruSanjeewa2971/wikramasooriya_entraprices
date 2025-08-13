# Wikramasooriya Enterprises - Full-Stack E-commerce Platform

A production-ready Single Page Application (SPA) built with React frontend and Node.js backend, featuring JWT authentication, shopping cart functionality, and PostgreSQL database.

## 🚀 Tech Stack

### Frontend
- **React 18** with JSX
- **Vite** for build tooling
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **Redux Toolkit** for state management
- **React Router** for navigation
- **React Hook Form + Zod** for form validation

### Backend
- **Node.js** with ES modules
- **Express.js** framework
- **PostgreSQL** database with Sequelize ORM
- **JWT** authentication (access + refresh tokens)
- **bcrypt** for password hashing
- **Joi** for request validation

### Development
- **Docker & Docker Compose** for PostgreSQL
- **ESLint + Prettier** for code quality
- **Morgan** for HTTP request logging

## 📁 Project Structure

```
wikramasooriya_entraprices/
├── frontend/                 # React frontend application
├── backend/                  # Node.js backend API
├── docker-compose.yml        # PostgreSQL container setup
├── .gitignore               # Git ignore patterns
└── README.md                # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd wikramasooriya_entraprices

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Database Setup

```bash
# Start PostgreSQL container
docker-compose up db -d

# Initialize database (first time only)
cd backend
npm run db:init
npm run db:seed
```

### 3. Environment Configuration

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
```

### 4. Development

```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Database (if needed)
docker-compose up db
```

## 🚀 Available Scripts

### Backend
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run db:init      # Initialize database tables
npm run db:seed      # Seed sample data
npm run db:migrate   # Run database migrations
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Lint code
```

### Docker
```bash
docker-compose up db          # Start PostgreSQL
docker-compose down           # Stop all services
docker-compose logs db        # View database logs
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Get product details

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/item/:id` - Update cart item quantity
- `DELETE /api/cart/item/:id` - Remove item from cart

### Contact
- `POST /api/contact` - Send contact message

## 🔐 Authentication

The application uses JWT tokens for authentication:
- **Access Token**: Short-lived token for API requests
- **Refresh Token**: Long-lived token for token renewal

Protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## 🗄️ Database Schema

- **users**: User accounts and authentication
- **products**: Product catalog with categories
- **categories**: Product categorization
- **carts**: User shopping carts
- **cart_items**: Individual items in carts
- **contacts**: Contact form submissions

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 📝 Development Notes

- Cart functionality requires authentication
- Product images use placeholder URLs (configurable)
- Featured and new arrival products are tagged
- Global error handling with toast notifications
- Responsive design with TailwindCSS
- Form validation with Zod schemas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for Wikramasooriya Enterprises.

## 🆘 Support

For technical support or questions, please contact the development team.
