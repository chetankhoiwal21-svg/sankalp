export interface Student {
  id: string;
  email: string;
  phone: string;
  name: string;
  class: number;
  auth_user_id: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  class: number;
  created_at: string;
  uploaded_by: string;
}

export interface Video {
  id: string;
  title: string;
  file_url: string;
  class: number;
  created_at: string;
  expires_at: string;
  uploaded_by: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'student';
  created_at: string;
}

export type AuthStep = 'email' | 'phone' | 'otp';
