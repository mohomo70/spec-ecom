"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import OrderTable from "@/components/admin/OrderTable";
import Pagination from "@/components/admin/Pagination";
import SearchFilter from "@/components/admin/SearchFilter";
import BulkActions from "@/components/admin/BulkActions";
import LoadingIndicator from "@/components/admin/LoadingIndicator";
import EmptyState from "@/components/admin/EmptyState";

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await adminApi.updateOrder(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, statusField, statusValue }: { ids: string[]; statusField: string; statusValue: any }) => {
      await adminApi.bulkStatusChange("orders", ids, statusField, statusValue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      setSelectedIds([]);
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "orders", page, search, statusFilter, paymentStatusFilter],
    queryFn: async () => {
      const params: any = { page, search };
      if (statusFilter) params.status = statusFilter;
      if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
      const response = await adminApi.getOrders(params);
      return response;
    },
  });

  if (isLoading) {
    return <LoadingIndicator text="Loading orders..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading orders. Please try again.</p>
      </div>
    );
  }

  const orders = data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage customer orders
          </p>
        </div>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search orders..."
        filters={[
          {
            label: "Status",
            name: "status",
            value: statusFilter,
            onChange: (value) => {
              setStatusFilter(value);
              setPage(1);
            },
            options: [
              { value: "pending", label: "Pending" },
              { value: "confirmed", label: "Confirmed" },
              { value: "processing", label: "Processing" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
          {
            label: "Payment Status",
            name: "payment_status",
            value: paymentStatusFilter,
            onChange: (value) => {
              setPaymentStatusFilter(value);
              setPage(1);
            },
            options: [
              { value: "pending", label: "Pending" },
              { value: "paid", label: "Paid" },
              { value: "failed", label: "Failed" },
              { value: "refunded", label: "Refunded" },
            ],
          },
        ]}
      />

      {orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="No orders match your filters."
        />
      ) : (
        <>
          <BulkActions
            selectedIds={selectedIds}
            onBulkStatusChange={async (ids, statusField, statusValue) =>
              await bulkStatusMutation.mutateAsync({ ids, statusField, statusValue })
            }
            statusOptions={[
              { value: "pending", label: "Pending" },
              { value: "confirmed", label: "Confirmed" },
              { value: "processing", label: "Processing" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" },
            ]}
            statusField="status"
            entityName="orders"
          />
          <OrderTable
            orders={orders}
            onStatusChange={(id, status) => updateMutation.mutate({ id, data: { status } })}
            onPaymentStatusChange={(id, paymentStatus) => updateMutation.mutate({ id, data: { payment_status: paymentStatus } })}
            onSelectionChange={setSelectedIds}
            selectedIds={selectedIds}
          />
          <Pagination
            currentPage={page}
            totalPages={data?.total_pages}
            hasNext={!!data?.next}
            hasPrevious={!!data?.previous}
            onPageChange={setPage}
            totalCount={data?.count}
            pageSize={20}
          />
        </>
      )}
    </div>
  );
}

