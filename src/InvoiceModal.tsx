import React, { useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import QRCode from "react-qr-code";
import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  Truck,
  FileText,
  Signature,
} from "lucide-react";

interface InvoiceModalProps {
  orderId: Id<"orders">;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceModal({
  orderId,
  isOpen,
  onClose,
}: InvoiceModalProps) {
  const invoiceData = useQuery(api.orders.generateInvoice, { orderId });
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const handleDownloadPDF = () => {
    handlePrint(); // fallback to print-to-PDF
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
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Invoice
          </h2>
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
        <div
          ref={printRef}
          className="p-8 bg-white text-sm leading-relaxed relative z-10"
        >
          {/* Branding */}
          <div className="border-b-4 border-primary pb-6 mb-8 flex justify-between">
            <div className="flex items-center gap-4">
              <img
                src="https://i.ibb.co/1W3dCXw/1000056576-removebg-preview.png"
                alt="FunEcom Logo"
                className="h-12 w-auto object-contain print:h-10"
              />
              <div>
                <h1 className="text-3xl font-bold text-primary mb-1">
                  FunEcom
                </h1>
                <p className="text-gray-600 text-base">
                  Your Trusted E-commerce Platform
                </p>
              </div>
            </div>
            <div className="text-right text-sm bg-primary/10 p-3 rounded-lg">
              <p>
                <Calendar className="inline w-4 h-4" /> Invoice #:{" "}
                {invoiceData.orderId.slice(-8).toUpperCase()}
              </p>
              <p>
                <Calendar className="inline w-4 h-4" /> Order Date:{" "}
                {invoiceData.orderDate}
              </p>
              <p>
                <Calendar className="inline w-4 h-4" /> Invoice Date:{" "}
                {new Date().toLocaleDateString()}
              </p>
              <p>
                <Truck className="inline w-4 h-4" /> Status:{" "}
                <span className="font-semibold">{invoiceData.orderStatus}</span>
              </p>
            </div>
          </div>

          {/* Store + Customer Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" /> Sold By
              </h3>
              <h4 className="text-lg font-bold">{invoiceData.store.name}</h4>
              <p>{invoiceData.store.ownerName}</p>
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                <Mail className="w-4 h-4" /> {invoiceData.store.email}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Phone className="w-4 h-4" /> {invoiceData.store.phone}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Bill To
              </h3>
              <h4 className="text-lg font-bold">{invoiceData.customer.name}</h4>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Mail className="w-4 h-4" /> {invoiceData.customer.email}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Phone className="w-4 h-4" /> {invoiceData.customer.phone}
              </p>
              <div className="mt-2 text-sm text-gray-700">
                {invoiceData.customer.shippingAddress.street},{" "}
                {invoiceData.customer.shippingAddress.city} -{" "}
                {invoiceData.customer.shippingAddress.pincode},{" "}
                {invoiceData.customer.shippingAddress.state}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Package className="w-4 h-4" /> Product Details
          </h3>
          <table className="w-full border border-gray-300 text-sm mb-8">
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
                <td className="px-3 py-2 text-center">
                  {invoiceData.product.quantity}
                </td>
                <td className="px-3 py-2 text-right">
                  ₹{invoiceData.product.unitPrice.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  ₹
                  {(
                    invoiceData.product.unitPrice *
                    invoiceData.product.quantity
                  ).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Payment Summary */}
          <div className="flex justify-between mb-8">
            <div className="bg-gray-50 p-4 rounded-md border">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Summary
              </h3>
              <p>Subtotal: ₹{invoiceData.pricing.subtotal.toLocaleString()}</p>
              <p>GST: ₹{invoiceData.pricing.gstAmount.toLocaleString()}</p>
              <p className="font-bold text-lg mt-2">
                Total: ₹{invoiceData.pricing.finalTotal.toLocaleString()}
              </p>
            </div>
            {/* QR Code */}
            <div className="p-4 flex flex-col items-center">
              <QRCode
                value={`https://funecom.netlify.app/track/${invoiceData.orderId}`}
                size={100}
              />
              <p className="text-xs mt-2 text-gray-600">Scan to Track Order</p>
            </div>
          </div>

          {/* Return Policy + Signature */}
          <div className="border-t pt-4 text-xs text-gray-500 mt-6">
            <p className="mb-2">
              <strong>Return & Refund Policy:</strong> Items can be returned
              within 7 days of delivery. Refunds will be processed within 5-7
              working days.
            </p>
            <div className="flex justify-between mt-4">
              <p>
                Generated on {new Date().toLocaleDateString()} at{" "}
                {new Date().toLocaleTimeString()}
              </p>
              <div className="flex items-center gap-1">
                <Signature className="w-4 h-4" />
                Authorized Signature
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
