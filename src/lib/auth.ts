import { supabase } from './supabase';

export async function sendOTP(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) throw error;
}

export async function verifyOTP(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) throw error;
  return data;
}

export async function checkStudentExists(email: string, phone: string) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('email', email)
    .eq('phone', phone)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function linkStudentToAuth(studentId: string, authUserId: string) {
  const { error } = await supabase
    .from('students')
    .update({ auth_user_id: authUserId })
    .eq('id', studentId);

  if (error) throw error;
}

export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.role;
}

export async function manageSession(userId: string, sessionId: string) {
  const { data: existing } = await supabase
    .from('active_sessions')
    .select('session_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing && existing.session_id !== sessionId) {
    await supabase
      .from('active_sessions')
      .delete()
      .eq('user_id', userId);
  }

  const { error } = await supabase
    .from('active_sessions')
    .upsert({
      user_id: userId,
      session_id: sessionId,
    });

  if (error) throw error;
}

export async function checkSessionValid(userId: string, sessionId: string) {
  const { data } = await supabase
    .from('active_sessions')
    .select('session_id')
    .eq('user_id', userId)
    .maybeSingle();

  return data?.session_id === sessionId;
}
