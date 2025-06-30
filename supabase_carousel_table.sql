-- Create carousel table for banner management
CREATE TABLE carousel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pictures TEXT NOT NULL, -- URL to the uploaded image
  title TEXT NOT NULL,
  subtitle TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_carousel_is_active ON carousel(is_active);
CREATE INDEX idx_carousel_created_at ON carousel(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE carousel ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON carousel
  FOR ALL USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_carousel_updated_at 
  BEFORE UPDATE ON carousel 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 