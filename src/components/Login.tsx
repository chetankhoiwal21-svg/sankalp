import { useState } from 'react';
import { LogIn, Mail, Phone, Key } from 'lucide-react';
import { checkStudentExists, linkStudentToAuth, sendOTP, verifyOTP } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { AuthStep } from '../types';

export default function Login() {
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const student = await checkStudentExists(email, '');
      if (!student) {
        const { data: adminUser } = await supabase.auth.getUser();
        if (adminUser.user) {
          const { data: role } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', adminUser.user.id)
            .maybeSingle();

          if (role?.role === 'admin') {
            setStep('phone');
            setLoading(false);
            return;
          }
        }
        setError('Email not found. Contact admin to register.');
        setLoading(false);
        return;
      }
      setStep('phone');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const student = await checkStudentExists(email, phone);
      if (!student) {
        setError('Email and phone do not match. Please check your details.');
        setLoading(false);
        return;
      }

      await sendOTP(email);
      setStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { session } = await verifyOTP(email, otp);
      if (!session) {
        setError('Invalid OTP');
        setLoading(false);
        return;
      }

      const student = await checkStudentExists(email, phone);
      if (student && !student.auth_user_id) {
        await linkStudentToAuth(student.id, session.user.id);

        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!existingRole) {
          await supabase
            .from('user_roles')
            .insert({ user_id: session.user.id, role: 'student' });
        }
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('email');
    setEmail('');
    setPhone('');
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-blue-600 p-3 rounded-full">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Class Management System
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Sign in to access your dashboard
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="student@school.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234567890"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Send OTP'}
            </button>
            <button
              type="button"
              onClick={resetFlow}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-900"
            >
              Back to email
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456"
                  required
                  disabled={loading}
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Check your email for the 6-digit code
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button
              type="button"
              onClick={resetFlow}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-900"
            >
              Start over
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
