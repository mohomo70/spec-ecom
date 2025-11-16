"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import LoadingIndicator from "@/components/admin/LoadingIndicator";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "orders", id],
    queryFn: async () => {
      const response = await adminApi.getOrder(id);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await adminApi.updateOrder(id, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });

  const handleStatusChange = async (status: string) => {
    await updateMutation.mutateAsync({ status });
  };

  const handlePaymentStatusChange = async (payment_status: string) => {
    await updateMutation.mutateAsync({ payment_status });
  };

  const handleTrackingUpdate = async (trackingNumber: string) => {
    await updateMutation.mutateAsync({ tracking_number: trackingNumber });
  };

  if (isLoading) {
    return <LoadingIndicator text="Loading order..." />;
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading order. Please try again.</p>
        <Link href="/admin/orders">
          <Button variant="outline" className="mt-4">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="mt-2 text-sm text-gray-600">Order #{data.order_number}</p>
        </div>
        <Link href="/admin/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>

      {updateMutation.isError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : "Failed to update order. Please try again."}
          </p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                <dd className="text-sm text-gray-900">{data.order_number}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Customer</dt>
                <dd className="text-sm text-gray-900">
                  {data.user?.name || data.user?.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(data.created_at).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <select
                    value={data.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                <dd className="mt-1">
                  <select
                    value={data.payment_status}
                    onChange={(e) => handlePaymentStatusChange(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
            {data.shipping_address && (
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Street Address</dt>
                  <dd className="text-sm text-gray-900">{data.shipping_address.street_address}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">City</dt>
                  <dd className="text-sm text-gray-900">{data.shipping_address.city}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">State</dt>
                  <dd className="text-sm text-gray-900">{data.shipping_address.state}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">ZIP Code</dt>
                  <dd className="text-sm text-gray-900">{data.shipping_address.zip_code}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Country</dt>
                  <dd className="text-sm text-gray-900">{data.shipping_address.country}</dd>
                </div>
              </dl>
            )}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <input
                type="text"
                defaultValue={data.tracking_number || ""}
                onBlur={(e) => {
                  if (e.target.value !== data.tracking_number) {
                    handleTrackingUpdate(e.target.value);
                  }
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter tracking number"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.product_name || item.product?.species_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.unit_price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.total_price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t pt-4">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
              <dd className="text-sm text-gray-900">
                ${(parseFloat(data.total_amount) - parseFloat(data.shipping_amount || 0) - parseFloat(data.tax_amount || 0) + parseFloat(data.discount_amount || 0)).toFixed(2)}
              </dd>
            </div>
            {data.shipping_amount > 0 && (
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Shipping</dt>
                <dd className="text-sm text-gray-900">${data.shipping_amount}</dd>
              </div>
            )}
            {data.tax_amount > 0 && (
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Tax</dt>
                <dd className="text-sm text-gray-900">${data.tax_amount}</dd>
              </div>
            )}
            {data.discount_amount > 0 && (
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Discount</dt>
                <dd className="text-sm text-gray-900">-${data.discount_amount}</dd>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <dt className="text-base font-semibold text-gray-900">Total</dt>
              <dd className="text-base font-semibold text-gray-900">${data.total_amount}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

