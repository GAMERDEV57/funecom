import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id, Doc } from '../convex/_generated/dataModel';
import { toast } from 'sonner';
import InvoiceModal from './InvoiceModal';

interface StoreOrdersListProps {
  storeId: Id<'stores'>;
}

type EnrichedOrder = Doc<"orders"> & {
  productName: string;
  customerName: string;
  customerEmail?: string | null; 
};

const OrderStatusModal = ({
  order,
  isOpen,
  onClose,
  onStatusUpdated
}: {
  order: EnrichedOrder;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}) => {
  const updateStatusMutation = useMutation(api.orders.updateOrderStatus);
  const [newStatus, setNewStatus] = useState(order.orderStatus);
  const [trackingId, setTrackingId] = useState(order.trackingId || '');
  const [courierName, setCourierName] = useState(order.courierName || '');
  const [estimatedDelivery, setEstimatedDelivery] = useState(order.estimatedDeliveryTime || '');
  const [cancellationReason, setCancellationReason] = useState(order.cancellationReason || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await updateStatusMutation({
        orderId: order._id,
        status: newStatus,
        trackingId: trackingId || undefined,
        courierName: courierName || undefined,
        estimatedDeliveryTime: estimatedDelivery || undefined,
        description: newStatus === "cancelled" ? (cancellationReason || "Store cancelled order") : undefined,
      });
      toast.success("Order status updated!");
      onStatusUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update status.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const orderStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Update Order #{order._id.slice(-6)}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full p-2 border rounded">
              {orderStatuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          {newStatus === "Shipped" && (
            <>
              <div>
                <label className="block text-sm font-medium">Courier Name</label>
                <input type="text" value={courierName} onChange={(e) => setCourierName(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Tracking ID</label>
                <input type="text" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Estimated Delivery</label>
                <input type="text" value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g., 3-5 business days" />
              </div>
            </>
          )}
          {newStatus === "Cancelled" && (
            <div>
              <label className="block text-sm font-medium">Cancellation Reason</label>
              <textarea value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)} className="w-full p-2 border rounded" rows={2}></textarea>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded" disabled={isLoading}>Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
};


export default function StoreOrdersList({ storeId }: StoreOrdersListProps) {
  const ordersData = useQuery(api.orders.getStoreOrders, { storeId });
  const orders = ordersData as EnrichedOrder[] | undefined || [];

  const [selectedOrder, setSelectedOrder] = useState<EnrichedOrder | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceOrderId, setInvoiceOrderId] = useState<Id<"orders"> | null>(null);

  const openStatusModal = (order: EnrichedOrder) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };
  
  const handleStatusUpdated = () => {
    // Data will refresh via useQuery
  };

  const openInvoiceModal = (orderId: Id<"orders">) => {
    setInvoiceOrderId(orderId);
    setIsInvoiceModalOpen(true);
  };

  if (ordersData === undefined) {
    return <div className="text-center py-10">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center py-10 text-gray-500">No orders found for this store yet.</div>;
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        let address = `${order.shippingAddress.street}, ${order.shippingAddress.area}, ${order.shippingAddress.city}, ${order.shippingAddress.pincode}, ${order.shippingAddress.state}, ${order.shippingAddress.country}.`;
        if (order.shippingAddress.landmark) {
          address += ` Landmark: ${order.shippingAddress.landmark}.`;
        }
        return (
          <div key={order._id} className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-primary mb-1">Order ID: #{order._id.slice(-6).toUpperCase()}</h3>
                <p className="text-sm text-gray-500 mb-2">Date: {new Date(order._creationTime).toLocaleDateString()}</p>
                
                <div className="mb-3">
                  <p className="font-medium text-gray-800">{order.productName} (x{order.quantity})</p>
                  <p className="text-gray-700">Total: ₹{order.totalPrice.toLocaleString()}</p>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Customer:</p>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                  {order.customerEmail && <p className="text-xs text-gray-500">{order.customerEmail}</p>}
                  <p className="text-xs text-gray-500">Payment: {order.paymentMethod}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Shipping To:</p>
                  <p className="text-sm text-gray-600">{address}</p>
                </div>
              </div>

              <div className="md:text-right flex-shrink-0">
                <p className="text-md font-semibold mb-1">Status: 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    order.orderStatus === "Delivered" ? "bg-green-100 text-green-700" :
                    order.orderStatus === "Shipped" ? "bg-blue-100 text-blue-700" :
                    order.orderStatus === "Processing" ? "bg-yellow-100 text-yellow-700" :
                    order.orderStatus === "Pending" ? "bg-orange-100 text-orange-700" :
                    order.orderStatus === "Cancelled" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}
                  >{order.orderStatus}</span>
                </p>
                {order.trackingId && <p className="text-xs text-gray-500">Tracking: {order.courierName} - {order.trackingId}</p>}
                <div className="mt-3 space-y-2">
                  <button 
                    onClick={() => openStatusModal(order)}
                    className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors w-full md:w-auto"
                  >
                    Update Status
                  </button>
                  <button 
                    onClick={() => openInvoiceModal(order._id)}
                    className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors w-full md:w-auto ml-0 md:ml-2"
                  >
                    Print Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {selectedOrder && (
        <OrderStatusModal
          order={selectedOrder}
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
      {invoiceOrderId && (
        <InvoiceModal
          orderId={invoiceOrderId}
          isOpen={isInvoiceModalOpen}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setInvoiceOrderId(null);
          }}
        />
      )}
    </div>
  );
}
