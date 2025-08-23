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
      window.location.reload(); // Reload to restore React functionality
    }
  };

  const handleDownloadPDF = () => {
    // For now, we'll use the browser's print to PDF functionality
    // In a real app, you might want to use a library like jsPDF or html2pdf
    handlePrint();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Invoice</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={printRef} className="p-8 bg-white">
          {/* FunEcom Header with Branding */}
          <div className="border-b-4 border-primary pb-6 mb-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <img 
                  src="https://i.ibb.co/1W3dCXw/1000056576-removebg-preview.png" 
                  alt="FunEcom Logo" 
                  className="h-16 w-auto object-contain"
                />
                <div>
                  <h1 className="text-4xl font-bold text-primary mb-2">FunEcom</h1>
                  <p className="text-gray-600 text-lg">Your Trusted E-commerce Platform</p>
                  <p className="text-gray-500 text-sm">Connecting Buyers & Sellers Nationwide</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">INVOICE</h2>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-gray-700"><strong>Invoice #:</strong> {invoiceData.orderId.slice(-8).toUpperCase()}</p>
                  <p className="text-gray-700"><strong>Order Date:</strong> {invoiceData.orderDate}</p>
                  <p className="text-gray-700"><strong>Invoice Date:</strong> {new Date().toLocaleDateString()}</p>
                  <p className="text-gray-700">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
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

          {/* Store and Customer Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Store Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">Sold By:</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-xl font-bold text-gray-800">{invoiceData.store.name}</h4>
                <p className="text-gray-700 font-medium">{invoiceData.store.ownerName}</p>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>Email:</strong> {invoiceData.store.email}</p>
                  <p><strong>Phone:</strong> {invoiceData.store.phone}</p>
                  {invoiceData.store.gstNumber && (
                    <p><strong>GST Number:</strong> {invoiceData.store.gstNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">Bill To:</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-xl font-bold text-gray-800">{invoiceData.customer.name}</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>Email:</strong> {invoiceData.customer.email}</p>
                  <p><strong>Phone:</strong> {invoiceData.customer.phone}</p>
                </div>
                <div className="mt-3">
                  <p className="font-medium text-gray-700 mb-1">Shipping Address:</p>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <p>{invoiceData.customer.shippingAddress.street}</p>
                    <p>{invoiceData.customer.shippingAddress.area}</p>
                    <p>{invoiceData.customer.shippingAddress.city}, {invoiceData.customer.shippingAddress.state} - {invoiceData.customer.shippingAddress.pincode}</p>
                    <p>{invoiceData.customer.shippingAddress.country}</p>
                    {invoiceData.customer.shippingAddress.landmark && (
                      <p><strong>Landmark:</strong> {invoiceData.customer.shippingAddress.landmark}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Product Details:</h3>
            <div className="overflow-x-auto shadow-sm">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Product</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Quantity</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Unit Price</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{invoiceData.product.name}</p>
                        <p className="text-sm text-gray-500">Sold by {invoiceData.store.name}</p>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center font-medium">{invoiceData.product.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-medium">₹{invoiceData.product.unitPrice.toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-bold text-primary">₹{(invoiceData.product.unitPrice * invoiceData.product.quantity).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="mb-8">
            <div className="flex justify-end">
              <div className="w-full max-w-md">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Payment Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{invoiceData.pricing.subtotal.toLocaleString()}</span>
                    </div>
                    
                    {invoiceData.pricing.storeCharges > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Store Service Charges:</span>
                        <span className="font-medium">₹{invoiceData.pricing.storeCharges.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {invoiceData.pricing.gstAmount > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">GST (18%):</span>
                        <span className="font-medium">₹{invoiceData.pricing.gstAmount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {invoiceData.pricing.codCharges > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">COD Charges:</span>
                        <span className="font-medium">₹{invoiceData.pricing.codCharges.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <hr className="border-gray-300 my-3" />
                    <div className="flex justify-between text-xl font-bold bg-primary/10 p-3 rounded">
                      <span>Total Amount:</span>
                      <span className="text-primary">₹{invoiceData.pricing.finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Shipping Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">Payment Information:</h3>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="mb-2"><span className="font-medium">Payment Method:</span> <span className="text-primary font-semibold">{invoiceData.paymentMethod}</span></p>
                <p className="text-sm text-gray-600">
                  {invoiceData.paymentMethod.toLowerCase() === 'cod' 
                    ? 'Payment will be collected upon delivery' 
                    : 'Payment has been processed successfully'
                  }
                </p>
              </div>
            </div>

            {invoiceData.trackingId && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">Shipping Information:</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="mb-1"><span className="font-medium">Tracking ID:</span> <span className="font-mono text-primary">{invoiceData.trackingId}</span></p>
                  <p className="mb-2"><span className="font-medium">Courier Partner:</span> {invoiceData.courierName}</p>
                  <p className="text-sm text-gray-600">Track your order using the tracking ID above</p>
                </div>
              </div>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Terms & Conditions:</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">General Terms:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>This invoice is generated electronically and is valid without signature</li>
                    <li>All prices are inclusive of applicable taxes unless stated otherwise</li>
                    <li>Goods once sold will not be taken back or exchanged</li>
                    <li>Any disputes are subject to local jurisdiction only</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Cancellation Policy:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Orders can be cancelled within 24 hours of placement</li>
                    <li>Cancellation after shipment may incur return charges</li>
                    <li>Refunds will be processed within 7-10 business days</li>
                    <li>COD orders cancelled after dispatch are subject to penalties</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Store Specific Terms:</strong> {invoiceData.store.invoiceTerms || "Thank you for shopping with us! For any queries, please contact the store directly."}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Support */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Customer Support:</h3>
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-primary font-semibold mb-1">FunEcom Support</div>
                  <p className="text-gray-600">support@funecom.com</p>
                  <p className="text-gray-600">1800-123-4567</p>
                </div>
                <div className="text-center">
                  <div className="text-primary font-semibold mb-1">Store Contact</div>
                  <p className="text-gray-600">{invoiceData.store.email}</p>
                  <p className="text-gray-600">{invoiceData.store.phone}</p>
                </div>
                <div className="text-center">
                  <div className="text-primary font-semibold mb-1">Business Hours</div>
                  <p className="text-gray-600">Mon-Sat: 9 AM - 8 PM</p>
                  <p className="text-gray-600">Sunday: 10 AM - 6 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Signature */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Generated on:</strong> {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
                <p className="text-xs text-gray-500">
                  This is a computer-generated invoice and does not require a physical signature.
                </p>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-primary">
                    <img 
                      src="https://i.ibb.co/1W3dCXw/1000056576-removebg-preview.png" 
                      alt="FunEcom" 
                      className="h-6 w-auto"
                    />
                    <span className="font-semibold">Thank you for choosing FunEcom!</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                {invoiceData.store.signatureUrl ? (
                  <div>
                    <img 
                      src={invoiceData.store.signatureUrl} 
                      alt="Store Signature" 
                      className="h-16 w-auto mx-auto mb-2"
                    />
                    <div className="border-t border-gray-400 pt-2 w-48">
                      <p className="text-sm font-medium">{invoiceData.store.ownerName}</p>
                      <p className="text-xs text-gray-600">Store Owner</p>
                      <p className="text-xs text-gray-500">{invoiceData.store.name}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="h-16 mb-2 flex items-end">
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{invoiceData.store.name}</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-400 pt-2 w-48">
                      <p className="text-sm font-medium">{invoiceData.store.ownerName}</p>
                      <p className="text-xs text-gray-600">Authorized Signatory</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Print-only footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center print:block hidden">
            <p className="text-xs text-gray-500">
              For any queries regarding this invoice, please contact FunEcom customer support or the respective store.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              FunEcom - Connecting Buyers & Sellers | www.funecom.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
