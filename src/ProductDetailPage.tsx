import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { SetViewFn } from './App';

interface ProductDetailPageProps {
  productId: Id<"products">;
  onClose: () => void;
  onBuyNow: SetViewFn;
}

export default function ProductDetailPage({ productId, onClose, onBuyNow }: ProductDetailPageProps) {
  const product = useQuery(api.products.getProductById, { productId });
  const store = useQuery(
    api.stores.getStoreById, 
    product ? { storeId: product.storeId } : "skip"
  );

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<{
    estimatedDays: number;
    courierName: string;
  } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate delivery estimation based on pincode with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
        // Simulate delivery estimation logic
        const baseDeliveryDays = 5; // Minimum 5 days as requested
        const additionalDays = Math.floor(Math.random() * 3); // 0-2 additional days
        const estimatedDays = baseDeliveryDays + additionalDays;
        
        setDeliveryInfo({
          estimatedDays,
          courierName: "Express Delivery" // Default courier name
        });
      } else {
        setDeliveryInfo(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [pincode]);

  const handleQuantityChange = (newQuantity: number) => {
    if (product) {
      setQuantity(Math.max(1, Math.min(newQuantity, product.stockQuantity)));
    }
  };

  const handleBuyNow = () => {
    // Prevent multiple rapid clicks
    if (isProcessing) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      onBuyNow("checkout", productId, quantity);
      setIsProcessing(false);
    }, 100);
  };

  if (!product || !store) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4">Loading product details...</p>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImageIndex];

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <button
          onClick={onClose}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marketplace
        </button>
        <h1 className="text-lg font-semibold text-gray-800 truncate mx-4">{product.productName}</h1>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
              {currentImage?.url ? (
                <div className="relative h-full">
                  <img
                    src={currentImage.url}
                    alt={product.productName}
                    className={`w-full h-full object-cover cursor-zoom-in transition-transform duration-300 ${
                      isZoomed ? 'scale-150' : 'scale-100'
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                  {isZoomed && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      Click to zoom out
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={`${product.productName} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Product Title & Store */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.productName}</h1>
              <p className="text-lg text-gray-600">by <span className="text-primary font-medium">{product.storeName}</span></p>
              {product.brand && (
                <p className="text-sm text-gray-500 mt-1">Brand: {product.brand}</p>
              )}
            </div>

            {/* Price */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                <span className="text-lg text-gray-500">per item</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Inclusive of all taxes</p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stockQuantity > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">In Stock</span>
                  <span className="text-gray-500">({product.stockQuantity} available)</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Delivery Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Delivery Information</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter Pincode for delivery estimate
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit pincode"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    maxLength={6}
                  />
                </div>
                
                {deliveryInfo && (
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Delivery Available</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Estimated delivery in <strong>{deliveryInfo.estimatedDays} days</strong>
                    </p>
                    <p className="text-sm text-gray-500">
                      via {deliveryInfo.courierName}
                    </p>
                  </div>
                )}
                
                {pincode.length === 6 && !/^\d{6}$/.test(pincode) && (
                  <p className="text-sm text-red-600">Please enter a valid 6-digit pincode</p>
                )}
              </div>
            </div>

            {/* Quantity & Buy Now */}
            {product.stockQuantity > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="font-medium text-xl min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stockQuantity}
                      className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Total Price ({quantity} items):</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{(product.price * quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBuyNow}
                    disabled={isProcessing}
                    className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
                      </svg>
                    )}
                    {isProcessing ? "Processing..." : "Buy Now"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-12 space-y-8">
          {/* Product Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {product.productDescription}
              </p>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Specifications</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="text-gray-600">{product.category}</span>
                </div>
                {product.subCategory && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Sub Category:</span>
                    <span className="text-gray-600">{product.subCategory}</span>
                  </div>
                )}
                {product.brand && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Brand:</span>
                    <span className="text-gray-600">{product.brand}</span>
                  </div>
                )}
                {product.sku && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">SKU:</span>
                    <span className="text-gray-600">{product.sku}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {product.weight && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Weight:</span>
                    <span className="text-gray-600">{product.weight} kg</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Dimensions:</span>
                    <span className="text-gray-600">
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Stock:</span>
                  <span className="text-gray-600">{product.stockQuantity} units</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Features */}
          {product.tags && product.tags.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Features</h2>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Product Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Variants</h2>
              <div className="space-y-4">
                {product.variants.map((variant, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-gray-800 mb-2">{variant.name}:</h3>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((option, optionIndex) => (
                        <span
                          key={optionIndex}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Store Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Store Information</h2>
            <div className="flex items-start gap-4">
              {store.logoUrl && (
                <img
                  src={store.logoUrl}
                  alt={store.storeName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800">{store.storeName}</h3>
                <p className="text-gray-600 mt-1">{store.storeDescription}</p>
                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  <p><strong>Owner:</strong> {store.ownerName}</p>
                  <p><strong>Contact:</strong> {store.ownerEmail}</p>
                  <p><strong>Phone:</strong> {store.ownerPhone}</p>
                  <p><strong>Hours:</strong> {store.openingHours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
