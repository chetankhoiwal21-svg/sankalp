# Class Management App - Setup Guide

## Initial Admin Setup

To set up your first admin user, you have two options:

### Option 1: Using Edge Function (Recommended)

Use the create-admin edge function:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@school.com", "password": "your-secure-password"}'
```

This automatically creates the admin user and assigns the admin role.

### Option 2: Manual Setup via Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to Authentication > Users
3. Click "Add User" and create a user with email/password
4. Copy the User ID
5. In the SQL Editor, run:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('your-user-id-here', 'admin');
   ```

### Login to Admin Dashboard

1. Open the app
2. Enter your admin email
3. You'll be prompted for OTP (check email)
4. Login and start managing students

## Admin Functions

### Adding Students

1. Go to "Add Students" tab
2. Fill in: name, email, phone, class (8-12)
3. Students can now login with their email and phone

### Uploading Notes

1. Go to "Upload Notes" tab
2. Select class, add title, and upload file (PDF/Image/Text)
3. Maximum 20 notes per class (oldest auto-deleted)

### Uploading Videos

1. Go to "Upload Videos" tab
2. Select class, add title, and upload video
3. Videos auto-delete after 24 hours

## Student Login Process

1. Student enters email
2. Student enters phone (must match admin records)
3. OTP sent to email
4. Student verifies OTP
5. Auto-assigned to correct class
6. Only sees content for their class

## Security Features

- Email OTP authentication (no passwords)
- One device login only (new login = auto logout old session)
- Class isolation (students only see their class data)
- Row Level Security enabled on all tables
- Admin-only content management

## Storage Limits

- Notes: Maximum 20 per class (FIFO deletion)
- Videos: Auto-delete after 24 hours
- Countdown timer shown to students
