import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
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
  Check,
  AlertTriangle,
} from "lucide-react";

export function EnhancedSignInForm() {
  const { signIn } = useAuthActions();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [shake, setShake] = useState(false);

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

    if (Object.keys(newErrors).length > 0) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setIsSuccess(false);
    try {
      await signIn("password", {
        email: formData.email,
        password: formData.password,
        flow: isSignUp ? "signUp" : "signIn",
        ...(isSignUp && { name: formData.name }),
      });

      toast.success(isSignUp ? "Account created successfully!" : "Welcome back!");
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
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

  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return "";
    if (pwd.length < 6) return "weak";
    if (/[A-Z]/.test(pwd) && /\d/.test(pwd) && /[@$!%*?&]/.test(pwd))
      return "strong";
    return "medium";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto relative"
    >
      {/* Floating background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 opacity-40 blur-2xl"></div>

      {/* Confetti on success */}
      {isSuccess && <Confetti recycle={false} numberOfPieces={150} />}

      {/* Card */}
      <motion.div
        animate={shake ? { x: [-8, 8, -8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/40 overflow-hidden"
      >
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.img
              src="https://i.ibb.co/1W3dCXw/1000056576-removebg-preview.png"
              alt="FunEcom Logo"
              className="h-16 w-auto mx-auto mb-4"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {isSignUp ? "Join FunEcom 🚀" : "Welcome Back ✨"}
            </h1>
            <p className="text-gray-600">
              {isSignUp
                ? "Create your account and start your journey"
                : "Sign in to continue your shopping experience"}
            </p>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isSignUp ? "signUp" : "signIn"}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: isSignUp ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignUp ? -50 : 50 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
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
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                    <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
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
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                </div>
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
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
                    onKeyUp={(e) => setCapsLockOn(e.getModifierState("CapsLock"))}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
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
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {capsLockOn && (
                  <p className="flex items-center text-yellow-600 text-sm mt-1">
                    <AlertTriangle className="w-4 h-4 mr-1" /> Caps Lock is ON
                  </p>
                )}
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full ${
                        getPasswordStrength() === "weak"
                          ? "bg-red-500 w-1/3"
                          : getPasswordStrength() === "medium"
                          ? "bg-yellow-500 w-2/3"
                          : "bg-green-500 w-full"
                      } transition-all`}
                    />
                  </div>
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
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Confirm your password"
                    />
                    <Shield className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-5 h-5 text-green-300" />
                    Success
                  </>
                ) : (
                  <>
                    {isSignUp ? <Rocket className="w-5 h-5" /> : <Key className="w-5 h-5" />}
                    {isSignUp ? "Create Account" : "Sign In"}
                  </>
                )}
              </motion.button>

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
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
