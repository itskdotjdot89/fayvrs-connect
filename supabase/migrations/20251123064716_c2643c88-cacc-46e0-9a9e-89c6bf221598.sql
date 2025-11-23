-- Add media_type column to portfolio_items table
ALTER TABLE portfolio_items 
ADD COLUMN media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video'));

-- Update existing rows to have 'image' as media_type
UPDATE portfolio_items SET media_type = 'image' WHERE media_type IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN portfolio_items.media_type IS 'Type of media: image or video';