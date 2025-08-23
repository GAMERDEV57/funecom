import React, { useState } from 'react';
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from 'sonner';

export function EnhancedSignInForm() {
  const { signIn } = useAuthActions();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signIn("password", {
        email: formData.email,
        password: formData.password,
        flow: isSignUp ? "signUp" : "signIn",
        ...(isSignUp && { name: formData.name })
      });

      toast.success(isSignUp ? "Account created successfully!" : "Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
    setErrors({});
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header with Animation */}
      <div className="text-center mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <img 
            src="https://i.ibb.co/1W3dCXw/1000056576-removebg-preview.png" 
            alt="FunEcom Logo" 
            className="h-16 w-auto mx-auto mb-4 relative z-10"
          />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {isSignUp ? 'Join FunEcom' : 'Welcome Back!'}
        </h1>
        <p className="text-gray-600">
          {isSignUp 
            ? 'Create your account and start your journey' 
            : 'Sign in to continue your shopping experience'
          }
        </p>
        
        {/* Feature Highlights */}
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <span className="mr-1">✅</span>
            Zero Fees
          </div>
          <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            <span className="mr-1">🚀</span>
            Fast Setup
          </div>
          <div className="flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
            <span className="mr-1">🔒</span>
            Secure
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field (Sign Up Only) */}
        {isSignUp && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-gray-400">👤</span>
              </div>
            </div>
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-gray-400">📧</span>
            </div>
          </div>
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        {/* Confirm Password Field (Sign Up Only) */}
        {isSignUp && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-gray-400">🔒</span>
              </div>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">{isSignUp ? '🚀' : '🔑'}</span>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </div>
          )}
        </button>

        {/* Toggle Mode */}
        <div className="text-center">
          <p className="text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={toggleMode}
              className="ml-2 text-primary hover:text-primary-hover font-semibold transition-colors duration-200"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </form>

      {/* Benefits Section */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-gray-800 mb-3 text-center">Why Choose FunEcom?</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-gray-700">
            <span className="mr-2 text-green-500">✅</span>
            Zero Platform Fees
          </div>
          <div className="flex items-center text-gray-700">
            <span className="mr-2 text-blue-500">🛡️</span>
            Secure Payments
          </div>
          <div className="flex items-center text-gray-700">
            <span className="mr-2 text-purple-500">🚚</span>
            Fast Delivery
          </div>
          <div className="flex items-center text-gray-700">
            <span className="mr-2 text-orange-500">📞</span>
            24/7 Support
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 mb-2">Trusted by thousands of users</p>
        <div className="flex justify-center items-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center">
            <span className="mr-1">🔒</span>
            SSL Secured
          </div>
          <div className="flex items-center">
            <span className="mr-1">🇮🇳</span>
            Made in India
          </div>
          <div className="flex items-center">
            <span className="mr-1">⭐</span>
            4.8/5 Rating
          </div>
        </div>
      </div>
    </div>
  );
}
