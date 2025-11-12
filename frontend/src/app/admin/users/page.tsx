"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi, User } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import UserTable from "@/components/admin/UserTable";
import LoadingIndicator from "@/components/admin/LoadingIndicator";
import EmptyState from "@/components/admin/EmptyState";
import { getCurrentUser } from "@/lib/auth";

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
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
    },
  });

  if (isLoading) {
    return <LoadingIndicator text="Loading users..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading users. Please try again.</p>
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

      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Get started by creating a new user account."
          actionLabel="Create User"
          actionHref="/admin/users/new"
        />
      ) : (
        <>
          <UserTable
            users={users}
            onDelete={(id) => deleteMutation.mutate(id)}
            currentUserId={currentUser?.id}
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {users.length} of {data?.count || 0} users
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                disabled={!data?.previous}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!data?.next}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

