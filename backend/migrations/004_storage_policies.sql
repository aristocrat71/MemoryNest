-- Set up Row Level Security policies for the board-images bucket
-- Note: The bucket should be created as public: true via the application

-- Allow public read access to images in the board-images bucket
CREATE POLICY "Anyone can view board images" ON storage.objects
  FOR SELECT USING (bucket_id = 'board-images');

-- Allow anyone to upload images to the board-images bucket
CREATE POLICY "Anyone can upload board images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'board-images');

-- Allow anyone to update images in the board-images bucket
CREATE POLICY "Anyone can update board images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'board-images');

-- Allow anyone to delete images from the board-images bucket
CREATE POLICY "Anyone can delete board images" ON storage.objects
  FOR DELETE USING (bucket_id = 'board-images');