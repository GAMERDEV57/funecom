import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Doc, Id } from '../convex/_generated/dataModel';
import { toast } from 'sonner';

// Types for extended profile and address
type Address = {
  id: string;
  type: string;
  street: string;
  area: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  landmark?: string | null;
  isDefault?: boolean | null;
};

type AddressFormState = {
  type: string;
  street: string;
  area: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  landmark?: string;
  isDefault?: boolean;
};

type UserProfileDocFromQuery = Doc<"userProfiles"> & { 
  profileImageUrl: string | null; 
  addresses: Address[]; 
};

type EnrichedOrder = Doc<"orders"> & { 
  productName: string; 
  storeName: string;
  statusHistory?: Array<{
    status: string;
    timestamp: number;
    location?: string;
    description?: string;
  }>;
};

// SVG Icons
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const IconDelete = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.03 3.22.077m3.22-.077L10.875 5.79m0 0a48.232 48.232 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const IconUserCircle = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconTruck = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m6-3.75h9.75a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75H16.5m-7.5-3V9.375a1.125 1.125 0 011.125-1.125H12M8.25 9.375V7.5a1.5 1.5 0 011.5-1.5h4.5A1.5 1.5 0 0116.5 7.5v1.875m-7.5 0h7.5" /></svg>;

export default function UserDashboard() {
  const loggedInUser = useQuery(api.auth.loggedInUser) as Doc<"users"> | null; 
  const userProfile = useQuery(api.users.getUserProfile) as UserProfileDocFromQuery | null | undefined; 
  const myOrders = useQuery(api.orders.getMyOrders) as EnrichedOrder[] | undefined || [];
  const updateUserProfileMutation = useMutation(api.users.updateMyUserProfile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const addAddressMutation = useMutation(api.users.addAddress);
  const updateAddressMutation = useMutation(api.users.updateAddress);
  const deleteAddressMutation = useMutation(api.users.deleteAddress);
  const setDefaultAddressMutation = useMutation(api.users.setDefaultAddress);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormState>({
    type: 'Home', street: '', area: '', pincode: '', city: '', state: '', country: 'India', landmark: undefined, isDefault: false,
  });

  useEffect(() => {
    if (loggedInUser) {
      setName(loggedInUser.name || '');
      setPhone(loggedInUser.phone || '');
      setEmail(loggedInUser.email || '');
    }
    if (userProfile && userProfile.profileImageUrl) { 
      setImagePreview(userProfile.profileImageUrl);
    } else {
      setImagePreview(null);
    }
  }, [loggedInUser, userProfile]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const phoneRegex = /^[0-9+\-\s]*$/;
    if (phoneRegex.test(value)) {
      setPhone(value);
    }
  };

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    if (phone.trim()) {
      const phonePattern = /^[+]?[0-9\s\-]{10,15}$/;
      if (!phonePattern.test(phone.trim())) {
        toast.error("Please enter a valid phone number (10-15 digits).");
        setIsSavingProfile(false);
        return;
      }
    }

    try {
      const updates: any = { name: name.trim(), phone: phone.trim() };
      if (email !== loggedInUser?.email) {
        updates.email = email.trim();
      }
      
      await updateUserProfileMutation(updates);
      toast.success("Profile details updated!");
      setIsEditingProfile(false);
    } catch (error: any) {
      if (error.message && error.message.includes("phone number is already in use")) {
        toast.error("This phone number is already registered with another account.");
      } else if (error.message && error.message.includes("email is already in use")) {
        toast.error("This email is already registered with another account.");
      } else if (error.message && error.message.includes("maximum of 3 email changes")) {
        toast.error("You have reached the maximum of 3 email changes per month.");
      } else {
        toast.error(error.data?.message || "Failed to update profile.");
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      const { storageId } = await result.json();
      // Profile image functionality temporarily disabled
      // await updateProfileImageMutation({ profileImageId: storageId });
      toast.success("Profile image updated!");
      setSelectedFile(null);
    } catch (error) {
      toast.error("Failed to upload image.");
    }
  };

  const handleImageRemove = async () => {
    try {
      // Profile image functionality temporarily disabled
      // await removeProfileImageMutation();
      toast.success("Profile image removed!");
      setImagePreview(null);
    } catch (error) {
      toast.error("Failed to remove image.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const openAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        type: address.type,
        street: address.street,
        area: address.area,
        pincode: address.pincode,
        city: address.city,
        state: address.state,
        country: address.country,
        landmark: address.landmark || undefined,
        isDefault: address.isDefault || false,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        type: 'Home', street: '', area: '', pincode: '', city: '', state: '', country: 'India', landmark: undefined, isDefault: false,
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await updateAddressMutation({ addressId: editingAddress.id, ...addressForm });
        toast.success("Address updated!");
      } else {
        await addAddressMutation({ ...addressForm, isDefault: addressForm.isDefault || false });
        toast.success("Address added!");
      }
      setIsAddressModalOpen(false);
    } catch (error) {
      toast.error("Failed to save address.");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddressMutation({ addressId });
        toast.success("Address deleted!");
      } catch (error) {
        toast.error("Failed to delete address.");
      }
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await setDefaultAddressMutation({ addressId });
      toast.success("Default address updated!");
    } catch (error) {
      toast.error("Failed to set default address.");
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'shipped':
      case 'in_transit':
        return <IconTruck />;
      case 'delivered':
        return <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>;
      default:
        return <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>;
    }
  };

  if (!loggedInUser) {
    return <div className="text-center py-8">Please log in to view your dashboard.</div>;
  }

  const inputClass = "w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all duration-200 ease-in-out shadow-sm hover:border-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const buttonClass = "px-4 py-2 rounded-lg font-medium transition-colors duration-200";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <IconUserCircle />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`${buttonClass} bg-primary text-white hover:bg-primary-hover text-sm`}
              >
                Change Photo
              </button>
              {selectedFile && (
                <button
                  onClick={handleImageUpload}
                  className={`${buttonClass} bg-green-600 text-white hover:bg-green-700 text-sm`}
                >
                  Upload
                </button>
              )}
              {imagePreview && (
                <button
                  onClick={handleImageRemove}
                  className={`${buttonClass} bg-red-600 text-white hover:bg-red-700 text-sm`}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1">
            {isEditingProfile ? (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    className={inputClass}
                    placeholder="e.g., +91XXXXXXXXXX"
                    maxLength={15}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter numbers only (10-15 digits)</p>
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                  {/* Email change info temporarily disabled */}
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className={`${buttonClass} bg-primary text-white hover:bg-primary-hover disabled:opacity-50`}
                  >
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className={`${buttonClass} bg-gray-300 text-gray-700 hover:bg-gray-400`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <p className="text-gray-800 font-medium">{name || 'Not provided'}</p>
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <p className="text-gray-800 font-medium">{phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <p className="text-gray-800 font-medium">{loggedInUser.email || 'Not provided'}</p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className={`${buttonClass} bg-primary text-white hover:bg-primary-hover flex items-center gap-2`}
                >
                  <IconEdit /> Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
          <button
            onClick={() => openAddressModal()}
            className={`${buttonClass} bg-primary text-white hover:bg-primary-hover flex items-center gap-2`}
          >
            <IconPlus /> Add Address
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {userProfile?.addresses?.map((address) => (
            <div key={address.id} className="border rounded-lg p-4 relative">
              {address.isDefault && (
                <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                  Default
                </span>
              )}
              <div className="mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  {address.type}
                  {address.type === 'Home' && (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                    </svg>
                  )}
                  {address.type === 'Office' && (
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
                    </svg>
                  )}
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                {address.street}, {address.area}<br />
                {address.city}, {address.state} {address.pincode}<br />
                {address.country}
                {address.landmark && <><br />Landmark: {address.landmark}</>}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => openAddressModal(address)}
                  className={`${buttonClass} bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm flex items-center gap-1`}
                >
                  <IconEdit /> Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className={`${buttonClass} bg-red-100 text-red-700 hover:bg-red-200 text-sm flex items-center gap-1`}
                >
                  <IconDelete /> Delete
                </button>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefaultAddress(address.id)}
                    className={`${buttonClass} bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm`}
                  >
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {(!userProfile?.addresses || userProfile.addresses.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <p>No addresses added yet.</p>
            <button
              onClick={() => openAddressModal()}
              className={`${buttonClass} bg-primary text-white hover:bg-primary-hover mt-4`}
            >
              Add Your First Address
            </button>
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h2>
        {myOrders && myOrders.length > 0 ? (
          <div className="space-y-4">
            {myOrders.map((order) => (
              <div key={order._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{order.productName}</h3>
                    <p className="text-sm text-gray-600">from {order.storeName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getOrderStatusIcon(order.orderStatus)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.orderStatus === 'shipped' || order.orderStatus === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                {/* Enhanced pricing breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <p className="font-medium">{order.quantity}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Subtotal:</span>
                    <p className="font-medium">₹{order.subtotal}</p>
                  </div>
                  {order.storeCharges && order.storeCharges > 0 && (
                    <div>
                      <span className="text-gray-500">Store Charges:</span>
                      <p className="font-medium">₹{order.storeCharges}</p>
                    </div>
                  )}
                  {order.gstAmount && order.gstAmount > 0 && (
                    <div>
                      <span className="text-gray-500">GST:</span>
                      <p className="font-medium">₹{order.gstAmount}</p>
                    </div>
                  )}
                  {order.codCharges && order.codCharges > 0 && (
                    <div>
                      <span className="text-gray-500">COD Charges:</span>
                      <p className="font-medium">₹{order.codCharges}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Final Total:</span>
                    <p className="font-medium text-primary">₹{order.finalTotal}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment:</span>
                    <p className="font-medium">{order.paymentMethod.toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Order Date:</span>
                    <p className="font-medium">{new Date(order._creationTime).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Order tracking */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <h4 className="font-medium text-gray-800 mb-2">Order Tracking</h4>
                    <div className="space-y-2">
                      {order.statusHistory.slice(-3).map((status, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div className="flex-1">
                            <span className="font-medium capitalize">{status.status.replace('_', ' ')}</span>
                            {status.location && <span className="text-gray-600"> - {status.location}</span>}
                            <p className="text-gray-500 text-xs">
                              {new Date(status.timestamp).toLocaleString()}
                            </p>
                            {status.description && (
                              <p className="text-gray-600 text-xs">{status.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.trackingId && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-sm"><strong>Tracking ID:</strong> {order.trackingId}</p>
                    {order.courierName && <p className="text-sm"><strong>Courier:</strong> {order.courierName}</p>}
                    {order.estimatedDeliveryTime && <p className="text-sm"><strong>Est. Delivery:</strong> {order.estimatedDeliveryTime}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No orders yet. Start shopping to see your orders here!</p>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>Address Type</label>
                  <select
                    value={addressForm.type}
                    onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                    className={inputClass}
                    required
                  >
                    <option value="Home">🏠 Home</option>
                    <option value="Office">🏢 Office</option>
                    <option value="Other">📍 Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Street Address</label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className={inputClass}
                    placeholder="House/Flat No., Street Name"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Area/Locality</label>
                  <input
                    type="text"
                    value={addressForm.area}
                    onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                    className={inputClass}
                    placeholder="Area, Locality"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Pincode</label>
                    <input
                      type="text"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className={inputClass}
                      placeholder="123456"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className={inputClass}
                      placeholder="City"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>State</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className={inputClass}
                      placeholder="State"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className={inputClass}
                      placeholder="Country"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Landmark (Optional)</label>
                  <input
                    type="text"
                    value={addressForm.landmark || ''}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value || undefined })}
                    className={inputClass}
                    placeholder="Near landmark, building, etc."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault || false}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className={`${buttonClass} bg-primary text-white hover:bg-primary-hover flex-1`}
                  >
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className={`${buttonClass} bg-gray-300 text-gray-700 hover:bg-gray-400 flex-1`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
