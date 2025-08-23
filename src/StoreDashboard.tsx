import React, { useState, useRef, useEffect } from 'react';
import { Doc, Id } from '../convex/_generated/dataModel';
import AddProductForm from './AddProductForm';
import ManageProductsList from './ManageProductsList';
import StoreOrdersList from './StoreOrdersList';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { toast } from 'sonner';

// Manually define the combined type to avoid '&'
interface CombinedStoreProps extends Doc<'stores'> {
  logoUrl: string | null;
  bannerUrl: string | null;
}
interface StoreDashboardProps {
  store: CombinedStoreProps;
}

type StoreDashboardView = "manageProducts" | "addProduct" | "orders" | "settings";

// Simple SVG Icon Components
const IconManageProducts = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75V17.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const IconAddProduct = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconViewOrders = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
);

const IconSettings = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.108 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.142.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.78.93l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108 1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.142-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.15-.894z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconImagePlaceholder = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

export default function StoreDashboard({ store: initialStore }: StoreDashboardProps) {
  const [view, setView] = useState<StoreDashboardView>("manageProducts");
  // Use internal state for store data to reflect updates from StoreSettings
  const [currentStore, setCurrentStore] = useState<CombinedStoreProps>(initialStore);
  const myStoreData = useQuery(api.users.getMyStore);

  useEffect(() => {
    if (myStoreData) {
      setCurrentStore(myStoreData as CombinedStoreProps);
    }
  }, [myStoreData]);


  const navButtonBaseClasses = "flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";
  const activeNavButtonClasses = "bg-primary text-white shadow-md hover:bg-primary-hover";
  const inactiveNavButtonClasses = "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900";
  
  let currentViewComponent: React.ReactNode = null;
  if (view === "addProduct") {
    currentViewComponent = <AddProductForm storeId={currentStore._id} onProductAdded={() => setView("manageProducts")} />;
  } else if (view === "manageProducts") {
    currentViewComponent = <ManageProductsList storeId={currentStore._id} />;
  } else if (view === "orders") {
    currentViewComponent = <StoreOrdersList storeId={currentStore._id} />;
  } else if (view === "settings") {
    currentViewComponent = <StoreSettings store={currentStore} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 p-6 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl shadow-xl relative overflow-hidden min-h-[160px] flex items-end">
        {currentStore.bannerUrl && (
          <img 
            src={currentStore.bannerUrl} 
            alt={`${currentStore.storeName} banner`} 
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-10 flex items-center gap-6">
          {currentStore.logoUrl ? (
              <img src={currentStore.logoUrl} alt={`${currentStore.storeName} logo`} className="w-24 h-24 rounded-lg object-cover border-2 border-white shadow-md"/>
          ) : (
              <div className="w-24 h-24 rounded-lg bg-white/20 flex items-center justify-center text-white/50">
                  <IconImagePlaceholder />
              </div>
          )}
          <div>
              <h1 className="text-4xl font-bold mb-1 drop-shadow-md">{currentStore.storeName}</h1>
              <p className="text-lg opacity-90 drop-shadow-sm">{currentStore.storeDescription}</p>
          </div>
        </div>
      </header>

      <nav className="flex space-x-2 md:space-x-4 mb-8 bg-white p-3 rounded-xl shadow-lg justify-center">
        {[
          { key: "manageProducts" as StoreDashboardView, label: "Manage Products", icon: <IconManageProducts /> },
          { key: "addProduct" as StoreDashboardView, label: "Add New Product", icon: <IconAddProduct /> },
          { key: "orders" as StoreDashboardView, label: "View Orders", icon: <IconViewOrders /> },
          { key: "settings" as StoreDashboardView, label: "Store Settings", icon: <IconSettings /> },
        ].map((item) => (
          <button 
            key={item.key}
            onClick={() => setView(item.key)}
            className={`${navButtonBaseClasses} ${view === item.key ? activeNavButtonClasses : inactiveNavButtonClasses}`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      <div className="bg-white p-6 rounded-xl shadow-xl min-h-[400px]">
        {currentViewComponent}
      </div>
    </div>
  );
}


function StoreSettings({ store }: StoreDashboardProps) {
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const updateStoreMutation = useMutation(api.stores.updateStore);

    const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(store.logoUrl);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
    const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(store.bannerUrl);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    useEffect(() => {
        setLogoPreviewUrl(store.logoUrl);
        setBannerPreviewUrl(store.bannerUrl);
    }, [store.logoUrl, store.bannerUrl]);


    const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedLogoFile(file);
            setLogoPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleLogoUpload = async () => {
        if (!selectedLogoFile) {
            toast.error("Please select a logo file first.");
            return;
        }
        setIsUploadingLogo(true);
        try {
            const uploadUrl = await generateUploadUrl();
            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": selectedLogoFile.type },
                body: selectedLogoFile,
            });
            const { storageId } = await response.json();
            if (!response.ok) throw new Error("Logo upload failed");

            await updateStoreMutation({ storeId: store._id, storeLogoId: storageId });
            toast.success("Store logo updated successfully!");
            setSelectedLogoFile(null); 
        } catch (error: any) {
            toast.error(error.data?.message || error.message || "Failed to update logo.");
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleRemoveLogo = async () => {
        if (!store.logoUrl && !logoPreviewUrl) return; // No logo to remove
        setIsUploadingLogo(true);
        try {
            await updateStoreMutation({ storeId: store._id, storeLogoId: undefined });
            toast.success("Store logo removed.");
            setLogoPreviewUrl(null);
            setSelectedLogoFile(null);
            if(logoInputRef.current) logoInputRef.current.value = "";
        } catch (error: any) {
            toast.error(error.data?.message || "Failed to remove logo.");
        } finally {
            setIsUploadingLogo(false);
        }
    }

    const handleBannerFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedBannerFile(file);
            setBannerPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleBannerUpload = async () => {
        if (!selectedBannerFile) {
            toast.error("Please select a banner file first.");
            return;
        }
        setIsUploadingBanner(true);
        try {
            const uploadUrl = await generateUploadUrl();
            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": selectedBannerFile.type },
                body: selectedBannerFile,
            });
            const { storageId } = await response.json();
            if (!response.ok) throw new Error("Banner upload failed");

            await updateStoreMutation({ storeId: store._id, storeBannerId: storageId });
            toast.success("Store banner updated successfully!");
            setSelectedBannerFile(null);
        } catch (error: any) {
            toast.error(error.data?.message || error.message || "Failed to update banner.");
        } finally {
            setIsUploadingBanner(false);
        }
    };

    const handleRemoveBanner = async () => {
        if (!store.bannerUrl && !bannerPreviewUrl) return; // No banner to remove
        setIsUploadingBanner(true);
        try {
            await updateStoreMutation({ storeId: store._id, storeBannerId: undefined });
            toast.success("Store banner removed.");
            setBannerPreviewUrl(null);
            setSelectedBannerFile(null);
            if(bannerInputRef.current) bannerInputRef.current.value = "";
        } catch (error: any) {
            toast.error(error.data?.message || "Failed to remove banner.");
        } finally {
            setIsUploadingBanner(false);
        }
    }

    const inputClass = "w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all duration-200 ease-in-out shadow-sm hover:border-gray-400";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
    const fileInputButtonClass = `${inputClass} p-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20`;
    const actionButtonClass = (color: string) => `mt-2 px-4 py-2 text-sm bg-${color}-500 text-white rounded-md hover:bg-${color}-600 disabled:opacity-70`;


    return (
        <div className="max-w-xl mx-auto py-6">
            <h3 className="text-2xl font-semibold text-primary mb-6">Store Branding</h3>
            
            <div className="space-y-6">
                {/* Store Logo Section */}
                <div>
                    <label className={labelClass}>Store Logo</label>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-md border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
                            {logoPreviewUrl ? (
                                <img src={logoPreviewUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                            ) : (
                                <IconImagePlaceholder />
                            )}
                        </div>
                        <div className="flex-1">
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={logoInputRef} 
                                onChange={handleLogoFileChange} 
                                className={fileInputButtonClass}
                                disabled={isUploadingLogo}
                            />
                            <div className="flex gap-2">
                                {selectedLogoFile && (
                                    <button 
                                        onClick={handleLogoUpload} 
                                        disabled={isUploadingLogo}
                                        className={actionButtonClass("green")}
                                    >
                                        {isUploadingLogo ? "Uploading..." : "Save Logo"}
                                    </button>
                                )}
                                {(logoPreviewUrl || store.logoUrl) && !selectedLogoFile && (
                                    <button 
                                        onClick={handleRemoveLogo} 
                                        disabled={isUploadingLogo}
                                        className={actionButtonClass("red")}
                                    >
                                        {isUploadingLogo ? "Removing..." : "Remove Logo"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store Banner Section */}
                <div>
                    <label className={labelClass}>Store Banner</label>
                    <div className="w-full h-40 rounded-md border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden mb-2">
                        {bannerPreviewUrl ? (
                            <img src={bannerPreviewUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-500">Banner Preview (Recommended: 1200x300px)</span>
                        )}
                    </div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={bannerInputRef} 
                        onChange={handleBannerFileChange} 
                        className={fileInputButtonClass}
                        disabled={isUploadingBanner}
                    />
                    <div className="flex gap-2">
                        {selectedBannerFile && (
                            <button 
                                onClick={handleBannerUpload} 
                                disabled={isUploadingBanner}
                                className={actionButtonClass("green")}
                            >
                                {isUploadingBanner ? "Uploading..." : "Save Banner"}
                            </button>
                        )}
                        {(bannerPreviewUrl || store.bannerUrl) && !selectedBannerFile && (
                             <button 
                                onClick={handleRemoveBanner} 
                                disabled={isUploadingBanner}
                                className={actionButtonClass("red")}
                            >
                                {isUploadingBanner ? "Removing..." : "Remove Banner"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
