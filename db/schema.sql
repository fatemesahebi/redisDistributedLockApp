-- db/schema.sql

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL
);

-- Optional: Seed sample data
INSERT INTO products (name, amount) VALUES
('Apple', 10),
('Banana', 20)
ON CONFLICT DO NOTHING;
