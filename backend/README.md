# Backend - Database & Migrations

This folder contains SQL migration files and database schema for the MemoryNest project.

## Setup Instructions

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run migrations in order:**
   - Go to your Supabase Dashboard → SQL Editor
   - Run each file in the `migrations/` folder in order:
     1. `001_initial_schema.sql` - Creates tables and triggers
     2. `002_rls_policies.sql` - Sets up Row Level Security
     3. `003_enable_realtime.sql` - Enables Realtime subscriptions

3. **Enable Realtime in Dashboard:**
   - Navigate to Database → Replication
   - Toggle on Realtime for `items` and `boards` tables

4. **Create Storage Bucket** (for images):
   - Go to Storage in Supabase Dashboard
   - Create a new bucket named `board-images`
   - Set it to public or use signed URLs based on your preference

5. **Get your credentials:**
   - Go to Project Settings → API
   - Copy:
     - Project URL
     - `anon` public key
   - Add them to `frontend/.env.local`

## Schema Overview

### Tables

- **boards**: Stores board metadata (title, secret_slug for access)
- **items**: Stores all board items (notes, images, links) with position (x, y, z_index)

### Security

- **Phase 1**: Public access with secret URL (current setup)
- **Phase 2**: User-based authentication (commented out in `002_rls_policies.sql`)

## Future Backend Needs

If you need custom server logic later, you can add:
- Express.js API in this folder
- Custom image processing
- Email notifications
- Scheduled jobs
