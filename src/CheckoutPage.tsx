import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { toast } from 'sonner';
import OrderSuccessAnimation from './OrderSuccessAnimation';

interface CheckoutPageProps {
  productId: Id<"products">;
  quantity: number;
  onClose: () => void;
  onOrderSuccess: () => void;
}

export default function CheckoutPage({ productId, quantity, onClose, onOrderSuccess }: CheckoutPageProps) {
  const product = useQuery(api.products.getProductById, { productId });
  const store = product ? useQuery(api.stores.getStoreById, { storeId: product.storeId }) : undefined;
  const userProfile = useQuery(api.users.getUserProfile);
  const createOrderMutation = useMutation(api.orders.createOrder);

  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (userProfile?.addresses && userProfile.addresses.length > 0) {
      const defaultAddress = userProfile.addresses.find(addr => addr.isDefault) || userProfile.addresses[0];
      setSelectedAddress(defaultAddress);
    }
  }, [userProfile]);

  if (!product || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  // Calculate pricing
  const subtotal = product.price * quantity;
  const storeCharges = store.storeCharges || 0;
  const gstAmount = store.gstApplicable ? (subtotal * (store.gstPercentage || 18)) / 100 : 0;
  const codCharges = paymentMethod === 'cod' ? (store.codCharges || 0) : 0;
  const finalTotal = subtotal + storeCharges + gstAmount + codCharges;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      const result = await createOrderMutation({
        productId,
        quantity,
        shippingAddress: selectedAddress,
        paymentMethod,
      });

      if (result.success) {
        // Set order details for animation
        setOrderDetails({
          orderId: result.orderId.slice(-8).toUpperCase(),
          productName: product.productName,
          totalAmount: finalTotal
        });
        
        // Show success animation
        setShowSuccessAnimation(true);
        
        toast.success("Order placed successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
      setIsPlacingOrder(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccessAnimation(false);
    setIsPlacingOrder(false);
    onOrderSuccess();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Product
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Order Details & Address */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Details */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="flex items-center space-x-4">
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0].storageId}
                      alt={product.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{product.productName}</h3>
                    <p className="text-gray-600">Sold by: {store.storeName}</p>
                    <p className="text-gray-600">Quantity: {quantity}</p>
                    <p className="font-semibold text-primary">₹{product.price.toLocaleString()} each</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
                {userProfile?.addresses && userProfile.addresses.length > 0 ? (
                  <div className="space-y-3">
                    {userProfile.addresses.map((address, index) => (
                      <div
                        key={address.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddress?.id === address.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{address.type}</p>
                            <p className="text-gray-600 text-sm">
                              {address.street}, {address.area}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            {address.landmark && (
                              <p className="text-gray-500 text-sm">Landmark: {address.landmark}</p>
                            )}
                          </div>
                          <input
                            type="radio"
                            checked={selectedAddress?.id === address.id}
                            onChange={() => setSelectedAddress(address)}
                            className="text-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No addresses found. Please add an address in your profile.</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {store.codAvailable && (
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'cod'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Cash on Delivery</p>
                          <p className="text-gray-600 text-sm">Pay when you receive your order</p>
                          {codCharges > 0 && (
                            <p className="text-orange-600 text-sm">Additional charges: ₹{codCharges}</p>
                          )}
                        </div>
                        <input
                          type="radio"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="text-primary"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'online'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('online')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Online Payment</p>
                        <p className="text-gray-600 text-sm">UPI, Cards, Net Banking</p>
                        <p className="text-green-600 text-sm">No additional charges</p>
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                        className="text-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Price Breakdown */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                <h2 className="text-xl font-semibold mb-4">Price Details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({quantity} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  {storeCharges > 0 && (
                    <div className="flex justify-between">
                      <span>Store Service Charges</span>
                      <span>₹{storeCharges.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {gstAmount > 0 && (
                    <div className="flex justify-between">
                      <span>GST ({store.gstPercentage || 18}%)</span>
                      <span>₹{gstAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {codCharges > 0 && (
                    <div className="flex justify-between">
                      <span>COD Charges</span>
                      <span>₹{codCharges.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <hr className="my-3" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !selectedAddress}
                  className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  {isPlacingOrder ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Placing Order...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">🛒</span>
                      Place Order
                    </div>
                  )}
                </button>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  <p>🔒 Your payment information is secure</p>
                  <p>📞 Need help? Call 1800-123-4567</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      <OrderSuccessAnimation
        isVisible={showSuccessAnimation}
        onComplete={handleAnimationComplete}
        orderDetails={orderDetails}
      />
    </>
  );
}
