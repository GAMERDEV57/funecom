import React, { useState, useEffect } from 'react';
import { CheckCircle, Package, CreditCard, Truck, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  orderDetails,
}: OrderSuccessAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const steps = [
    { icon: <Package size={56} className="text-blue-500" />, text: 'Processing your order...', duration: 1500 },
    { icon: <CreditCard size={56} className="text-purple-500" />, text: 'Confirming payment...', duration: 1200 },
    { icon: <Truck size={56} className="text-orange-500" />, text: 'Order confirmed!', duration: 1000 },
    { icon: <CheckCircle size={64} className="text-green-500" />, text: 'Success! Order placed successfully', duration: 2000 },
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
          const closeTimeout = setTimeout(() => onComplete(), step.duration);
          timeouts.push(closeTimeout);
        }
      }, totalDelay);
      timeouts.push(timeout);
      totalDelay += step.duration;
    });

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" role="dialog" aria-live="polite">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(80)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 500 + Math.random() * 200, opacity: 1 }}
              transition={{ duration: 2 + Math.random(), ease: 'easeOut', delay: Math.random() * 1 }}
              style={{ left: `${Math.random() * 100}%` }}
            >
              {['🎉', '🎊', '✨', '🌟', '💫', '🎁'][Math.floor(Math.random() * 6)]}
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center relative overflow-hidden shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Step Icon */}
        <motion.div className="mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {steps[currentStep].icon}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Step Text */}
        <motion.h2
          key={currentStep + 'text'}
          className="text-2xl font-bold text-gray-800 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {steps[currentStep].text}
        </motion.h2>

        {/* Order Summary */}
        {currentStep === steps.length - 1 && orderDetails && (
          <motion.div
            className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-purple-200 shadow-lg mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-gray-600 mb-1">Order Details:</p>
            <p className="font-semibold text-gray-800">#{orderDetails.orderId}</p>
            <p className="text-sm text-gray-700">{orderDetails.productName}</p>
            <p className="text-lg font-bold text-green-600">₹{orderDetails.totalAmount.toLocaleString()}</p>
          </motion.div>
        )}

        {/* Actions */}
        {currentStep === steps.length - 1 && (
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
            >
              View My Orders
            </motion.button>
            <motion.button
              onClick={() => alert('Tracking feature coming soon!')}
              className="w-full bg-white border border-gray-300 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
            >
              Track Shipment
            </motion.button>
          </motion.div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-6">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </motion.div>
    </div>
  );
}
