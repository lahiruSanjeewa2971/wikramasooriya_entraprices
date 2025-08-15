import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import AuthLayout from "@/components/auth/AuthLayout";
import { Mail, Lock, User, Eye, EyeOff, Check, X, Phone, MapPin } from "lucide-react";
import { z } from "zod";
import authService from "@/services/authService";
import toastService from "@/services/toastService";

// Zod validation schema
const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^[+]?[\d\s\-\(\)]{10,15}$/, "Please enter a valid mobile number"),
  location: z
    .string()
    .min(1, "Location is required")
    .min(3, "Location must be at least 3 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    location: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Password requirements
  const getPasswordRequirements = (password) => [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { text: "Contains a number", met: /\d/.test(password) },
    { text: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const passwordRequirements = getPasswordRequirements(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validatedData = registerSchema.parse(formData);
      setErrors({});
      
      setIsLoading(true);
      
      // Call auth service
      const result = await authService.register(validatedData);
      
      if (result.success) {
        toastService.success("Registration successful! Welcome to Wikramasooriya Enterprises.");
        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Validation errors
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        // API errors
        toastService.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <AuthLayout 
      title="Create Your Account" 
      subtitle="Join thousands of businesses managing their industrial parts efficiently"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="Full Name" 
          name="name" 
          type="text" 
          value={formData.name} 
          onChange={handleChange} 
          icon={User} 
          placeholder="John Smith" 
          error={errors.name} 
        />
        
        <Input 
          label="Email Address" 
          name="email" 
          type="email" 
          value={formData.email} 
          onChange={handleChange} 
          icon={Mail} 
          placeholder="your.email@company.com" 
          error={errors.email} 
        />
        
        <Input 
          label="Mobile Number" 
          name="mobile" 
          type="tel" 
          value={formData.mobile} 
          onChange={handleChange} 
          icon={Phone} 
          placeholder="+94 71 234 5678" 
          error={errors.mobile} 
        />
        
        <Input 
          label="Location" 
          name="location" 
          type="text" 
          value={formData.location} 
          onChange={handleChange} 
          icon={MapPin} 
          placeholder="Colombo, Sri Lanka" 
          error={errors.location} 
        />
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              className="w-full pl-10 pr-12 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Password Requirements */}
          {formData.password && (
            <div className="mt-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Password Requirements:</div>
              <div className="grid grid-cols-1 gap-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {req.met ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={req.met ? "text-green-600" : "text-muted-foreground"}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full pl-10 pr-12 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
          )}
        </div>
        
        <div className="flex items-start space-x-2">
          <input
            id="terms"
            type="checkbox"
            required
            className="mt-1 rounded border-input text-primary focus:ring-primary"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I agree to the{" "}
            <Link to="/terms" className="text-primary hover:text-primary-hover font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:text-primary-hover font-medium">
              Privacy Policy
            </Link>
          </label>
        </div>
        
        <Button 
          type="submit" 
          size="lg" 
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
        
        <div className="text-center">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link
            to="/login"
            className="text-primary hover:text-primary-hover font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </form>

      {/* Security note */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="text-xs text-center text-muted-foreground">
          <div className="font-semibold text-foreground mb-1">Secure Registration</div>
          Your information is protected with enterprise-grade security. We never share your data with third parties.
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
