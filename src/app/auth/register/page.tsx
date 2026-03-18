'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle, Loader } from 'lucide-react';

// Password strength checker
const checkPasswordStrength = (password: string) => {
  let strength = 0;
  let feedback = [];

  if (password.length >= 8) strength++;
  else feedback.push('At least 8 characters');

  if (password.length >= 12) strength++;
  else feedback.push('At least 12 characters for stronger security');

  if (/[a-z]/.test(password)) strength++;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) strength++;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) strength++;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  else feedback.push('Add special characters (!@#$%^&*)');

  return {
    score: strength,
    maxScore: 6,
    isEmpty: password.length === 0,
    feedback: feedback,
  };
};

const PasswordStrengthMeter = ({ password }: { password: string }) => {
  const strength = checkPasswordStrength(password);

  if (strength.isEmpty) {
    return null;
  }

  const percentage = (strength.score / strength.maxScore) * 100;
  let color = 'bg-red-500';
  let label = 'Weak';

  if (percentage >= 75) {
    color = 'bg-green-500';
    label = 'Strong';
  } else if (percentage >= 50) {
    color = 'bg-yellow-500';
    label = 'Medium';
  } else if (percentage >= 25) {
    color = 'bg-orange-500';
    label = 'Fair';
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">Password Strength</span>
        <span className={`text-xs font-semibold ${color === 'bg-green-500' ? 'text-green-400' : color === 'bg-yellow-500' ? 'text-yellow-400' : color === 'bg-orange-500' ? 'text-orange-400' : 'text-red-400'}`}>
          {label}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-slate-400 space-y-1 mt-2">
          {strength.feedback.map((item, idx) => (
            <li key={idx} className="flex items-center gap-1">
              <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTermsAndPrivacy, setAgreeToTermsAndPrivacy] = useState(false);

  const passwordStrength = checkPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    // Validation
    if (!formData.fullName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (formData.fullName.length < 2) {
      setFormError('Full name must be at least 2 characters');
      return;
    }

    if (formData.username.length < 3) {
      setFormError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      setFormError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Please enter a valid email');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    if (passwordStrength.score < 3) {
      setFormError('Password is too weak. Please use a stronger password.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (!agreeToTermsAndPrivacy) {
      setFormError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
      });
      
      // Redirect to dashboard or home
      router.push('/');
    } catch {
      setFormError(error || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Join Us</h1>
              <p className="text-slate-300 text-sm">Create your Wondertravelers account</p>
            </div>

            {/* Error Alert */}
            {(formError || error) && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{formError || error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Subash Thapa"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <PasswordStrengthMeter password={formData.password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  {formData.password && formData.confirmPassword && (
                    formData.password === formData.confirmPassword ? (
                      <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-400" />
                    )
                  )}
                </div>
              </div>

              {/* Terms & Privacy */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToTermsAndPrivacy}
                    onChange={(e) => setAgreeToTermsAndPrivacy(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-400 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-300">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-400 hover:underline">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-blue-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-6"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-slate-800 text-slate-400">or</span>
                </div>
              </div>

              {/* Login Link */}
              <p className="text-center text-sm text-slate-300">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition"
                >
                  Sign in here
                </Link>
              </p>
            </form>

            {/* Privacy Notice */}
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-400">
                🔒 We protect your data with industry-standard encryption. Your password is
                hashed and never stored in plain text.
              </p>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-slate-400 hover:text-slate-300 text-sm transition">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
