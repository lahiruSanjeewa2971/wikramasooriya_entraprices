# Admin Panel - Wikramasooriya Enterprises

A comprehensive admin panel for managing the Wikramasooriya Enterprises e-commerce platform.

## Features

### 🎯 **Dashboard**
- Overview statistics and analytics
- Recent activity monitoring
- Performance metrics

### 📦 **Product Management**
- Create, read, update, and delete products
- Bulk operations
- Category assignment
- Stock management
- Search and filtering

### 🏷️ **Category Management**
- Organize products into categories
- Category CRUD operations
- Product count tracking

### 👥 **User Management**
- View all registered users
- Manage user roles (Admin/User)
- User status management
- Contact information

### 📧 **Contact Messages**
- View customer contact form submissions
- Search through messages
- Message management

### 📊 **Excel Upload**
- Bulk product import/update
- Excel file validation
- Template download
- Progress tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Backend server running on `http://localhost:3000`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🔐 Authentication

The admin panel requires admin privileges:
- Only users with `role: 'admin'` can access
- Login with existing admin credentials
- JWT token-based authentication

## 🎨 Theme Support

- **Light Mode**: Clean, professional appearance
- **Dark Mode**: Easy on the eyes for extended use
- **Auto-switch**: Follows system preference
- **Manual toggle**: Available in the top navigation

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **HTTP Client**: Axios

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation
- **Mobile**: Collapsible sidebar with hamburger menu
- **Tablet**: Adaptive layout for medium screens

## 🔧 Configuration

### API Endpoints
The admin panel connects to the backend at `http://localhost:3000/api`

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AdminLayout.jsx # Main layout with sidebar
│   ├── ProtectedRoute.jsx # Authentication guard
│   └── ThemeProvider.jsx  # Theme management
├── pages/              # Page components
│   ├── Dashboard.jsx   # Dashboard overview
│   ├── Products.jsx    # Product management
│   ├── Categories.jsx  # Category management
│   ├── Users.jsx       # User management
│   ├── Contacts.jsx    # Contact messages
│   ├── ExcelUpload.jsx # Excel upload functionality
│   └── Login.jsx       # Admin login
├── services/           # API services
│   ├── apiClient.js    # HTTP client configuration
│   ├── authService.js  # Authentication service
│   └── adminService.js # Admin API endpoints
└── App.jsx            # Main application component
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🔒 Security Features

- **Role-based access control** (RBAC)
- **JWT token authentication**
- **Protected routes**
- **Admin-only endpoints**
- **Secure API communication**

## 📊 Data Management

- **Real-time updates** with React Query
- **Optimistic updates** for better UX
- **Error handling** and user feedback
- **Loading states** and progress indicators

## 🎯 Best Practices

- **Component composition** for reusability
- **Custom hooks** for business logic
- **Type-safe API calls** with proper error handling
- **Responsive design** for all screen sizes
- **Accessibility** considerations

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure backend is running on port 3000
   - Check CORS configuration
   - Verify API endpoints

2. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify admin role permissions

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

## 📞 Support

For technical support or questions about the admin panel:
- Check the backend API documentation
- Review the console for error messages
- Ensure all prerequisites are met

## 🔄 Updates

The admin panel automatically:
- Refreshes data when changes occur
- Handles authentication token expiration
- Provides real-time feedback for all operations
- Maintains state consistency across components

---

**Built with ❤️ for Wikramasooriya Enterprises**
