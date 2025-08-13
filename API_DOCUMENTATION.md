# Wikramasooriya Enterprises API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here"
    }
  }
}
```

#### POST /auth/login
Authenticate user and get access tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here"
    }
  }
}
```

#### GET /auth/me
Get current user profile (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST /auth/logout
Logout user (requires authentication).

### Products

#### GET /products
Get list of products with optional filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `category` (string): Filter by category slug
- `featured` (boolean): Filter featured products
- `new_arrival` (boolean): Filter new arrival products
- `q` (string): Search query
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `sortBy` (string): Sort field (default: created_at)
- `sortOrder` (string): Sort direction (ASC/DESC, default: DESC)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 12,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### GET /products/:id
Get product details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "sku": "ELEC-001",
      "name": "Wireless Bluetooth Headphones",
      "description": "High-quality wireless headphones...",
      "price": 99.99,
      "stock_qty": 50,
      "featured": true,
      "new_arrival": true,
      "categories": [...]
    }
  }
}
```

#### GET /products/categories
Get all product categories.

#### GET /products/featured
Get featured products.

#### GET /products/new
Get new arrival products.

### Cart (All endpoints require authentication)

#### GET /cart
Get user's shopping cart.

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": 1,
      "total_amount": 149.98,
      "item_count": 2,
      "items": [...]
    }
  }
}
```

#### POST /cart/add
Add item to cart.

**Request Body:**
```json
{
  "productId": 1,
  "qty": 2
}
```

#### PUT /cart/item/:id
Update cart item quantity.

**Request Body:**
```json
{
  "qty": 3
}
```

#### DELETE /cart/item/:id
Remove item from cart.

#### DELETE /cart/clear
Clear entire cart.

### Contact

#### POST /contact
Submit contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I have a question about your products..."
}
```

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": [
      {
        "field": "field_name",
        "message": "Field-specific error",
        "value": "invalid_value"
      }
    ]
  }
}
```

## Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTH_REQUIRED`: Authentication required
- `INVALID_TOKEN`: Invalid or expired token
- `USER_NOT_FOUND`: User not found
- `PRODUCT_NOT_FOUND`: Product not found
- `INSUFFICIENT_STOCK`: Not enough stock available
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Exceeded requests return 429 status with rate limit error

## Health Check

#### GET /health
Check API status (no authentication required).

**Response:**
```json
{
  "success": true,
  "message": "Wikramasooriya Enterprises API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
