import React, { useState, FormEvent, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id, Doc } from '../convex/_generated/dataModel';
import { toast } from 'sonner';

interface AddProductFormProps {
  storeId: Id<'stores'>;
  onProductAdded: () => void;
}

type ImageUpload = {
  file: File;
  previewUrl: string;
  isPrimary: boolean;
  storageId?: Id<"_storage">; // Will be populated after upload
};

export default function AddProductForm({ storeId, onProductAdded }: AddProductFormProps) {
  const addProductMutation = useMutation(api.products.addProduct);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState(''); // Corrected
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  
  const [images, setImages] = useState<ImageUpload[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [variants, setVariants] = useState<{ name: string; options: string[] }[]>([]);
  const [currentVariantName, setCurrentVariantName] = useState('');
  const [currentVariantOptions, setCurrentVariantOptions] = useState('');

  const [sku, setSku] = useState('');
  const [tags, setTags] = useState(''); // Comma-separated
  const [weight, setWeight] = useState(''); // in grams
  const [length, setLength] = useState(''); // in cm
  const [width, setWidth] = useState('');   // in cm
  const [height, setHeight] = useState(''); // in cm
  const [isPublished, setIsPublished] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newImages = Array.from(event.target.files).map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
        isPrimary: images.length === 0 && !images.some(img => img.isPrimary), // Make first image primary by default
      }));
      setImages(prev => [...prev, ...newImages]);
      if (imageInputRef.current) imageInputRef.current.value = ""; // Reset file input
    }
  };

  const removeImage = (index: number) => {
    const removedImage = images[index];
    const newImages = images.filter((_, i) => i !== index);
    // If the removed image was primary and there are other images, make the new first one primary
    if (removedImage.isPrimary && newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    setImages(newImages);
  };

  const setPrimaryImage = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const handleAddVariant = () => {
    if (currentVariantName.trim() && currentVariantOptions.trim()) {
      setVariants([...variants, { name: currentVariantName.trim(), options: currentVariantOptions.split(',').map(opt => opt.trim()) }]);
      setCurrentVariantName('');
      setCurrentVariantOptions('');
    } else {
      toast.error("Variant name and options cannot be empty.");
    }
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Please upload at least one image for the product.");
      return;
    }
    if (!images.some(img => img.isPrimary) && images.length > 0) {
        images[0].isPrimary = true; // Ensure at least one image is primary
    }

    setIsLoading(true);
    try {
      const uploadedImageObjects: { storageId: Id<"_storage">; isPrimary: boolean }[] = [];

      for (const img of images) {
        if (img.storageId) { // Already uploaded (e.g. if editing was implemented)
            uploadedImageObjects.push({ storageId: img.storageId, isPrimary: img.isPrimary });
            continue;
        }
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": img.file.type },
          body: img.file,
        });
        const json = await result.json();
        if (!result.ok) throw new Error(`Upload failed for ${img.file.name}: ${JSON.stringify(json)}`);
        uploadedImageObjects.push({ storageId: json.storageId, isPrimary: img.isPrimary });
      }

      await addProductMutation({
        storeId,
        productName,
        productDescription, // Corrected
        category,
        subCategory: subCategory || undefined,
        brand: brand || undefined,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity, 10),
        images: uploadedImageObjects,
        variants: variants.length > 0 ? variants : undefined,
        sku: sku || undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag) || undefined,
        weight: weight ? parseFloat(weight) : undefined,
        dimensions: length && width && height ? { length: parseFloat(length), width: parseFloat(width), height: parseFloat(height) } : undefined,
        isPublished,
      });
      toast.success("Product added successfully!");
      onProductAdded(); // Callback to switch view or refresh list
    } catch (error: any) {
      console.error("Failed to add product:", error);
      toast.error(error.data?.message || error.message || "Failed to add product.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all duration-200 ease-in-out shadow-sm hover:border-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const buttonClass = "px-4 py-2 text-sm rounded-md transition-colors";

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold text-center text-primary mb-8">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        
        {/* Product Information */}
        <section className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-6">Product Details</h3>
          <div>
            <label htmlFor="productName" className={labelClass}>Product Name</label>
            <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="productDescription" className={labelClass}>Product Description</label>
            <textarea id="productDescription" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required className={`${inputClass} h-32 resize-none`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className={labelClass}>Category</label>
              <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className={inputClass} placeholder="e.g., Electronics, Clothing" />
            </div>
            <div>
              <label htmlFor="subCategory" className={labelClass}>Sub-Category (Optional)</label>
              <input type="text" id="subCategory" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={inputClass} placeholder="e.g., Smartphones, T-Shirts" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="price" className={labelClass}>Price (INR)</label>
              <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputClass} step="0.01" min="0" />
            </div>
            <div>
              <label htmlFor="stockQuantity" className={labelClass}>Stock Quantity</label>
              <input type="number" id="stockQuantity" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} required className={inputClass} step="1" min="0" />
            </div>
            <div>
              <label htmlFor="brand" className={labelClass}>Brand (Optional)</label>
              <input type="text" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        {/* Product Images */}
        <section className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Product Images</h3>
            <div>
                <label htmlFor="productImages" className={labelClass}>Upload Images</label>
                <input 
                    type="file" 
                    id="productImages" 
                    multiple 
                    accept="image/*" 
                    ref={imageInputRef}
                    onChange={handleImageChange} 
                    className={`${inputClass} p-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20`}
                />
            </div>
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {images.map((img, index) => (
                        <div key={index} className={`relative border-2 rounded-lg overflow-hidden group ${img.isPrimary ? 'border-primary shadow-lg' : 'border-gray-200'}`}>
                            <img src={img.previewUrl} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                <button type="button" onClick={() => setPrimaryImage(index)} disabled={img.isPrimary} className={`${buttonClass} bg-primary/80 text-white text-xs disabled:bg-gray-400/70 hover:bg-primary`}>Primary</button>
                                <button type="button" onClick={() => removeImage(index)} className={`${buttonClass} bg-red-500/80 text-white text-xs hover:bg-red-600`}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>

        {/* Product Variants */}
        <section className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Product Variants (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                    <label htmlFor="variantName" className={labelClass}>Variant Name</label>
                    <input type="text" id="variantName" value={currentVariantName} onChange={(e) => setCurrentVariantName(e.target.value)} className={inputClass} placeholder="e.g., Color, Size" />
                </div>
                <div className="md:col-span-1">
                    <label htmlFor="variantOptions" className={labelClass}>Options (comma-separated)</label>
                    <input type="text" id="variantOptions" value={currentVariantOptions} onChange={(e) => setCurrentVariantOptions(e.target.value)} className={inputClass} placeholder="e.g., Red,Blue or S,M,L" />
                </div>
                <button type="button" onClick={handleAddVariant} className={`${buttonClass} bg-green-500 text-white hover:bg-green-600 h-12`}>Add Variant</button>
            </div>
            {variants.length > 0 && (
                <div className="mt-4 space-y-2">
                    {variants.map((variant, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                            <div>
                                <span className="font-medium text-gray-800">{variant.name}: </span>
                                <span className="text-gray-600">{variant.options.join(', ')}</span>
                            </div>
                            <button type="button" onClick={() => removeVariant(index)} className={`${buttonClass} bg-red-500 text-white text-xs hover:bg-red-600`}>Remove</button>
                        </div>
                    ))}
                </div>
            )}
        </section>

        {/* Additional Information */}
        <section className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-6">Additional Information (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sku" className={labelClass}>SKU</label>
              <input type="text" id="sku" value={sku} onChange={(e) => setSku(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="tags" className={labelClass}>Tags (comma-separated)</label>
              <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="e.g., eco-friendly, best-seller" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="weight" className={labelClass}>Weight (grams)</label>
              <input type="number" id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} step="any" />
            </div>
            <div>
              <label htmlFor="length" className={labelClass}>Length (cm)</label>
              <input type="number" id="length" value={length} onChange={(e) => setLength(e.target.value)} className={inputClass} step="any" />
            </div>
            <div>
              <label htmlFor="width" className={labelClass}>Width (cm)</label>
              <input type="number" id="width" value={width} onChange={(e) => setWidth(e.target.value)} className={inputClass} step="any" />
            </div>
            <div>
              <label htmlFor="height" className={labelClass}>Height (cm)</label>
              <input type="number" id="height" value={height} onChange={(e) => setHeight(e.target.value)} className={inputClass} step="any" />
            </div>
          </div>
        </section>

        {/* Publishing Status */}
        <section>
            <div className="flex items-center">
                <input 
                    type="checkbox" 
                    id="isPublished" 
                    checked={isPublished} 
                    onChange={(e) => setIsPublished(e.target.checked)} 
                    className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-offset-1"
                />
                <label htmlFor="isPublished" className="ml-3 text-md font-medium text-gray-800">
                    Publish this product immediately
                </label>
            </div>
            <p className="text-xs text-gray-500 ml-8 mt-1">If unchecked, the product will be saved as a draft.</p>
        </section>

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full auth-button py-3.5 text-base font-semibold mt-6 disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Product...
            </span>
          ) : (
            'Add Product to Store'
          )}
        </button>
      </form>
    </div>
  );
}
