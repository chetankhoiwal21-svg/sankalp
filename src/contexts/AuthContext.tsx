import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { checkSessionValid, getUserRole, manageSession } from '../lib/auth';
import { Student } from '../types';

interface AuthContextType {
  user: User | null;
  student: Student | null;
  role: 'admin' | 'student' | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [role, setRole] = useState<'admin' | 'student' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        initializeUser(session.user, session.access_token, false);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          if (event === 'SIGNED_IN' && session?.user) {
            await initializeUser(session.user, session.access_token, true);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setStudent(null);
            setRole(null);
            setLoading(false);
          }
        })();
      }
    );

    const checkInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const isValid = await checkSessionValid(session.user.id, session.access_token);
        if (!isValid) {
          await supabase.auth.signOut();
        }
      }
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(checkInterval);
    };
  }, []);

  const initializeUser = async (authUser: User, sessionId: string, isNewSignIn = false) => {
    try {
      if (!isNewSignIn) {
        const isValid = await checkSessionValid(authUser.id, sessionId);
        if (!isValid) {
          await supabase.auth.signOut();
          return;
        }
      }

      await manageSession(authUser.id, sessionId);

      const userRole = await getUserRole(authUser.id);
      setRole(userRole || null);

      if (userRole === 'student') {
        const { data: studentData } = await supabase
          .from('students')
          .select('*')
          .eq('auth_user_id', authUser.id)
          .maybeSingle();

        setStudent(studentData);
      }

      setUser(authUser);
    } catch (error) {
      console.error('Error initializing user:', error);
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (user) {
      await supabase
        .from('active_sessions')
        .delete()
        .eq('user_id', user.id);
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, student, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
