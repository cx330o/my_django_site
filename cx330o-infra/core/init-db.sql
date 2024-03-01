CREATE DATABASE flowengine;
CREATE DATABASE analytics;

-- Sales analytics tables (used by Analytics dashboard)
CREATE DATABASE sales_analytics;
\c sales_analytics;

CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    company VARCHAR(255),
    source VARCHAR(50),
    score FLOAT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE outreach (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id),
    email_subject VARCHAR(500),
    sent_at TIMESTAMP,
    opened_at TIMESTAMP,
    replied_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft'
);

CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(50),
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
