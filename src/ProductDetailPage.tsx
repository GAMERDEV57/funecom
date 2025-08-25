import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { SetViewFn } from "./App";
import {
  ArrowLeft,
  ShoppingCart,
  Store,
  Star,
  Truck,
  Shield,
  RotateCcw,
  MapPin,
  Clock,
} from "lucide-react";
import PincodeDeliveryChecker from "./PincodeDeliveryChecker";

interface ProductDetailPageProps {
  productId: Id<"products">;
  onClose: () => void;
  onBuyNow: SetViewFn;
}

export default function ProductDetailPage({
  productId,
  onClose,
  onBuyNow,
}: ProductDetailPageProps) {
  const product = useQuery(api.products.getProductById, { productId });
  const store = useQuery(
    api.stores.getStoreById,
    product ? { storeId: product.storeId } : "skip"
  );

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [deliveryEstimate, setDeliveryEstimate] = useState<any>(null);

  if (!product || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  const handleBuyNow = () => {
    onBuyNow("checkout", productId, quantity);
  };

  const handleDeliveryEstimate = (estimate: any) => {
    setDeliveryEstimate(estimate);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Marketplace
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
              {product.images && product.images.length > 0 && product.images[selectedImageIndex]?.url ? (
                <img
                  src={product.images[selectedImageIndex].url!}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center text-gray-500">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                      📦
                    </div>
                    <p>No image available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  image.url && (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index
                          ? "border-primary"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.productName} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.productName}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-gray-600">4.5 (128 reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Store className="w-4 h-4" />
                  <span>Sold by {store.storeName}</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-primary mb-4">
                ₹{product.price.toLocaleString()}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description || product.productDescription ||
                  "No description available for this product."}
              </p>
            </div>

            {/* Stock & Quantity */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(product.stockQuantity, quantity + 1)
                        )
                      }
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= product.stockQuantity}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.stockQuantity} available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stockQuantity === 0}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.stockQuantity === 0 ? "Out of Stock" : "Buy Now"}
                </button>
              </div>
            </div>

            {/* Delivery Checker */}
            <PincodeDeliveryChecker
              storePincode={store.pincode || "110001"}
              onDeliveryEstimate={handleDeliveryEstimate}
            />

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Truck className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Free Delivery</p>
                  <p className="text-xs text-gray-600">
                    On orders above ₹500
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <RotateCcw className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium text-sm">7 Day Return</p>
                  <p className="text-xs text-gray-600">Easy returns</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Shield className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">Secure Payment</p>
                  <p className="text-xs text-gray-600">100% protected</p>
                </div>
              </div>
            </div>
            {/* Store Information */}
<div className="bg-white p-6 rounded-xl shadow-sm">
  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
    <Store className="w-5 h-5 text-primary" />
    Store Information
  </h3>

  <div className="space-y-3">
    <div>
      <p className="font-medium">{store.storeName}</p>
      <p className="text-sm text-gray-600">{store.storeDescription}</p>
    </div>

    <div className="flex items-center gap-2 text-sm text-gray-600">
      <MapPin className="w-4 h-4" />
      <span>Ships from: {store.pincode}</span>
    </div>

    {store.processingTime && (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span>
          Processing time: {store.processingTime} business days
        </span>
      </div>
    )}

    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span>4.8 Store Rating</span>
      </div>
      <span className="text-gray-600">•</span>
      <span className="text-gray-600">98% Positive Reviews</span>
   						 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
