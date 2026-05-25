"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  Package,
  ArrowLeft,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface PaymentInfo {
  bkash?: string;
  nagad?: string;
  bankAccount?: string;
  wechat?: string;
  alipay?: string;
  wechatQr?: string;
  alipayQr?: string;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalAmount, getTotalUnits, getItemTotalUnits, getItemTotalPrice, clearCart } =
    useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({});
  const [paymentInfoLoading, setPaymentInfoLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      setPaymentInfoLoading(true);
      try {
        const res = await api.get('/settings');
        const data = res.data.data;
        console.log('Settings API Response:', data); // <-- DEBUG LOG
        setPaymentInfo({
          bkash: data.bkash || '',
          nagad: data.nagad || '',
          bankAccount: data.bankAccount || data.bank_account || '',
          wechat: data.wechat || '',
          alipay: data.alipay || '',
          wechatQr: data.wechatQr || data.wechat_qr || '',
          alipayQr: data.alipayQr || data.alipay_qr || '',
        });
      } catch (err) {
        console.error('Failed to fetch payment settings:', err); // <-- DEBUG LOG
      } finally {
        setPaymentInfoLoading(false);
      }
    };
    fetchPaymentInfo();
  }, []);

  // User information state
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
  });

  // Payment state
  const [paymentOption, setPaymentOption] = useState<"now" | "later">("later");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  // Shipping state
  const [shippingMethod, setShippingMethod] = useState("");

  const getImageSrc = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('data:')) return path;
    if (path.startsWith('http')) return path;
    return `/qr-codes/${path}`;
  };

  const handleUserInfoChange = (field: string, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!userInfo.name || !userInfo.phone || !userInfo.address) {
      alert("Please fill in all required fields (Name, Phone, Address)");
      return false;
    }
    if (!shippingMethod) {
      alert("Please select a shipping method");
      return false;
    }
    if (paymentOption === "now") {
      if (!paymentMethod) {
        alert("Please select a payment method");
        return false;
      }
      const isQrPayment = paymentMethod === "wechat" || paymentMethod === "alipay";
      if (!isQrPayment && !transactionId) {
        alert("Please provide the transaction ID");
        return false;
      }
      if (!paymentAmount) {
        alert("Please enter the payment amount");
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          productCode: item.productCode,
          productName: item.name,
          quantity: item.quantity,
          moq: item.moq || 1,
          unitPrice: item.price,
          totalUnits: getItemTotalUnits(item),
          totalPrice: getItemTotalPrice(item),
        })),
        totalAmount: getTotalAmount(),
        totalUnits: getTotalUnits(),
        status: "pending",
        customerInfo: {
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone,
          whatsapp: userInfo.whatsapp,
          address: userInfo.address,
        },
        shippingMethod: shippingMethod,
        payment: {
          option: paymentOption,
          method: paymentOption === "now" ? paymentMethod : null,
          transactionId: paymentOption === "now" ? transactionId : null,
          amount: paymentOption === "now" ? parseFloat(paymentAmount) : null,
        },
      };

      console.log('Submitting order:', orderData);
      const response = await api.post("/orders", orderData);
      console.log('Order response:', response.data);
      
      setTrackingNumber(
        response.data.data.trackingNumber || response.data.data.orderNumber,
      );
      setOrderSuccess(true);
      clearCart();
    } catch (error: any) {
      console.error("Failed to place order:", error);
      
      let errorMessage = "Failed to place order. Please try again.";
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data?.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <Card className="max-w-lg w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-600 mb-2">Your order has been submitted.</p>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">
                Your Tracking Number:
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {trackingNumber}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Save this number to track your order
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/tracking" className="block">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Track Your Order
                </Button>
              </Link>
              <Link href="/wholesale-products" className="block">
                <Button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Link href="/wholesale-products">
              <Button className="bg-white/20 hover:bg-white/30 text-white">
                <ArrowLeft className="mr-2" size={20} />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Shopping Cart
              </h1>
              <p className="text-xl opacity-90">
                Review your items and place your order
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Add some products to get started!
              </p>
              <Link href="/wholesale-products">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Cart Items ({items.length})
              </h2>
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Product Image */}
                      <div className="w-full md:w-32 h-32 flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {item.name}
                          </h3>
                          <Button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-0 h-auto"
                            variant="ghost"
                          >
                            <Trash2 size={20} />
                          </Button>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-2xl font-bold text-orange-600">
                            ৳{item.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            per unit
                          </span>
                          <span className="text-sm text-gray-500">|</span>
                          <span className="text-sm text-gray-500">
                            MOQ: {item.moq || 1}
                          </span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">MOQ Batches:</span>
                              <span className="font-semibold ml-1">{item.quantity}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Units per Batch:</span>
                              <span className="font-semibold ml-1">{item.moq || 1}</span>
                            </div>
                            <div className="col-span-2 border-t border-gray-200 pt-2 mt-1">
                              <span className="text-gray-500">Total Units:</span>
                              <span className="font-bold text-orange-600 ml-1">{getItemTotalUnits(item)} units</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">
                            Batches:
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-8 h-8 p-0 bg-gray-200 hover:bg-gray-300 text-gray-700"
                            >
                              <Minus size={16} />
                            </Button>
                            <span className="w-16 text-center font-bold text-lg">
                              {item.quantity}
                            </span>
                            <Button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-8 h-8 p-0 bg-orange-500 hover:bg-orange-600 text-white"
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Item Total ({getItemTotalUnits(item)} units × ৳{item.price.toFixed(2)}):
                        </span>
                        <span className="text-2xl font-bold text-gray-800">
                          ৳{getItemTotalPrice(item).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* User Information Form */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={24} />
                    Your Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={userInfo.name}
                        onChange={(e) =>
                          handleUserInfoChange("name", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={userInfo.phone}
                        onChange={(e) =>
                          handleUserInfoChange("phone", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={userInfo.email}
                        onChange={(e) =>
                          handleUserInfoChange("email", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={userInfo.whatsapp}
                        onChange={(e) =>
                          handleUserInfoChange("whatsapp", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter WhatsApp number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address *
                      </label>
                      <textarea
                        value={userInfo.address}
                        onChange={(e) =>
                          handleUserInfoChange("address", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your full delivery address"
                        rows={3}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method Selection */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Package size={24} />
                    Shipping Method *
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setShippingMethod("air")}
                      className={`p-6 border-2 rounded-lg text-left transition-all ${
                        shippingMethod === "air"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="text-4xl mb-2">✈️</div>
                      <p className="font-bold text-gray-800 text-lg">
                        Air Cargo
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Fast delivery (3-7 days)
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Best for urgent orders
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingMethod("sea")}
                      className={`p-6 border-2 rounded-lg text-left transition-all ${
                        shippingMethod === "sea"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="text-4xl mb-2">🚢</div>
                      <p className="font-bold text-gray-800 text-lg">
                        Sea Freight
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Economical (20-40 days)
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Best for bulk orders
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingMethod("hand")}
                      className={`p-6 border-2 rounded-lg text-left transition-all ${
                        shippingMethod === "hand"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="text-4xl mb-2">✋</div>
                      <p className="font-bold text-gray-800 text-lg">
                        Hand Carry
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Fastest (1-3 days)
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Best for small items
                      </p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information Display */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard size={24} />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {paymentInfo.bkash && (
                      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                        <p className="font-bold text-pink-700 mb-2">bKash</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {paymentInfo.bkash}
                        </p>
                      </div>
                    )}
                    {paymentInfo.nagad && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="font-bold text-orange-700 mb-2">Nagad</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {paymentInfo.nagad}
                        </p>
                      </div>
                    )}
                    {paymentInfo.bankAccount && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:col-span-2">
                        <p className="font-bold text-blue-700 mb-2">
                          Bank Account Details
                        </p>
                        <p className="text-sm font-semibold text-gray-800 whitespace-pre-line">
                          {paymentInfo.bankAccount}
                        </p>
                      </div>
                    )}
                    {paymentInfoLoading ? (
                      <div className="col-span-2 flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <>
                    {paymentInfo.wechatQr && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="font-bold text-green-700 mb-2">
                          WeChat Pay
                        </p>
                        <div className="mt-2 flex justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getImageSrc(paymentInfo.wechatQr)}
                            alt="WeChat Pay QR"
                            className="w-40 h-40 object-contain rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                    {paymentInfo.alipayQr && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="font-bold text-blue-700 mb-2">Alipay</p>
                        <div className="mt-2 flex justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getImageSrc(paymentInfo.alipayQr)}
                            alt="Alipay QR"
                            className="w-40 h-40 object-contain rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                      </>
                    )}
                  </div>

                  {/* Payment Option Selection */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Option *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentOption("later")}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          paymentOption === "later"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <p className="font-bold text-gray-800">Pay Later</p>
                        <p className="text-sm text-gray-600">
                          Pay after order confirmation
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentOption("now")}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          paymentOption === "now"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <p className="font-bold text-gray-800">Pay Now</p>
                        <p className="text-sm text-gray-600">
                          Make payment now
                        </p>
                      </button>
                    </div>

                    {/* Payment Details (if Pay Now selected) */}
                    {paymentOption === "now" && (
                      <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                        {/* Payment Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h4 className="font-bold text-blue-800 mb-2">
                            Payment Instructions:
                          </h4>
                          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                            <li>
                              Select your preferred payment method from the
                              dropdown
                            </li>
                            <li>
                              Send the exact amount to the provided
                              account/number
                            </li>
                            <li>
                              Copy the transaction ID from your payment
                              confirmation
                            </li>
                            <li>Enter the transaction ID and amount below</li>
                            <li>Submit your order</li>
                          </ol>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Method *
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select payment method</option>
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="wechat">WeChat Pay</option>
                            <option value="alipay">Alipay</option>
                          </select>
                        </div>

                        {/* Show specific payment details based on selection */}
                        {paymentMethod === "bkash" && paymentInfo.bkash && (
                          <div className="bg-pink-50 border-2 border-pink-300 rounded-lg p-4">
                            <p className="font-bold text-pink-700 mb-1">
                              Send payment to this bKash number:
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                              {paymentInfo.bkash}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              Amount to send:{" "}
                              <span className="font-bold">
                                ৳{getTotalAmount().toFixed(2)}
                              </span>
                            </p>
                          </div>
                        )}

                        {paymentMethod === "nagad" && paymentInfo.nagad && (
                          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                            <p className="font-bold text-orange-700 mb-1">
                              Send payment to this Nagad number:
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                              {paymentInfo.nagad}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              Amount to send:{" "}
                              <span className="font-bold">
                                ৳{getTotalAmount().toFixed(2)}
                              </span>
                            </p>
                          </div>
                        )}

                        {paymentMethod === "bank" &&
                          paymentInfo.bankAccount && (
                            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                              <p className="font-bold text-blue-700 mb-2">
                                Bank Account Details:
                              </p>
                              <p className="text-sm font-semibold text-gray-800 whitespace-pre-line">
                                {paymentInfo.bankAccount}
                              </p>
                              <p className="text-sm text-gray-600 mt-2">
                                Amount to send:{" "}
                                <span className="font-bold">
                                  ৳{getTotalAmount().toFixed(2)}
                                </span>
                              </p>
                            </div>
                          )}

                        {paymentMethod === "wechat" && (
                            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                              <p className="font-bold text-green-700 mb-2">
                                Scan WeChat Pay QR Code:
                              </p>
                              {paymentInfoLoading ? (
                                <div className="flex justify-center py-4">
                                  <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                                </div>
                              ) : paymentInfo.wechatQr ? (
                              <div className="bg-white p-4 rounded-lg flex justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={getImageSrc(paymentInfo.wechatQr)}
                                  alt="WeChat Pay QR Code"
                                  className="w-48 h-48 object-contain"
                                />
                              </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">WeChat QR code not available yet. Please contact us for payment details.</p>
                              )}
                              <p className="text-sm text-gray-600 mt-2">
                                Amount to pay:{" "}
                                <span className="font-bold">
                                  ৳{getTotalAmount().toFixed(2)}
                                </span>
                              </p>
                            </div>
                          )}

                        {paymentMethod === "alipay" && (
                            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                              <p className="font-bold text-blue-700 mb-2">
                                Scan Alipay QR Code:
                              </p>
                              {paymentInfoLoading ? (
                                <div className="flex justify-center py-4">
                                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                </div>
                              ) : paymentInfo.alipayQr ? (
                              <div className="bg-white p-4 rounded-lg flex justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={getImageSrc(paymentInfo.alipayQr)}
                                  alt="Alipay QR Code"
                                  className="w-48 h-48 object-contain"
                                />
                              </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">Alipay QR code not available yet. Please contact us for payment details.</p>
                              )}
                              <p className="text-sm text-gray-600 mt-2">
                                Amount to pay:{" "}
                                <span className="font-bold">
                                  ৳{getTotalAmount().toFixed(2)}
                                </span>
                              </p>
                            </div>
                          )}

                        {paymentMethod && paymentMethod !== "wechat" && paymentMethod !== "alipay" && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Transaction ID *
                              </label>
                              <input
                                type="text"
                                value={transactionId}
                                onChange={(e) =>
                                  setTransactionId(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Enter your transaction ID"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Amount *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={paymentAmount}
                                onChange={(e) =>
                                  setPaymentAmount(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder={`Enter amount (Total: ৳${getTotalAmount().toFixed(2)})`}
                                required
                              />
                            </div>
                          </>
                        )}

                        {paymentMethod && (paymentMethod === "wechat" || paymentMethod === "alipay") && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Payment Amount *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={paymentAmount}
                              onChange={(e) =>
                                setPaymentAmount(e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder={`Enter amount (Total: ৳${getTotalAmount().toFixed(2)})`}
                              required
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Items ({items.length})</span>
                      <span>
                        {getTotalUnits()} units total
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>৳{getTotalAmount().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">
                        Calculated later
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-xl font-bold text-gray-800">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-orange-600">
                          ৳{getTotalAmount().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || items.length === 0}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg font-bold"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="mr-2" size={20} />
                        Place Order
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    By placing this order, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
