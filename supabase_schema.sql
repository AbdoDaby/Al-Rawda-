-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    category TEXT,
    code TEXT UNIQUE,
    image TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    items JSONB NOT NULL,
    customer_info JSONB,
    discount_info JSONB,
    payment_method TEXT,
    subtotal DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    total_profit DECIMAL(10, 2)
);

-- Enable Row Level Security (optional, for production you'd want proper policies)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create basic policies for anon access (adjust as needed for security)
CREATE POLICY "Allow anonymous read access" ON products FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON products FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON orders FOR DELETE USING (true);
