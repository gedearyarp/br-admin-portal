-- Add category_type to peripherals
ALTER TABLE peripherals ADD COLUMN category_type TEXT;

-- Add category_type to communities
ALTER TABLE communities ADD COLUMN category_type TEXT; 