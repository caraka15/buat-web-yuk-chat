-- mysql_migration.sql

-- Create users table
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    service_type TEXT NOT NULL,
    description TEXT NOT NULL,
    budget INT NOT NULL,
    status VARCHAR(255) DEFAULT 'pending_dp_payment',
    demo_link TEXT,
    final_link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    payment_type VARCHAR(10) NOT NULL CHECK (payment_type IN ('dp', 'full')),
    amount INT NOT NULL,
    ipaymu_session_id TEXT,
    ipaymu_transaction_id TEXT,
    payment_url TEXT,
    va_number TEXT,
    status VARCHAR(255) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Insert admin user
-- You can use a tool like bcrypt to generate the hash.
INSERT INTO users (id, email, password_hash, is_admin) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'carakawidi07@gmail.com', 'YOUR_HASHED_PASSWORD_HERE', TRUE);
