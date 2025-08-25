import React, { useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

interface InvoiceModalProps {
  orderId: Id<"orders">;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceModal({ orderId, isOpen, onClose }: InvoiceModalProps) {
  const invoiceData = useQuery(api.orders.generateInvoice, { orderId });
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // restore React app
    }
  };

  const handleDownloadPDF = () => {
    handlePrint(); // fallback to browser’s print-to-PDF
  };

  if (!isOpen) return null;

  if (!invoiceData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4">Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:static print:p-0">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:max-h-full print:shadow-none print:rounded-none relative">
        
        {/* --- Watermark --- */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none print:opacity-10">
          <h1 className="text-7xl font-extrabold text-gray-400 rotate-[-30deg]">
            FunEcom
          </h1>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 print:hidden relative z-10">
          <h2 className="text-2xl font-bold text-gray-800">Invoice</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div ref={printRef} className="p-8 bg-white text-sm leading-relaxed relative z-10">
          {/* Branding */}
          <div className="border-b-4 border-primary pb-6 mb-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <img
                  src="https://i.ibb.co/1W3dCXw/1000056576-removebg-preview.png"
                  alt="FunEcom Logo"
                  className="h-12 w-auto object-contain print:h-10"
                />
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-1">FunEcom</h1>
                  <p className="text-gray-600 text-base">Your Trusted E-commerce Platform</p>
                  <p className="text-gray-500 text-xs">Connecting Buyers & Sellers Nationwide</p>
                </div>
              </div>
              <div className="text-right text-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-2">INVOICE</h2>
                <div className="bg-primary/10 p-3 rounded-lg inline-block">
                  <p><strong>Invoice #:</strong> {invoiceData.orderId.slice(-8).toUpperCase()}</p>
                  <p><strong>Order Date:</strong> {invoiceData.orderDate}</p>
                  <p><strong>Invoice Date:</strong> {new Date().toLocaleDateString()}</p>
                  <p>
                    <strong>Status:</strong>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      invoiceData.orderStatus === "Delivered" ? "bg-green-100 text-green-700" :
                      invoiceData.orderStatus === "Shipped" ? "bg-blue-100 text-blue-700" :
                      invoiceData.orderStatus === "Processing" ? "bg-yellow-100 text-yellow-700" :
                      invoiceData.orderStatus === "Pending" ? "bg-orange-100 text-orange-700" :
                      invoiceData.orderStatus === "Cancelled" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {invoiceData.orderStatus}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Store + Customer Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Sold By:</h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="text-lg font-bold">{invoiceData.store.name}</h4>
                <p>{invoiceData.store.ownerName}</p>
                <p className="text-sm text-gray-600 mt-2">📧 {invoiceData.store.email}</p>
                <p className="text-sm text-gray-600">📞 {invoiceData.store.phone}</p>
                {invoiceData.store.gstNumber && (
                  <p className="text-sm text-gray-600">GST: {invoiceData.store.gstNumber}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Bill To:</h3>
              <div className="bg-green-50 p-4 rounded-md">
                <h4 className="text-lg font-bold">{invoiceData.customer.name}</h4>
                <p className="text-sm text-gray-600 mt-2">📧 {invoiceData.customer.email}</p>
                <p className="text-sm text-gray-600">📞 {invoiceData.customer.phone}</p>
                <div className="mt-2 text-sm text-gray-700">
                  <p>{invoiceData.customer.shippingAddress.street}, {invoiceData.customer.shippingAddress.area}</p>
                  <p>{invoiceData.customer.shippingAddress.city}, {invoiceData.customer.shippingAddress.state} - {invoiceData.customer.shippingAddress.pincode}</p>
                  <p>{invoiceData.customer.shippingAddress.country}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Product Details */}
<div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-2">Product Details:</h3>
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2 text-right">Unit Price</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{invoiceData.product.name}</td>
                  <td className="px-3 py-2 text-center">{invoiceData.product.quantity}</td>
                  <td className="px-3 py-2 text-right">₹{invoiceData.product.unitPrice.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-semibold">₹{(invoiceData.product.unitPrice * invoiceData.product.quantity).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Payment Summary */}
 <div className="flex justify-end mb-8">
            <div className="w-full max-w-sm bg-gray-50 p-4 rounded-md border">
              <h3 className="font-semibold text-gray-800 mb-2">Payment Summary</h3>
              <div className="flex justify-between py-1">
                <span>Subtotal:</span>
                <span>₹{invoiceData.pricing.subtotal.toLocaleString()}</span>
              </div>
              {invoiceData.pricing.gstAmount > 0 && (
                <div className="flex justify-between py-1">
                  <span>GST:</span>
                  <span>₹{invoiceData.pricing.gstAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t my-2"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">₹{invoiceData.pricing.finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="border-t pt-4 text-xs text-gray-500 text-center">
            <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <p className="mt-1">FunEcom - Connecting Buyers & Sellers | funecom.netlify.app</p>
          </div>
        </div>
      </div>
    </div>
  );
}
