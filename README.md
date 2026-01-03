# MemoryNest 

A private, shared digital scrapbook for two people to collaboratively create a beautiful board of memories, notes, images, and links.

## ✨ Features

- **Shared Boards**: Create private boards with secret URLs - no login required (Phase 1)
- **Real-time Collaboration**: See changes instantly when either person edits the board
- **Multiple Content Types**:
  - 📝 Text notes with colorful backgrounds
  - 🖼️ Images with optional captions
  - 🔗 Links with automatic metadata
- **Drag & Drop**: Freely arrange items anywhere on the canvas
- **Mobile Friendly**: Works beautifully on phones and tablets

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- A Supabase account (free tier)

### 1. Clone and Install

```bash
git clone <your-repo>
cd MemoryNest/frontend
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the migrations in order:
   - `../backend/migrations/001_initial_schema.sql`
   - `../backend/migrations/002_rls_policies.sql`
   - `../backend/migrations/003_enable_realtime.sql`
3. Enable Realtime:
   - Go to Database → Replication
   - Toggle on for `boards` and `items` tables
4. (Optional) Create a storage bucket:
   - Go to Storage
   - Create bucket named `board-images`
   - Set to public

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontend` folder:

```bash
cp .env.local.example .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: Project Settings → API in your Supabase dashboard

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
MemoryNest/
├── backend/
│   ├── migrations/          # SQL schema and migrations
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages
│   │   │   ├── page.tsx    # Landing page
│   │   │   └── b/[slug]/   # Board page
│   │   ├── components/     # React components
│   │   │   ├── BoardCanvas.tsx
│   │   │   ├── BoardItem.tsx
│   │   │   └── Toolbar.tsx
│   │   ├── hooks/          # Custom hooks
│   │   │   └── useBoardItems.ts
│   │   └── lib/            # Utilities & types
│   │       ├── supabaseClient.ts
│   │       ├── types.ts
│   │       └── utils.ts
│   └── package.json
├── CLAUDE.md              # AI context (technical spec)
└── README.md             # This file
```

## 🎯 Usage

### Creating a Board

1. Go to the homepage
2. Enter a board name (e.g., "Our Memories")
3. Click "Create Board"
4. Share the URL with your partner

### Adding Content

- **Note**: Click the 📝 button, type your note, and click "Add Note"
- **Image**: Click the 🖼️ button and select an image from your device
- **Link**: Click the 🔗 button, paste a URL, and click "Add Link"

### Interacting with Items

- **Move**: Drag items anywhere on the canvas
- **Delete**: Hover over an item and click the × button
- **Bring to Front**: Click an item to bring it above others
- **Pan Canvas**: Hold Shift + drag to move the entire canvas

## 🔒 Privacy & Security

- Phase 1 uses secret URLs - anyone with the link can access
- No public discovery - boards are private by default
- Future: User authentication via Supabase Auth (Phase 2)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Drag & Drop**: react-draggable
- **State Management**: Zustand (planned)

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

See [CLAUDE.md](CLAUDE.md) for full technical context and architecture decisions.

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists with correct credentials
- Restart the dev server after adding environment variables

### "Board not found"
- Check that migrations were run in Supabase
- Verify RLS policies are enabled
- Check browser console for errors

### Realtime not working
- Ensure Realtime is enabled for `items` table in Supabase Dashboard
- Check that migration `003_enable_realtime.sql` was executed

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Production Considerations

- Set up Supabase Storage for images (instead of data URLs)
- Consider adding user authentication (Phase 2)
- Set up proper RLS policies for multi-user access
- Add error tracking (Sentry, etc.)

## 📄 License

MIT

## 💝 Built With Love

Created for couples who want a beautiful, private space to collect their memories together.
