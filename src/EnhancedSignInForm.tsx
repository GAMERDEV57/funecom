import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Rocket,
  Key,
  Shield,
  Star,
  Headphones,
  Truck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function EnhancedSignInForm() {
  const { signIn } = useAuthActions();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isSignUp) {
      if (!formData.name) {
        newErrors.name = "Name is required";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
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
        ...(isSignUp && { name: formData.name }),
      });

      toast.success(
        isSignUp ? "Account created successfully!" : "Welcome back!"
      );
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ email: "", password: "", confirmPassword: "", name: "" });
    setErrors({});
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-2xl rounded-2xl p-8 relative overflow-hidden">
      {/* Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 opacity-40 blur-2xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <img
              src="https://i.ibb.co/1W3dCXw/1000056576-removebg-preview.png"
              alt="FunEcom Logo"
              className="h-16 w-auto mx-auto mb-4 relative z-10"
            />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {isSignUp ? "Join FunEcom" : "Welcome Back!"}
          </h1>
          <p className="text-gray-600">
            {isSignUp
              ? "Create your account and start your journey"
              : "Sign in to continue your shopping experience"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative mt-1">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your email"
              />
              <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your password"
              />
              <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                />
                <Shield className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {isSignUp ? "Creating Account..." : "Signing In..."}
              </>
            ) : (
              <>
                {isSignUp ? <Rocket className="w-5 h-5" /> : <Key className="w-5 h-5" />}
                {isSignUp ? "Create Account" : "Sign In"}
              </>
            )}
          </button>

          {/* Toggle */}
          <p className="text-center text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={toggleMode}
              className="ml-2 text-blue-600 font-semibold hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </form>

        {/* Benefits */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-3 text-center">
            Why Choose FunEcom?
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
              Zero Fees
            </div>
            <div className="flex items-center text-gray-700">
              <Shield className="w-4 h-4 text-blue-500 mr-2" />
              Secure Payments
            </div>
            <div className="flex items-center text-gray-700">
              <Truck className="w-4 h-4 text-purple-500 mr-2" />
              Fast Delivery
            </div>
            <div className="flex items-center text-gray-700">
              <Headphones className="w-4 h-4 text-orange-500 mr-2" />
              24/7 Support
            </div>
          </div>
        </div>

        {/* Trust */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-2">
            Trusted by thousands of users
          </p>
          <div className="flex justify-center items-center space-x-4 text-xs text-gray-400">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              SSL Secured
            </div>
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 mr-1" />
              Made in India
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              4.8/5 Rating
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
