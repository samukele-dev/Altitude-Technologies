CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL, -- Added: For registration and login using username
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Stores the HASHED password
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT FALSE NOT NULL, -- Added: For email confirmation (set to TRUE after activation)
    activation_token VARCHAR(255),            -- Added: Stores the token for email confirmation
    activation_token_expires_at TIMESTAMP WITH TIME ZONE, -- Added: Expiry for the activation token
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Added: Good practice for tracking changes
);


CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    description TEXT,
    price NUMERIC(10, 2),
    quantity INT,
    images TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(255) DEFAULT 'uncategorized',
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- e.g., 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    shipping_address TEXT,
    payment_status VARCHAR(50) DEFAULT 'unpaid', -- e.g., 'unpaid', 'paid', 'refunded'
    items JSONB NOT NULL -- Stores an array of {productId, sku, name, quantity, price}
);