import React, { useState, FormEvent, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { toast } from 'sonner';
import { Id } from '../convex/_generated/dataModel';

interface CreateStoreFormProps {
  onSuccess: () => void;
}

export default function CreateStoreForm({ onSuccess }: CreateStoreFormProps) {
  const createStore = useMutation(api.stores.createStore);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    categories: [] as string[],
    openingHours: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    businessAddressStreet: '',
    businessAddressArea: '',
    businessAddressPincode: '',
    businessAddressState: '',
    businessAddressCountry: 'India',
    businessAddressLandmark: '',
    // New store fee fields
    storeCharges: 0,
    gstApplicable: false,
    gstPercentage: 18,
    codAvailable: true,
    codCharges: 0,
  });

  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const availableCategories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 
    'Health & Beauty', 'Toys', 'Automotive', 'Food & Beverages', 'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleFileSelect = (type: 'logo' | 'banner', file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'logo') {
        setSelectedLogo(file);
        setLogoPreview(result);
      } else {
        setSelectedBanner(file);
        setBannerPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File): Promise<Id<"_storage">> => {
    const uploadUrl = await generateUploadUrl();
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    return storageId;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let storeLogoId: Id<"_storage"> | undefined;
      let storeBannerId: Id<"_storage"> | undefined;

      if (selectedLogo) {
        storeLogoId = await uploadFile(selectedLogo);
      }
      if (selectedBanner) {
        storeBannerId = await uploadFile(selectedBanner);
      }

      await createStore({
        ...formData,
        storeLogoId,
        storeBannerId,
      });

      toast.success("Store created successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to create store");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all duration-200 ease-in-out shadow-sm hover:border-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Create Your Store</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Store Basic Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Store Name *</label>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              className={inputClass}
              required
              placeholder="Enter your store name"
            />
          </div>
          <div>
            <label className={labelClass}>Opening Hours *</label>
            <input
              type="text"
              name="openingHours"
              value={formData.openingHours}
              onChange={handleInputChange}
              className={inputClass}
              required
              placeholder="e.g., Mon-Fri 9AM-6PM"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Store Description *</label>
          <textarea
            name="storeDescription"
            value={formData.storeDescription}
            onChange={handleInputChange}
            className={inputClass}
            rows={4}
            required
            placeholder="Describe your store and what you sell"
          />
        </div>

        {/* Categories */}
        <div>
          <label className={labelClass}>Categories *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {availableCategories.map(category => (
              <label key={category} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Store Images */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Store Logo</label>
            <div className="space-y-3">
              {logoPreview && (
                <img src={logoPreview} alt="Logo preview" className="w-32 h-32 object-cover rounded-lg border" />
              )}
              <input
                type="file"
                ref={logoInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileSelect('logo', e.target.files[0])}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Choose Logo
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>Store Banner</label>
            <div className="space-y-3">
              {bannerPreview && (
                <img src={bannerPreview} alt="Banner preview" className="w-full h-32 object-cover rounded-lg border" />
              )}
              <input
                type="file"
                ref={bannerInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileSelect('banner', e.target.files[0])}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Choose Banner
              </button>
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Owner Information</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Owner Name *</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Owner Email *</label>
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Owner Phone *</label>
              <input
                type="tel"
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
          </div>
        </div>

        {/* Business Address */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Business Address</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Street Address *</label>
              <input
                type="text"
                name="businessAddressStreet"
                value={formData.businessAddressStreet}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Area/Locality *</label>
              <input
                type="text"
                name="businessAddressArea"
                value={formData.businessAddressArea}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Pincode *</label>
              <input
                type="text"
                name="businessAddressPincode"
                value={formData.businessAddressPincode}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input
                type="text"
                name="businessAddressState"
                value={formData.businessAddressState}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Country *</label>
              <input
                type="text"
                name="businessAddressCountry"
                value={formData.businessAddressCountry}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Landmark</label>
              <input
                type="text"
                name="businessAddressLandmark"
                value={formData.businessAddressLandmark}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Store Charges & Settings */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Store Charges & Settings</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Store Service Charges (₹)</label>
              <input
                type="number"
                name="storeCharges"
                value={formData.storeCharges}
                onChange={handleInputChange}
                className={inputClass}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Additional service fee per order</p>
            </div>
            <div>
              <label className={labelClass}>COD Charges (₹)</label>
              <input
                type="number"
                name="codCharges"
                value={formData.codCharges}
                onChange={handleInputChange}
                className={inputClass}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Cash on Delivery charges</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="gstApplicable"
                checked={formData.gstApplicable}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">GST Applicable</label>
            </div>
            {formData.gstApplicable && (
              <div>
                <label className={labelClass}>GST Percentage (%)</label>
                <input
                  type="number"
                  name="gstPercentage"
                  value={formData.gstPercentage}
                  onChange={handleInputChange}
                  className={inputClass}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="codAvailable"
                checked={formData.codAvailable}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Cash on Delivery Available</label>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={isSubmitting || formData.categories.length === 0}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Store...
              </span>
            ) : (
              "Create Store"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
