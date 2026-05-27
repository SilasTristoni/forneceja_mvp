CREATE DATABASE IF NOT EXISTS forneceja CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE forneceja;

DROP TABLE IF EXISTS evaluations;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS suppliers;

CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(100) NOT NULL,
  products TEXT NOT NULL,
  avg_delivery_days INT NOT NULL,
  avg_price DECIMAL(10,2) NOT NULL,
  region VARCHAR(120) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  contact_name VARCHAR(120),
  phone VARCHAR(30),
  email VARCHAR(160),
  is_verified BOOLEAN DEFAULT FALSE,
  is_sponsored BOOLEAN DEFAULT FALSE,
  plan ENUM('gratuito','destaque','premium') DEFAULT 'gratuito',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_suppliers_category (category),
  INDEX idx_suppliers_region (city, state),
  INDEX idx_suppliers_delivery (avg_delivery_days),
  INDEX idx_suppliers_sponsored (is_sponsored, is_verified)
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('market','supplier','admin') NOT NULL,
  supplier_id INT NULL,
  name VARCHAR(140) NOT NULL,
  company VARCHAR(160) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  market_id INT NULL,
  market_name VARCHAR(160) NOT NULL,
  requester_name VARCHAR(120) NOT NULL,
  requester_phone VARCHAR(30),
  product_requested VARCHAR(160) NOT NULL,
  quantity VARCHAR(80),
  desired_delivery_days INT,
  notes TEXT,
  status ENUM('enviado','em_analise','respondido','aceito','recusado','concluido','cancelado') DEFAULT 'enviado',
  response_price DECIMAL(10,2) NULL,
  response_delivery_days INT NULL,
  supplier_response TEXT NULL,
  response_expires_at DATETIME NULL,
  responded_at DATETIME NULL,
  accepted_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_supplier (supplier_id, created_at),
  INDEX idx_orders_market (market_id, created_at),
  INDEX idx_orders_status (status),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (market_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  order_id INT NULL,
  market_name VARCHAR(160) NOT NULL,
  on_time_delivery INT NOT NULL,
  product_quality INT NOT NULL,
  price_score INT NOT NULL,
  service_score INT NOT NULL,
  total_deliveries INT DEFAULT 0,
  late_deliveries INT DEFAULT 0,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_evaluations_supplier (supplier_id, created_at),
  INDEX idx_evaluations_order (order_id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);
