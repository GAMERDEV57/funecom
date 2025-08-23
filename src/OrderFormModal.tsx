import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id, Doc } from '../convex/_generated/dataModel';
import { toast } from 'sonner';

type ProductDetails = Doc<"products"> & {
  storeName: string;
};

interface OrderFormModalProps {
  product: ProductDetails;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: () => void;
}

export default function OrderFormModal({ product, isOpen, onClose, onOrderSuccess }: OrderFormModalProps) {
  const placeOrder = useMutation(api.orders.createOrder);
  const currentUser = useQuery(api.auth.loggedInUser); 
  const userProfile = useQuery(
    api.users.getUserProfile, 
    currentUser ? {} : "skip"
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userProfile?.addresses && userProfile.addresses.length > 0) {
      const defaultAddress = userProfile.addresses.find(addr => addr.isDefault) || userProfile.addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [userProfile]);

  if (!isOpen) return null;

  // Helper: remove extra fields from shipping address
  const sanitizeShippingAddress = (address: any) => {
    const { id, isDefault, ...cleanAddress } = address;
    return cleanAddress;
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to place an order.");
      return;
    }
    if (!selectedAddressId) {
      toast.error("Please select a shipping address.");
      return;
    }

    const selectedAddress = userProfile?.addresses?.find(addr => addr.id === selectedAddressId);
    if (!selectedAddress) {
      toast.error("Selected address not found.");
      return;
    }

    setIsLoading(true);
    try {
      await placeOrder({
        productId: product._id,
        quantity,
        shippingAddress: sanitizeShippingAddress(selectedAddress),
        paymentMethod: "COD", 
      });
      toast.success("Order placed successfully!");
      onOrderSuccess(); 
      onClose();
    } catch (error: any) {
      console.error("Failed to place order:", error);
      toast.error(error.data?.message || "Failed to place order.");
    } finally {
      setIsLoading(false);
    }
  };

  const availableStock = product.stockQuantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold text-primary mb-4">Place Order for {product.productName}</h2>
        
        <div className="mb-4">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity:</label>
          <input 
            type="number" 
            id="quantity" 
            value={quantity} 
            onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, availableStock)))} 
            min="1"
            max={availableStock}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-primary focus:border-primary"
            disabled={availableStock === 0}
          />
          {availableStock === 0 && <p className="text-red-500 text-xs mt-1">Out of stock</p>}
          {availableStock > 0 && <p className="text-xs text-gray-500 mt-1">Available: {availableStock}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Shipping Address:</label>
          {userProfile?.addresses && userProfile.addresses.length > 0 ? (
            <select 
              id="address" 
              value={selectedAddressId} 
              onChange={(e) => setSelectedAddressId(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white focus:ring-primary focus:border-primary"
            >
              {userProfile.addresses.map(addr => (
                <option key={addr.id} value={addr.id}>
                  {addr.type} - {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-600">No addresses found. Please add an address in your profile.</p>
          )}
        </div>

        <div className="mb-4">
            <p className="text-lg font-semibold">Total Price: ₹{(product.price * quantity).toLocaleString()}</p>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handlePlaceOrder} 
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-60"
            disabled={isLoading || quantity === 0 || availableStock === 0 || !selectedAddressId}
          >
            {isLoading ? 'Placing Order...' : 'Confirm Order (COD)'}
          </button>
        </div>
      </div>
    </div>
  );
}

