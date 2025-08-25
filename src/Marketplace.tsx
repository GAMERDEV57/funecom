import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Doc, Id } from '../convex/_generated/dataModel';
import { SetViewFn } from './App';

interface MarketplaceProps {
  onBuyNow: SetViewFn;
  onViewProduct: SetViewFn;
}

type ProductWithImages = Doc<"products"> & {
  imageUrls: (string | null)[];
  storeName: string;
};

export default function Marketplace({ onBuyNow, onViewProduct }: MarketplaceProps) {
  const products = useQuery(api.products.getAllPublishedProducts) as ProductWithImages[] | undefined;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set());

  const categories = ['All', 'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Health & Beauty', 'Toys', 'Automotive', 'Food & Beverages', 'Other'];

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || product.productDescription || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleQuantityChange = (productId: string, quantity: number) => {
    const newQuantity = Math.max(1, quantity);
    setQuantities(prev => {
      if (prev[productId] === newQuantity) return prev; // Prevent unnecessary updates
      return { ...prev, [productId]: newQuantity };
    });
  };

  const getQuantity = (productId: string) => quantities[productId] || 1;

  const handleBuyNow = (productId: Id<"products">) => {
    if (processingActions.has(`buy-${productId}`)) return;
    
    setProcessingActions(prev => new Set(prev).add(`buy-${productId}`));
    const quantity = getQuantity(productId);
    
    setTimeout(() => {
      onBuyNow("checkout", productId, quantity);
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`buy-${productId}`);
        return newSet;
      });
    }, 100);
  };

  const handleViewProduct = (productId: Id<"products">) => {
    if (processingActions.has(`view-${productId}`)) return;
    
    setProcessingActions(prev => new Set(prev).add(`view-${productId}`));
    
    setTimeout(() => {
      onViewProduct("productDetail", productId);
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`view-${productId}`);
        return newSet;
      });
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">Marketplace</h1>
        <p className="text-gray-600 text-center mb-8">Discover amazing products from local stores</p>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all duration-200 shadow-sm"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all duration-200 shadow-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Product Image */}
              <div 
                className="relative h-48 bg-gray-100 cursor-pointer"
                onClick={() => handleViewProduct(product._id)}
              >
                {product.imageUrls?.[0] ? (
                  <img
                    src={product.imageUrls[0]}
                    alt={product.productName}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    Only {product.stockQuantity} left
                  </div>
                )}
                {product.stockQuantity === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">Out of Stock</span>
                  </div>
                )}
                {/* View Details Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium shadow-lg">
                      View Details
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 
                    className="font-semibold text-gray-800 text-lg mb-1 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleViewProduct(product._id)}
                  >
                    {product.productName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">by {product.storeName}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description || product.productDescription}</p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                  <span className="text-sm text-gray-500">{product.stockQuantity} in stock</span>
                </div>

                {product.stockQuantity > 0 && (
                  <div className="space-y-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(product._id, getQuantity(product._id) - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50"
                        disabled={getQuantity(product._id) <= 1 || processingActions.has(`buy-${product._id}`)}
                      >
                        -
                      </button>
                      <span className="font-medium text-lg min-w-[2rem] text-center">
                        {getQuantity(product._id)}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(product._id, getQuantity(product._id) + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50"
                        disabled={getQuantity(product._id) >= product.stockQuantity || processingActions.has(`buy-${product._id}`)}
                      >
                        +
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProduct(product._id)}
                        disabled={processingActions.has(`view-${product._id}`)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() => handleBuyNow(product._id)}
                        disabled={processingActions.has(`buy-${product._id}`)}
                        className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-hover transition-colors duration-200 flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
                        </svg>
                        Buy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
