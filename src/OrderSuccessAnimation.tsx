import React, { useState, useEffect } from 'react';

interface OrderSuccessAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
  orderDetails?: {
    orderId: string;
    productName: string;
    totalAmount: number;
  };
}

export default function OrderSuccessAnimation({ 
  isVisible, 
  onComplete, 
  orderDetails 
}: OrderSuccessAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const steps = [
    { icon: '📦', text: 'Processing your order...', duration: 1500 },
    { icon: '💳', text: 'Confirming payment...', duration: 1200 },
    { icon: '✅', text: 'Order confirmed!', duration: 1000 },
    { icon: '🎉', text: 'Success! Order placed successfully', duration: 2000 }
  ];

  useEffect(() => {
    if (!isVisible) return;

    let timeouts: NodeJS.Timeout[] = [];
    let totalDelay = 0;

    steps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setCurrentStep(index);
        if (index === steps.length - 1) {
          setShowConfetti(true);
          // Auto close after showing success
          const closeTimeout = setTimeout(() => {
            onComplete();
          }, step.duration);
          timeouts.push(closeTimeout);
        }
      }, totalDelay);
      
      timeouts.push(timeout);
      totalDelay += step.duration;
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
        
        {/* Pulsing Ring Animation */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-32 rounded-full border-4 border-primary opacity-20 animate-ping"></div>
          <div className="w-24 h-24 rounded-full border-4 border-primary opacity-40 animate-ping animation-delay-200"></div>
          <div className="w-16 h-16 rounded-full border-4 border-primary opacity-60 animate-ping animation-delay-400"></div>
        </div>

        <div className="relative z-10">
          {/* Main Icon with Bounce Animation */}
          <div className="mb-6">
            <div className="text-8xl animate-bounce mb-4">
              {steps[currentStep]?.icon}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Text with Fade Animation */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-fadeIn">
              {steps[currentStep]?.text}
            </h2>
            
            {currentStep === steps.length - 1 && orderDetails && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 animate-slideIn">
                <p className="text-sm text-gray-600 mb-2">Order Details:</p>
                <p className="font-semibold text-gray-800">#{orderDetails.orderId}</p>
                <p className="text-sm text-gray-600">{orderDetails.productName}</p>
                <p className="text-lg font-bold text-green-600">₹{orderDetails.totalAmount.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Loading Dots Animation */}
          {currentStep < steps.length - 1 && (
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          )}

          {/* Success Actions */}
          {currentStep === steps.length - 1 && (
            <div className="mt-6 space-y-3 animate-fadeIn">
              <button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
              >
                View My Orders
              </button>
              <p className="text-xs text-gray-500">
                You'll receive order updates via email and SMS
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
