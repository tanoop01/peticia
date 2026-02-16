-- ============================================
-- MYKAIRO CIVIC PLATFORM - BASELINE SCHEMA
-- ============================================
-- Migration: Initial baseline schema
-- Description: Complete database schema representing current production state
-- Created: 2024-01-01
-- 
-- This migration consolidates all existing schema elements:
-- - Core civic platform tables
-- - RAG system for legal documents
-- - All RLS policies
-- - All triggers and functions
-- - All indexes for performance
--
-- WARNING: This is the baseline. Do NOT modify this file after creation.
-- All future changes must go in new migration files.
-- ============================================

-- ============================================
-- EXTENSIONS
-- ============================================
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "cube";           -- N-dimensional cube operations
CREATE EXTENSION IF NOT EXISTS "earthdistance";  -- Geographic distance calculations
CREATE EXTENSION IF NOT EXISTS "vector";         -- pgvector for embeddings
-- Note: Using gen_random_uuid() instead of uuid-ossp extension

-- ============================================
-- CORE TABLES
-- ============================================

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  role TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_type TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  trust_score INTEGER DEFAULT 0,
  -- Location fields
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_country VARCHAR(100),
  location_state VARCHAR(100),
  location_district VARCHAR(100),
  location_address TEXT,
  location_updated_at TIMESTAMP WITH TIME ZONE,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PETITIONS TABLE
-- ============================================
CREATE TABLE petitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  pincode TEXT,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signature_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  sent_to_authority BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  response_received BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SIGNATURES TABLE
-- ============================================
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_verified BOOLEAN DEFAULT FALSE,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  ip_address INET,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(petition_id, user_id)
);

-- ============================================
-- EVIDENCE TABLE
-- ============================================
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail TEXT,
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metadata JSONB,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AUTHORITIES TABLE
-- ============================================
CREATE TABLE authorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  state TEXT NOT NULL,
  area TEXT,
  categories TEXT[] NOT NULL,
  response_rate DECIMAL(5, 2),
  average_response_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PETITION_AUTHORITIES (Many-to-Many)
-- ============================================
CREATE TABLE petition_authorities (
  petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  authority_id UUID NOT NULL REFERENCES authorities(id) ON DELETE CASCADE,
  PRIMARY KEY (petition_id, authority_id)
);

-- ============================================
-- CIVIC ISSUES TABLE
-- ============================================
CREATE TABLE civic_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  upvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'reported',
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ISSUE UPVOTES TABLE
-- ============================================
CREATE TABLE issue_upvotes (
  issue_id UUID NOT NULL REFERENCES civic_issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  upvoted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (issue_id, user_id)
);

-- ============================================
-- ISSUE VERIFICATIONS TABLE
-- ============================================
CREATE TABLE issue_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES civic_issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

-- ============================================
-- PETITION UPDATES TABLE
-- ============================================
CREATE TABLE petition_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AI QUERIES TABLE
-- ============================================
CREATE TABLE ai_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  language TEXT NOT NULL,
  category TEXT,
  response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RAG SYSTEM FOR LEGAL DOCUMENTS
-- ============================================

-- ============================================
-- LEGAL DOCUMENTS TABLE
-- ============================================
CREATE TABLE legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  act_name TEXT NOT NULL,
  section_number TEXT,
  chapter TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  plain_language_summary TEXT,
  keywords TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  jurisdiction TEXT DEFAULT 'Central',
  state TEXT,
  effective_from DATE,
  amended_on DATE,
  status TEXT DEFAULT 'active',
  source_url TEXT,
  government_gazette_reference TEXT,
  embedding VECTOR(384),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RAG QUERY LOGS TABLE
-- ============================================
CREATE TABLE rag_query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  results_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_location ON users USING gist(
  ll_to_earth(location_lat::float8, location_lng::float8)
);

-- Petitions indexes
CREATE INDEX idx_petitions_creator ON petitions(creator_id);
CREATE INDEX idx_petitions_status ON petitions(status);
CREATE INDEX idx_petitions_category ON petitions(category);
CREATE INDEX idx_petitions_city_state ON petitions(city, state);
CREATE INDEX idx_petitions_location ON petitions USING gist(
  ll_to_earth(location_lat::float8, location_lng::float8)
);

-- Signatures indexes
CREATE INDEX idx_signatures_petition ON signatures(petition_id);
CREATE INDEX idx_signatures_user ON signatures(user_id);
CREATE INDEX idx_signatures_petition_id ON signatures(petition_id);

-- Civic issues indexes
CREATE INDEX idx_civic_issues_city_state ON civic_issues(city, state);
CREATE INDEX idx_civic_issues_status ON civic_issues(status);
CREATE INDEX idx_civic_issues_location ON civic_issues USING gist(
  ll_to_earth(location_lat::float8, location_lng::float8)
);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Legal documents indexes
CREATE INDEX idx_legal_docs_act ON legal_documents(act_name);
CREATE INDEX idx_legal_docs_section ON legal_documents(section_number);
CREATE INDEX idx_legal_docs_keywords ON legal_documents USING GIN(keywords);
CREATE INDEX idx_legal_docs_categories ON legal_documents USING GIN(categories);
CREATE INDEX idx_legal_docs_status ON legal_documents(status);
CREATE INDEX idx_legal_docs_jurisdiction ON legal_documents(jurisdiction);
CREATE INDEX idx_legal_docs_embedding ON legal_documents 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all user-facing tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE civic_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - USERS
-- ============================================
CREATE POLICY "Users can read all profiles" 
  ON users FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid()::text = firebase_uid);

