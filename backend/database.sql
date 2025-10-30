-- Pixeller Database Schema
-- This schema stores metadata and off-chain data for the Pixeller platform

-- Users table: stores user profile information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(18) NOT NULL UNIQUE,
    profile_url VARCHAR(9) NOT NULL UNIQUE, -- 9 character alphanumeric code
    username VARCHAR(50),
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast profile URL lookups
CREATE INDEX idx_profile_url ON users(profile_url);
CREATE INDEX idx_wallet_address ON users(wallet_address);

-- Artworks table: stores artwork metadata
CREATE TABLE artworks (
    id SERIAL PRIMARY KEY,
    artwork_code VARCHAR(14) NOT NULL UNIQUE, -- 9 (profile) + 5 (random) characters
    creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creator_wallet VARCHAR(18) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    pixel_data TEXT NOT NULL, -- JSON string of pixel art data
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    unlock_password VARCHAR(6) NOT NULL, -- 6 character alphanumeric password
    price_flow DECIMAL(18, 8) NOT NULL, -- Price in FLOW tokens
    publish_fee DECIMAL(18, 8) NOT NULL, -- Fee paid to publish
    is_published BOOLEAN DEFAULT FALSE,
    nft_id INTEGER, -- Flow NFT ID after minting
    thumbnail_url TEXT,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for artwork queries
CREATE INDEX idx_artwork_code ON artworks(artwork_code);
CREATE INDEX idx_creator_id ON artworks(creator_id);
CREATE INDEX idx_is_published ON artworks(is_published);
CREATE INDEX idx_published_at ON artworks(published_at DESC);

-- Purchases table: tracks artwork purchases
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buyer_wallet VARCHAR(18) NOT NULL,
    seller_wallet VARCHAR(18) NOT NULL,
    price_flow DECIMAL(18, 8) NOT NULL,
    transaction_hash VARCHAR(64) NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for purchase queries
CREATE INDEX idx_artwork_purchases ON purchases(artwork_id);
CREATE INDEX idx_buyer_purchases ON purchases(buyer_id);
CREATE INDEX idx_seller_wallet ON purchases(seller_wallet);

-- Likes table: tracks user likes on artworks
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(artwork_id, user_id)
);

CREATE INDEX idx_artwork_likes ON likes(artwork_id);
CREATE INDEX idx_user_likes ON likes(user_id);

-- Comments table: stores comments on artworks
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_artwork_comments ON comments(artwork_id);
CREATE INDEX idx_user_comments ON comments(user_id);

-- Password unlocks table: tracks successful password unlocks
CREATE TABLE password_unlocks (
    id SERIAL PRIMARY KEY,
    artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(artwork_id, user_id)
);

CREATE INDEX idx_artwork_unlocks ON password_unlocks(artwork_id);
CREATE INDEX idx_user_unlocks ON password_unlocks(user_id);

-- Analytics table: tracks sales analytics for sellers
CREATE TABLE sales_analytics (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    total_sales INTEGER DEFAULT 0,
    total_revenue_flow DECIMAL(18, 8) DEFAULT 0,
    last_sale_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seller_analytics ON sales_analytics(seller_id);

-- Views for common queries

-- View: User portfolio with artwork counts
CREATE VIEW user_portfolio AS
SELECT 
    u.id,
    u.wallet_address,
    u.profile_url,
    u.username,
    COUNT(CASE WHEN a.is_published = true THEN 1 END) as published_artworks,
    COUNT(CASE WHEN a.is_published = false THEN 1 END) as saved_artworks,
    COALESCE(SUM(sa.total_revenue_flow), 0) as total_earnings
FROM users u
LEFT JOIN artworks a ON u.id = a.creator_id
LEFT JOIN sales_analytics sa ON u.id = sa.seller_id
GROUP BY u.id;

-- View: Marketplace artworks with creator info
CREATE VIEW marketplace_artworks AS
SELECT 
    a.id,
    a.artwork_code,
    a.title,
    a.description,
    a.thumbnail_url,
    a.price_flow,
    a.views_count,
    a.likes_count,
    a.published_at,
    u.wallet_address as creator_wallet,
    u.profile_url as creator_profile_url,
    u.username as creator_username,
    COUNT(DISTINCT c.id) as comments_count
FROM artworks a
JOIN users u ON a.creator_id = u.id
LEFT JOIN comments c ON a.id = c.artwork_id
WHERE a.is_published = true
GROUP BY a.id, u.wallet_address, u.profile_url, u.username;

-- View: Seller analytics summary
CREATE VIEW seller_dashboard AS
SELECT 
    u.id as seller_id,
    u.wallet_address,
    u.profile_url,
    COUNT(DISTINCT p.id) as total_sales,
    COALESCE(SUM(p.price_flow), 0) as total_revenue,
    COUNT(DISTINCT a.id) as artworks_sold,
    MAX(p.purchased_at) as last_sale_date
FROM users u
LEFT JOIN artworks a ON u.id = a.creator_id
LEFT JOIN purchases p ON a.id = p.artwork_id
WHERE a.is_published = true
GROUP BY u.id;

-- Trigger: Update artwork likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE artworks SET likes_count = likes_count + 1 WHERE id = NEW.artwork_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE artworks SET likes_count = likes_count - 1 WHERE id = OLD.artwork_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- Trigger: Update sales analytics on purchase
CREATE OR REPLACE FUNCTION update_sales_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO sales_analytics (seller_id, artwork_id, total_sales, total_revenue_flow, last_sale_at)
    SELECT 
        a.creator_id,
        NEW.artwork_id,
        1,
        NEW.price_flow,
        NEW.purchased_at
    FROM artworks a WHERE a.id = NEW.artwork_id
    ON CONFLICT (seller_id, artwork_id) 
    DO UPDATE SET
        total_sales = sales_analytics.total_sales + 1,
        total_revenue_flow = sales_analytics.total_revenue_flow + NEW.price_flow,
        last_sale_at = NEW.purchased_at,
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sales_analytics
AFTER INSERT ON purchases
FOR EACH ROW EXECUTE FUNCTION update_sales_analytics();

-- Add unique constraint to sales_analytics
ALTER TABLE sales_analytics ADD CONSTRAINT unique_seller_artwork UNIQUE (seller_id, artwork_id);

-- Trigger: Update timestamp on record update
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_artworks_timestamp
BEFORE UPDATE ON artworks
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_comments_timestamp
BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_timestamp();