/*
  # Add stores selection to messages table

  1. Schema Changes
    - Add `stores` column to messages table to store selected stores as JSON
    - Add `store_selection_type` column to track how stores were selected (manual, select, all)

  2. Data Structure
    - stores: JSON array containing store information
    - store_selection_type: enum-like field for selection method

  3. Indexes
    - Add index on store_selection_type for filtering
*/

-- Add new columns to messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'stores'
  ) THEN
    ALTER TABLE messages ADD COLUMN stores jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'store_selection_type'
  ) THEN
    ALTER TABLE messages ADD COLUMN store_selection_type text DEFAULT 'manual';
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_store_selection_type ON messages(store_selection_type);
CREATE INDEX IF NOT EXISTS idx_messages_stores ON messages USING GIN (stores);

-- Add some sample data to existing messages if they don't have stores
UPDATE messages 
SET stores = '[{"name": "Sample Store", "code": "SAMPLE001"}]'::jsonb,
    store_selection_type = 'manual'
WHERE stores = '[]'::jsonb OR stores IS NULL;