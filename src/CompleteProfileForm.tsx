import React, { useState, FormEvent, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { toast } from 'sonner';
import { Doc } from '../convex/_generated/dataModel';

interface CompleteProfileFormProps {
  onProfileCompleted: () => void; // Callback to refresh or change view
}

export default function CompleteProfileForm({ onProfileCompleted }: CompleteProfileFormProps) {
  const loggedInUser = useQuery(api.auth.loggedInUser) as Doc<"users"> | null;
  const updateUserProfile = useMutation(api.users.updateMyUserProfile);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loggedInUser) {
      setName(loggedInUser.name || '');
      setPhone(loggedInUser.phone || '');
    }
  }, [loggedInUser]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers, +, -, and spaces
    const phoneRegex = /^[0-9+\-\s]*$/;
    if (phoneRegex.test(value)) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name.trim()) {
      toast.error("Please enter your name.");
      setIsLoading(false);
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number.");
      setIsLoading(false);
      return;
    }

    // Basic phone validation
    const phonePattern = /^[+]?[0-9\s\-]{10,15}$/;
    if (!phonePattern.test(phone.trim())) {
      toast.error("Please enter a valid phone number (10-15 digits).");
      setIsLoading(false);
      return;
    }

    try {
      await updateUserProfile({ name: name.trim(), phone: phone.trim() });
      toast.success("Profile updated successfully!");
      onProfileCompleted(); // Trigger refresh or view change
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      if (error.message && error.message.includes("phone number is already in use")) {
        toast.error("This phone number is already registered with another account.");
      } else {
        toast.error(error.data?.message || "Failed to update profile.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all duration-200 ease-in-out shadow-sm hover:border-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-3 text-center">Complete Your Profile</h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Please provide your name and phone number to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="profileName" className={labelClass}>Full Name</label>
            <input 
              type="text" 
              id="profileName" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className={inputClass}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label htmlFor="profilePhone" className={labelClass}>Phone Number</label>
            <input 
              type="tel" 
              id="profilePhone" 
              value={phone} 
              onChange={handlePhoneChange}
              required 
              className={inputClass}
              placeholder="e.g., +91XXXXXXXXXX"
              maxLength={15}
            />
            <p className="text-xs text-gray-500 mt-1">Enter numbers only (10-15 digits)</p>
          </div>
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full auth-button py-3 text-base font-semibold mt-3 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Complete Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