CREATE POLICY "Anyone can create profile during signup" 
  ON users FOR INSERT 
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES - PETITIONS
-- ============================================
CREATE POLICY "Anyone can read petitions" 
  ON petitions FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create petitions" 
  ON petitions FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own petitions" 
  ON petitions FOR UPDATE 
  USING (creator_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text));

CREATE POLICY "Users can delete own petitions" 
  ON petitions FOR DELETE 
  USING (creator_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text));

-- ============================================
-- RLS POLICIES - SIGNATURES
-- ============================================
CREATE POLICY "Anyone can read signatures" 
  ON signatures FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can sign" 
  ON signatures FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- RLS POLICIES - CIVIC ISSUES
-- ============================================
CREATE POLICY "Anyone can read civic issues" 
  ON civic_issues FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can report issues" 
  ON civic_issues FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- RLS POLICIES - NOTIFICATIONS
-- ============================================
CREATE POLICY "Users can read own notifications" 
  ON notifications FOR SELECT 
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text));

-- ============================================
-- RLS POLICIES - LEGAL DOCUMENTS
-- ============================================
CREATE POLICY "Anyone can read legal documents" 
  ON legal_documents FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage documents" 
  ON legal_documents FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access" 
  ON legal_documents FOR ALL 
  TO service_role 
  USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- ============================================
-- FUNCTION: Auto-update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Increment petition signature count
-- ============================================
CREATE OR REPLACE FUNCTION increment_signature_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE petitions 
  SET signature_count = signature_count + 1,
      updated_at = NOW()
  WHERE id = NEW.petition_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Decrement petition signature count
-- ============================================
CREATE OR REPLACE FUNCTION decrement_signature_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE petitions 
  SET signature_count = GREATEST(signature_count - 1, 0),
      updated_at = NOW()
  WHERE id = OLD.petition_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Increment issue upvote count
-- ============================================
CREATE OR REPLACE FUNCTION increment_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE civic_issues 
  SET upvotes = upvotes + 1 
  WHERE id = NEW.issue_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Recalculate signature counts
-- ============================================
CREATE OR REPLACE FUNCTION recalculate_signature_counts()
RETURNS void AS $$
BEGIN
  UPDATE petitions p
  SET signature_count = (
    SELECT COUNT(*)
    FROM signatures s
    WHERE s.petition_id = p.id
  ),
  updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Search legal documents by similarity
-- ============================================
CREATE OR REPLACE FUNCTION search_legal_documents(
  query_embedding VECTOR(384),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5,
  filter_categories TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  act_name TEXT,
  section_number TEXT,
  title TEXT,
  content TEXT,
  plain_language_summary TEXT,
  keywords TEXT[],
  categories TEXT[],
  jurisdiction TEXT,
  source_url TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    legal_documents.id,
    legal_documents.act_name,
    legal_documents.section_number,
    legal_documents.title,
    legal_documents.content,
    legal_documents.plain_language_summary,
    legal_documents.keywords,
    legal_documents.categories,
    legal_documents.jurisdiction,
    legal_documents.source_url,
    1 - (legal_documents.embedding <=> query_embedding) AS similarity
  FROM legal_documents
  WHERE 
    legal_documents.status = 'active'
    AND legal_documents.embedding IS NOT NULL
    AND 1 - (legal_documents.embedding <=> query_embedding) > match_threshold
    AND (filter_categories IS NULL OR legal_documents.categories && filter_categories)
  ORDER BY legal_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update timestamps on UPDATE
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_petitions_updated_at 
  BEFORE UPDATE ON petitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_authorities_updated_at 
  BEFORE UPDATE ON authorities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_civic_issues_updated_at 
  BEFORE UPDATE ON civic_issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_documents_updated_at 
  BEFORE UPDATE ON legal_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-increment/decrement signature counts
CREATE TRIGGER trigger_increment_signature_count
  AFTER INSERT ON signatures
  FOR EACH ROW EXECUTE FUNCTION increment_signature_count();

CREATE TRIGGER trigger_decrement_signature_count
  AFTER DELETE ON signatures
  FOR EACH ROW EXECUTE FUNCTION decrement_signature_count();

-- Auto-increment issue upvote counts
CREATE TRIGGER trigger_increment_upvote_count
  AFTER INSERT ON issue_upvotes
  FOR EACH ROW EXECUTE FUNCTION increment_upvote_count();

-- ============================================
-- VIEWS
-- ============================================

CREATE OR REPLACE VIEW active_legal_documents AS
SELECT 
  id,
  act_name,
  section_number,
  chapter,
  title,
  content,
  plain_language_summary,
  keywords,
  categories,
  jurisdiction,
  state,
  source_url,
  effective_from,
  amended_on
FROM legal_documents
WHERE status = 'active'
ORDER BY act_name, section_number;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE users IS 'Registered users of the MyKairo civic platform';
COMMENT ON TABLE petitions IS 'Citizen petitions for civic issues and causes';
COMMENT ON TABLE signatures IS 'User signatures on petitions';
COMMENT ON TABLE legal_documents IS 'Verified legal documents for RAG-based legal assistant';
COMMENT ON COLUMN legal_documents.embedding IS 'HuggingFace sentence-transformers/all-MiniLM-L6-v2 embedding (384 dimensions) for semantic search';
COMMENT ON FUNCTION search_legal_documents IS 'Semantic search function for finding relevant legal documents based on query embedding';
COMMENT ON FUNCTION recalculate_signature_counts IS 'Utility function to recalculate all petition signature counts from actual signatures table';

-- ============================================
-- BASELINE MIGRATION COMPLETE
-- ============================================
