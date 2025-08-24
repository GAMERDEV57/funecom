import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { toast } from 'sonner';
import OrderSuccessAnimation from './OrderSuccessAnimation';
import { ShoppingCart, Home, CreditCard, Truck } from 'lucide-react';

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
      // Remove extra fields from shipping address
      const { id, isDefault, ...cleanAddress } = selectedAddress;
      
      const result = await createOrderMutation({
        productId,
        quantity,
        shippingAddress: cleanAddress,
        paymentMethod,
      });

      if (result.success) {
        setOrderDetails({
          orderId: result.orderId.slice(-8).toUpperCase(),
          productName: product.productName,
          totalAmount: finalTotal
        });
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
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-extrabold text-gray-900">Checkout</h1>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-lg"
            >
              ← Back to Product
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Product Summary */}
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="flex items-center space-x-5">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0].storageId}
                      alt={product.productName}
                      className="w-28 h-28 object-cover rounded-xl shadow"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.productName}</h3>
                    <p className="text-gray-600">Sold by: {store.storeName}</p>
                    <p className="text-gray-600">Quantity: {quantity}</p>
                    <p className="font-bold text-primary text-lg">₹{product.price.toLocaleString()} each</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" /> Delivery Address
                </h2>
                {userProfile?.addresses?.length ? (
                  <div className="space-y-4">
                    {userProfile.addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 border rounded-xl transition cursor-pointer ${
                          selectedAddress?.id === address.id
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{address.type}</p>
                            <p className="text-gray-600 text-sm">
                              {address.street}, {address.area}, {address.city}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {address.state} - {address.pincode}
                            </p>
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
                  <p className="text-gray-500">No addresses found. Add one in your profile.</p>
                )}
              </div>

              {/* Payment */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Payment Method
                </h2>
                <div className="space-y-4">
                  {store.codAvailable && (
                    <div
                      className={`p-4 border rounded-xl cursor-pointer transition ${
                        paymentMethod === 'cod'
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <p className="font-medium">💵 Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when your order arrives</p>
                    </div>
                  )}
                  <div
                    className={`p-4 border rounded-xl cursor-pointer transition ${
                      paymentMethod === 'online'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('online')}
                  >
                    <p className="font-medium">💳 Online Payment</p>
                    <p className="text-sm text-gray-600">UPI, Cards, Net Banking</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Card */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" /> Price Details
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({quantity} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {storeCharges > 0 && (
                    <div className="flex justify-between">
                      <span>Service Charges</span>
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
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !selectedAddress}
                  className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition-transform transform hover:scale-105 active:scale-95"
                >
                  {isPlacingOrder ? "Placing Order..." : "✅ Place Order"}
                </button>

                <p className="mt-4 text-xs text-gray-500 text-center">
                  🔒 Your payment info is secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderSuccessAnimation
        isVisible={showSuccessAnimation}
        onComplete={handleAnimationComplete}
        orderDetails={orderDetails}
      />
    </>
  );
}
