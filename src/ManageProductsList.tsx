import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id, Doc } from '../convex/_generated/dataModel';
import { toast } from 'sonner';

interface ManageProductsListProps {
  storeId: Id<'stores'>;
}

// Simplified ProductImage type
type ProductImage = {
  storageId: Id<"_storage">;
  isPrimary?: boolean | null;
  url: string | null;
};

// Explicitly define ProductDocWithImages to avoid issues with Omit
type ProductDocWithImages = {
  _id: Id<"products">;
  _creationTime: number;
  storeId: Id<"stores">;
  productName: string;
  productDescription: string;
  category: string;
  subCategory?: string | null | undefined;
  brand?: string | null | undefined;
  price: number;
  stockQuantity: number;
  images: ProductImage[]; // Use the enhanced image type
  variants?: { name: string; options: string[] }[] | null | undefined;
  sku?: string | null | undefined;
  tags?: string[] | null | undefined;
  weight?: number | null | undefined;
  dimensions?: { length: number; width: number; height: number } | null | undefined;
  isPublished: boolean;
};

const EditProductModal = ({ 
    product, 
    isOpen, 
    onClose, 
    onProductUpdated 
}: { 
    product: ProductDocWithImages; 
    isOpen: boolean; 
    onClose: () => void;
    onProductUpdated: () => void;
}) => {
  const updateProductMutation = useMutation(api.products.updateProduct);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [productName, setProductName] = useState(product.productName);
  const [productDescription, setProductDescription] = useState(product.productDescription); 
  const [category, setCategory] = useState(product.category);
  const [price, setPrice] = useState(product.price.toString());
  const [stockQuantity, setStockQuantity] = useState(product.stockQuantity.toString());
  const [isPublished, setIsPublished] = useState(product.isPublished);
  
  const [newImages, setNewImages] = useState<File[]>([]);
  const [currentImagePreviews, setCurrentImagePreviews] = useState<ProductImage[]>(product.images || []);
  const newImageInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setProductName(product.productName);
    setProductDescription(product.productDescription); 
    setCategory(product.category);
    setPrice(product.price.toString());
    setStockQuantity(product.stockQuantity.toString());
    setIsPublished(product.isPublished);
    setCurrentImagePreviews(product.images || []);
    setNewImages([]); 
  }, [product]);

  const handleNewImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setNewImages(filesArray);
      setCurrentImagePreviews(filesArray.map(file => ({
          storageId: "preview" as any, // Placeholder for preview
          isPrimary: false, 
          url: URL.createObjectURL(file),
      } as ProductImage))); 
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let uploadedImageObjects: { storageId: Id<"_storage">; isPrimary: boolean }[] | undefined = undefined;

    if (newImages.length > 0) {
        uploadedImageObjects = [];
        for (let i = 0; i < newImages.length; i++) {
            const file = newImages[i];
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const json = await result.json();
            if (!result.ok) {
                toast.error(`Upload failed for ${file.name}: ${JSON.stringify(json)}`);
                setIsLoading(false);
                return;
            }
            uploadedImageObjects.push({ storageId: json.storageId, isPrimary: i === 0 }); 
        }
    }

    try {
      await updateProductMutation({
        productId: product._id,
        productName,
        productDescription, 
        category,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity, 10),
        isPublished,
        images: uploadedImageObjects, 
      });
      toast.success("Product updated successfully!");
      onProductUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update product.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  const inputClass = "w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-primary mb-4">Edit Product: {product.productName}</h3>
        <form onSubmit={handleSaveChanges} className="space-y-4">
          <div>
            <label htmlFor="editProductName" className={labelClass}>Product Name</label>
            <input type="text" id="editProductName" value={productName} onChange={(e) => setProductName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="editProductDescription" className={labelClass}>Description</label>
            <textarea id="editProductDescription" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} className={`${inputClass} h-24`} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="editCategory" className={labelClass}>Category</label>
              <input type="text" id="editCategory" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="editPrice" className={labelClass}>Price (INR)</label>
              <input type="number" id="editPrice" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} required step="0.01" />
            </div>
          </div>
          <div>
            <label htmlFor="editStock" className={labelClass}>Stock Quantity</label>
            <input type="number" id="editStock" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} className={inputClass} required step="1" />
          </div>
          
          <div>
            <label className={labelClass}>Product Images</label>
            <p className="text-xs text-gray-500 mb-1">Current images will be replaced if you upload new ones.</p>
            <input 
                type="file" 
                multiple 
                accept="image/*" 
                ref={newImageInputRef}
                onChange={handleNewImageChange} 
                className={`${inputClass} p-2 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20`}
            />
            {currentImagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {currentImagePreviews.map((img, index) => (
                        img.url && <div key={img.storageId?.toString() || `preview-${index}`} className="border rounded overflow-hidden">
                            <img src={img.url} alt="Preview" className="w-full h-20 object-cover" />
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div className="flex items-center mt-2">
            <input type="checkbox" id="editIsPublished" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
            <label htmlFor="editIsPublished" className="ml-2 text-sm text-gray-700">Published</label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-60">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default function ManageProductsList({ storeId }: ManageProductsListProps) {
  const productsData = useQuery(api.products.getAllStoreProductsForManagement, { storeId });
  const products = productsData as ProductDocWithImages[] | undefined || [];
  const deleteProductMutation = useMutation(api.products.deleteProduct);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDocWithImages | null>(null);

  const handleDelete = async (productId: Id<'products'>) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        await deleteProductMutation({ productId });
        toast.success("Product deleted successfully.");
      } catch (error: any) {
        toast.error(error.data?.message || "Failed to delete product.");
      }
    }
  };

  const openEditModal = (product: ProductDocWithImages) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleProductUpdated = () => {
    // The useQuery will automatically refresh the list
  };

  if (productsData === undefined) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center py-10 text-gray-500">You haven't added any products yet.</div>;
  }

  return (
    <div className="space-y-6">
      {products.map((product) => {
        const primaryImage = product.images?.find(img => img.isPrimary && img.url) || product.images?.find(img => !!img.url);
        return (
          <div key={product._id} className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-32 h-32 sm:h-auto flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                {primaryImage?.url ? (
                  <img 
                      src={primaryImage.url} 
                      alt={product.productName} 
                      className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                )}
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-primary mb-1">{product.productName}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.productDescription}</p> 
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
                  <p><strong className="font-medium text-gray-700">Category:</strong> {product.category}</p>
                  <p><strong className="font-medium text-gray-700">Price:</strong> ₹{product.price.toLocaleString()}</p>
                  <p><strong className="font-medium text-gray-700">Stock:</strong> {product.stockQuantity}</p>
                  <p><strong className="font-medium text-gray-700">Status:</strong> 
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${product.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {product.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 pt-2 sm:pt-0 flex-shrink-0">
                <button 
                  onClick={() => openEditModal(product)}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors w-full sm:w-auto"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(product._id)}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
      {selectedProduct && (
        <EditProductModal 
          product={selectedProduct} 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          onProductUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
}
