"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { apiBaseUrl } from "@/config";
import axios from "axios";

interface Order {
  id: number;
  unique_order_id: string;
  total: string;
  status: string;
  placed_at: string;
  deliveredOn?: string;
  expectedDeliveryDate?: string;
  order_items: {
    id: number;
    product: {
      name: string;
    };
    quantity: number;
    price: string;
  }[];
  orderDate: string;
  itemsCount: number;
  totalAmount: number;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const router = useRouter();
  const toastShownRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/");
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const response = await axios.get(`${apiBaseUrl}order/show`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = response.data;

        if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
          if (!toastShownRef.current) {
            toast.error("Orders List is empty.");
            toastShownRef.current = true;
          }
          setOrders([]);
          return;
        }
        const orders = result.data.map((order: any) => {
          const itemsCount = order.order_items.reduce(
            (acc: number, item: any) => acc + item.quantity,
            0
          );
          return {
            id: order.id,
            unique_order_id: order.unique_order_id,
            total: order.total,
            status: order.status,
            placed_at: order.placed_at,
            deliveredOn: order.delivered_on || null,
            expectedDeliveryDate: order.expected_delivery || null,
            order_items: order.order_items.map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              price: item.price,
              product: {
                name: item.product.name,
              },
            })),
            orderDate: order.placed_at,
            itemsCount,
            totalAmount: parseFloat(order.total),
          };
        });

        setOrders(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders.");
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    return (
      (statusFilter === "All" || order.status === statusFilter) &&
      order.unique_order_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "In-Process":
        return "bg-yellow-100 text-yellow-700";
      case "Placed":
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="min-h-[70vh] px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>

        {/* Search input */}
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search by Order ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-64"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-6">
          {["All", "Placed", "Delivered", "In-Process", "Cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium ${statusFilter === status
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-primary hover:text-white"
                  } cursor-pointer transition-all`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <Link href={`/orders/${order.id}`} key={order.id}>
              <div className="bg-white h-full flex flex-col justify-between border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 cursor-pointer">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Order ID: {order.unique_order_id}
                  </h2>
                  <span
                    className={`px-2 py-1 text-sm rounded ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Details */}
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    Placed on:{" "}
                    <span className="font-medium">{order.orderDate}</span>
                  </p>
                  <p>
                    Items:{" "}
                    <span className="font-medium">{order.itemsCount}</span>
                  </p>

                  {order.status === "Delivered" && order.deliveredOn && (
                    <p>
                      Delivered on:{" "}
                      <span className="font-medium">{order.deliveredOn}</span>
                    </p>
                  )}

                  {order.status !== "Delivered" &&
                    order.expectedDeliveryDate && (
                      <p>
                        Expected Delivery:{" "}
                        <span className="font-medium">
                          {order.expectedDeliveryDate}
                        </span>
                      </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-primary font-bold text-lg">
                    Total: ${order.totalAmount.toFixed(2)}
                  </p>
                  <ArrowRight className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-xl font-semibold text-gray-500 mt-6">
          Orders List is empty.
        </p>
      )}
    </div>
  );
};

export default OrdersPage;
