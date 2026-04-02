# Class Management App - Phase 1

A secure, mobile-first class management system with strict authentication and content isolation.

## Features Implemented

### Authentication System
- Email OTP login (no passwords)
- One device login only (automatic session invalidation)
- Session checks every 30 seconds
- Admin pre-adds students before they can login

### Class Isolation
- Students only see content for their assigned class (8-12)
- Database-level security with Row Level Security
- No cross-class data visibility

### Notes System
- Admin uploads PDF, images, or text files
- Maximum 20 notes per class
- Automatic FIFO deletion when limit reached
- Students can view and download notes

### Video System
- Admin uploads videos
- Automatic deletion after 24 hours
- Real-time countdown timer
- Cleanup edge function deployed

### User Interface
- Clean, mobile-first design
- Fast loading and responsive
- Simple dashboards for admin and students
- Intuitive navigation

## Quick Start

### 1. Setup Admin User

See SETUP.md for detailed instructions on creating your first admin user.

### 2. Add Students

1. Login as admin
2. Navigate to "Add Students" tab
3. Enter student details: name, email, phone, class
4. Students can now login with their credentials

### 3. Upload Content

Notes:
- Go to "Upload Notes" tab
- Select class and upload file
- Max 20 notes per class

Videos:
- Go to "Upload Videos" tab
- Upload video (auto-deletes in 24h)
- Countdown timer shown to students

## Project Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AddStudent.tsx
│   │   ├── UploadNotes.tsx
│   │   ├── UploadVideo.tsx
│   │   └── ManageContent.tsx
│   ├── student/
│   │   ├── NotesSection.tsx
│   │   └── VideosSection.tsx
│   ├── AdminDashboard.tsx
│   ├── StudentDashboard.tsx
│   └── Login.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── supabase.ts
│   └── auth.ts
├── types/
│   └── index.ts
└── App.tsx

supabase/
└── functions/
    └── cleanup-expired-videos/
        └── index.ts
```

## Database Schema

### Tables
- `students` - Student records with class assignments
- `notes` - Uploaded study materials
- `videos` - Video lectures with expiration
- `active_sessions` - One-device login enforcement
- `user_roles` - Admin/student role management

### Storage Buckets
- `notes` - PDF, images, text files
- `videos` - Video files

## Security Features

1. Row Level Security on all tables
2. Class-based content isolation
3. One device login enforcement
4. Session validation every 30 seconds
5. Admin-only content management
6. Secure file storage with public URLs

## Testing

See TESTING.md for comprehensive test cases and verification steps.

## Technical Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Database + Auth + Storage)
- Lucide React (Icons)

## Build

```bash
npm install
npm run build
```

## Environment Variables

Create a `.env` file (already configured):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Edge Functions

### cleanup-expired-videos
Automatically removes videos that have expired (24h old).
Deploy: Already deployed
Trigger: Can be called manually or via cron job

## Limitations (Phase 1)

1. No bulk student import
2. Video cleanup requires manual trigger
3. No real-time notifications
4. No file preview (download only)
5. No search/filter functionality

## Future Enhancements (Phase 2+)

1. Bulk student CSV upload
2. Automatic video cleanup via cron
3. Real-time updates with Supabase Realtime
4. File preview functionality
5. Search and filter for notes/videos
6. Analytics dashboard
7. Push notifications
8. Assignment submission system
9. Attendance tracking
10. Grade management
