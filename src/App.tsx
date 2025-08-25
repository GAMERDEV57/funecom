import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { EnhancedSignInForm } from "./EnhancedSignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { useState, ReactNode, useEffect } from "react"; 
import Marketplace from "./Marketplace";
import CreateStoreForm from "./CreateStoreForm";
import StoreDashboard from "./StoreDashboard";
import UserDashboard from "./UserDashboard"; 
import CompleteProfileForm from "./CompleteProfileForm"; 
import CheckoutPage from "./CheckoutPage";
import ProductDetailPage from "./ProductDetailPage";
import HelpSection from "./HelpSection";
import { Id, Doc } from "../convex/_generated/dataModel";

// Define view states
export type View = "marketplace" | "createStore" | "storeDashboard" | "userDashboard" | "checkout" | "productDetail" | "help";
export type SetViewFn = (view: View, productId?: Id<"products">, quantity?: number) => void;

// Simple SVG Icon Components
const IconMarketplace = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h2.64m-13.5 0L12 14.25" />
  </svg>
);

const IconStore = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V3m0 0l-3.75 3.75M12 3v18m0-18l3.75 3.75m-7.5 12.75h15m-15 0A2.25 2.25 0 013 18V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75V18a2.25 2.25 0 01-2.25 2.25h-15z" />
  </svg>
);

const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const IconHelp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c0-1.037.84-1.878 1.878-1.878s1.878.84 1.878 1.878c0 .654-.421 1.207-1.005 1.405A1.5 1.5 0 0111.25 10.5v1.25m0 2.25h.007v.008H11.25v-.008zM12 21a9 9 0 100-18 9 9 0 000 18z" />
  </svg>
);

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100"> 
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md h-16 flex justify-between items-center border-b border-gray-200 shadow-sm px-4 md:px-8">
        <div className="flex items-center">
          <img 
            src="https://i.ibb.co/1W3dCXw/1000056576-removebg-preview.png" 
            alt="FunEcom Logo" 
            className="h-12 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center text-sm text-gray-600">
            <span className="mr-4">📞 +91 79752-14527</span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              Zero Platform Fees
            </span>
          </div>
          <SignOutButton /> 
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <Content />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser) as Doc<"users"> | null | undefined;
  const myStore = useQuery(api.users.getMyStore); 

  const [currentView, setCurrentView] = useState<View>("marketplace");
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    productId: Id<"products">;
    quantity: number;
  } | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<Id<"products"> | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (loggedInUser) {
      if (loggedInUser !== null) {
        const nameMissing = !loggedInUser.name || loggedInUser.name.trim() === '';
        const phoneMissing = !loggedInUser.phone || loggedInUser.phone.trim() === '';
        if (nameMissing || phoneMissing) {
          setNeedsProfileCompletion(true);
        } else {
          setNeedsProfileCompletion(false);
        }
      }
    } else if (loggedInUser === null) { 
        setNeedsProfileCompletion(false);
    }
  }, [loggedInUser]);

  const handleSetView: SetViewFn = (view, productId, quantity) => {
    if (isNavigating) return; // Prevent rapid navigation
    
    setIsNavigating(true);
    
    setTimeout(() => {
      if (view === "checkout" && productId && quantity) {
        setCheckoutData({ productId, quantity });
      } else {
        setCheckoutData(null);
      }
      
      if (view === "productDetail" && productId) {
        setSelectedProductId(productId);
      } else {
        setSelectedProductId(null);
      }
      
      setCurrentView(view);
      setIsNavigating(false);
    }, 50);
  };

  const handleProfileCompleted = () => {
    setNeedsProfileCompletion(false); 
  };

  const handleOrderSuccess = () => {
    setCurrentView("userDashboard");
    setCheckoutData(null);
  };

  if (loggedInUser === undefined || myStore === undefined) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-160px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  const commonNavClasses = "flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer";
  const activeNavClasses = "bg-primary text-white shadow-lg hover:bg-primary-hover";
  const inactiveNavClasses = "bg-white text-gray-700 hover:bg-gray-100 hover:text-primary shadow";

  let viewContent: ReactNode = null;
  if (currentView === "marketplace") {
    viewContent = <Marketplace onBuyNow={handleSetView} onViewProduct={handleSetView} />;
  }
  if (currentView === "createStore") {
    if (!myStore) {
      viewContent = <CreateStoreForm onSuccess={() => {
        toast.success("Store created successfully!");
        handleSetView("storeDashboard");
      }} />;
    }
  }
  if (currentView === "storeDashboard") {
    if (myStore) {
      viewContent = <StoreDashboard store={myStore} />;
    }
  }
  if (currentView === "userDashboard") {
    viewContent = <UserDashboard />;
  }
  if (currentView === "checkout" && checkoutData) {
    viewContent = (
      <CheckoutPage
        productId={checkoutData.productId}
        quantity={checkoutData.quantity}
        onClose={() => handleSetView("marketplace")}
        onOrderSuccess={handleOrderSuccess}
      />
    );
  }
  if (currentView === "productDetail" && selectedProductId) {
    viewContent = (
      <ProductDetailPage
        productId={selectedProductId}
        onClose={() => handleSetView("marketplace")}
        onBuyNow={handleSetView}
      />
    );
  }
  if (currentView === "help") {
    viewContent = <HelpSection onClose={() => handleSetView("marketplace")} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-xl shadow-2xl">
            <EnhancedSignInForm />
            <div className="mt-6 text-center">
              <button
                onClick={() => handleSetView("help")}
                className="text-primary hover:underline text-sm"
              >
                Need help? View FAQ & Support
              </button>
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {needsProfileCompletion ? (
          <CompleteProfileForm onProfileCompleted={handleProfileCompleted} />
        ) : (
          <>
            {currentView !== "checkout" && currentView !== "productDetail" && currentView !== "help" && (
              <nav className="bg-white p-3 rounded-xl shadow-lg mb-8 flex flex-wrap gap-3 justify-center sticky top-[calc(4rem+1px)] z-10">
                <button 
                  onClick={() => handleSetView("marketplace")}
                  className={`${commonNavClasses} ${currentView === "marketplace" ? activeNavClasses : inactiveNavClasses}`}
                >
                  <IconMarketplace /> Marketplace
                </button>
                {myStore ? (
                  <button 
                    onClick={() => handleSetView("storeDashboard")}
                    className={`${commonNavClasses} ${currentView === "storeDashboard" ? activeNavClasses : inactiveNavClasses}`}
                  >
                    <IconStore /> My Store Dashboard
                  </button>
                ) : (
                  <button 
                    onClick={() => handleSetView("createStore")}
                    className={`${commonNavClasses} ${currentView === "createStore" ? activeNavClasses : inactiveNavClasses}`}
                  >
                    <IconStore /> Create Your Store
                  </button>
                )}
                <button 
                  onClick={() => handleSetView("userDashboard")}
                  className={`${commonNavClasses} ${currentView === "userDashboard" ? activeNavClasses : inactiveNavClasses}`}
                >
                  <IconUser /> My Orders and Profile
                </button>
                <button 
                  onClick={() => handleSetView("help")}
                  className={`${commonNavClasses} ${(currentView as string) === "help" ? activeNavClasses : inactiveNavClasses}`}
                >
                  <IconHelp /> Help & Support
                </button>
              </nav>
            )}
            {viewContent}
          </>
        )}
      </Authenticated>
    </div>
  );
}
