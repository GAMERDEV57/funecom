import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  MapPin,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface PincodeDeliveryCheckerProps {
  storePincode?: string; // kept optional; not used in this simple check
  onDeliveryEstimate?: (estimate: any) => void;
}

export default function PincodeDeliveryChecker({
  onDeliveryEstimate,
}: PincodeDeliveryCheckerProps) {
  const [pincode, setPincode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const checkDelhivery = useAction(api.delivery.checkDelhiveryServiceability);

  const handleCheck = async () => {
    if (!pincode || pincode.length !== 6) {
      setError("Please enter a valid 6-digit pincode");
      return;
    }
    setIsChecking(true);
    setError("");
    setDeliveryInfo(null);

    try {
      const result = await checkDelhivery({ pincode });

      if (!result.success) {
        setError(result.message || "Unable to check delivery. Try again later.");
        return;
      }

      setDeliveryInfo(result);
      onDeliveryEstimate?.(result);
    } catch (e) {
      console.error(e);
      setError("Unable to check delivery. Please try again later.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleChange = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 6);
    setPincode(v);
    if (error) setError("");
    if (deliveryInfo) setDeliveryInfo(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        Check Delivery & Estimate
      </h3>

      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your pincode to check delivery availability
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={pincode}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="e.g., 110001"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              maxLength={6}
              inputMode="numeric"
            />
            <button
              onClick={handleCheck}
              disabled={isChecking || pincode.length !== 6}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isChecking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Checking...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  Check
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <XCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Result */}
        {deliveryInfo && (
          <div className="space-y-4">
            {deliveryInfo.serviceable ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    Delivery Available!
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span>
                        <strong>Estimated Delivery:</strong> 2–7 days
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-600" />
                      <span>
                        <strong>Courier Partner:</strong> Delhivery
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <strong>Cash on Delivery:</strong>{" "}
                      <span
                        className={
                          deliveryInfo.cashOnDelivery
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {deliveryInfo.cashOnDelivery
                          ? "Available"
                          : "Not Available"}
                      </span>
                    </div>
                    <div>
                      <strong>Location:</strong>{" "}
                      {deliveryInfo.district || "—"},{" "}
                      {deliveryInfo.state || "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Important Note:</p>
                      <p>
                        This delivery estimate is applicable only after the
                        seller processes your order. Actual delivery time may
                        vary based on product availability, seller processing
                        time, and courier partner schedules.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800">
                    Delivery Not Available
                  </span>
                </div>
                <p className="text-sm text-red-700">
                  Sorry, we don’t deliver to this pincode yet. Please try a
                  different pincode or contact support.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sample Pincodes */}
        <div className="text-xs text-gray-500">
          <p className="mb-1">Try these sample pincodes:</p>
          <div className="flex flex-wrap gap-2">
            {["110001", "400001", "560001", "600001", "700001"].map((pin) => (
              <button
                key={pin}
                onClick={() => handleChange(pin)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
              >
                {pin}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
