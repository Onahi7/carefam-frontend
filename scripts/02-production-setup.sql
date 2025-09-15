-- Production database setup for Pharmacy POS System
-- This script creates the initial database structure without sample data

-- Create database indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_outlet_id ON users(outlet_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_inventory_outlet_product ON inventory(outlet_id, product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_outlet_date ON transactions(outlet_id, created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_staff_id ON transactions(staff_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_outlet ON purchase_orders(outlet_id);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outlets_updated_at BEFORE UPDATE ON outlets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create initial admin user (password should be changed on first login)
-- Default password: 'ChangeMe123!' - MUST be changed in production
INSERT INTO users (id, email, password_hash, name, role, outlet_id, created_at) 
VALUES (
    gen_random_uuid(),
    'admin@yourpharmacy.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- ChangeMe123!
    'System Administrator',
    'admin',
    NULL,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Create system configuration table for app settings
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system configuration
INSERT INTO system_config (key, value, description) VALUES
('app_name', 'PharmaPOS', 'Application name displayed in UI'),
('currency', 'SLE', 'Default currency code'),
('tax_rate', '15', 'Default tax rate percentage'),
('receipt_footer', 'Thank you for your business!', 'Footer text on receipts'),
('low_stock_threshold', '10', 'Default low stock warning threshold'),
('backup_frequency', 'daily', 'Automatic backup frequency')
ON CONFLICT (key) DO NOTHING;
