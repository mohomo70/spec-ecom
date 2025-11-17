"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi, User } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import UserTable from "@/components/admin/UserTable";
import Pagination from "@/components/admin/Pagination";
import LoadingIndicator from "@/components/admin/LoadingIndicator";
import EmptyState from "@/components/admin/EmptyState";
import { getCurrentUser } from "@/lib/auth";

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const currentUser = getCurrentUser();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users", page, search],
    queryFn: async () => {
      const response = await adminApi.getUsers({ page, search });
      return response;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setSuccessMessage("User deleted successfully!");
    },
    onError: () => {
      setSuccessMessage(null);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await adminApi.bulkDelete("users", ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setSuccessMessage(`${selectedIds.length} users deleted successfully!`);
      setSelectedIds([]);
    },
    onError: () => {
      setSuccessMessage(null);
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, statusField, statusValue }: { ids: string[]; statusField: string; statusValue: any }) => {
      await adminApi.bulkStatusChange("users", ids, statusField, statusValue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setSuccessMessage(`Status updated for ${selectedIds.length} users!`);
      setSelectedIds([]);
    },
    onError: () => {
      setSuccessMessage(null);
    },
  });

  if (isLoading) {
    return <LoadingIndicator text="Loading users..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage user accounts and permissions
            </p>
          </div>
        </div>
        <ErrorMessage
          message="Error loading users. Please try again."
          onRetry={() => queryClient.invalidateQueries({ queryKey: ["admin", "users"] })}
        />
      </div>
    );
  }

  const users = data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage user accounts and permissions
          </p>
        </div>
        <Link href="/admin/users/new">
          <Button>Create User</Button>
        </Link>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search users..."
      />

      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {deleteMutation.isError && (
        <ErrorMessage
          message={
            deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : "Failed to delete user. Please try again."
          }
          onRetry={() => deleteMutation.reset()}
          onDismiss={() => deleteMutation.reset()}
        />
      )}

      {users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Get started by creating a new user account."
          actionLabel="Create User"
          actionHref="/admin/users/new"
        />
      ) : (
        <>
          <BulkActions
            selectedIds={selectedIds}
            onBulkDelete={async (ids) => await bulkDeleteMutation.mutateAsync(ids)}
            onBulkStatusChange={async (ids, statusField, statusValue) =>
              await bulkStatusMutation.mutateAsync({ ids, statusField, statusValue })
            }
            statusOptions={[
              { value: true, label: "Active" },
              { value: false, label: "Inactive" },
            ]}
            statusField="is_active"
            entityName="users"
          />
          <UserTable
            users={users}
            onDelete={(id) => deleteMutation.mutate(id)}
            currentUserId={currentUser?.id}
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

