"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { adminApi, UserFormData } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import UserForm from "@/components/admin/UserForm";
import SuccessMessage from "@/components/admin/SuccessMessage";
import ErrorMessage from "@/components/admin/ErrorMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewUserPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (formData: UserFormData) => {
      const response = await adminApi.createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password!,
        password_confirm: formData.password_confirm!,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        is_active: formData.is_active,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setSuccessMessage("User created successfully!");
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    },
    onError: () => {
      setSuccessMessage(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create User</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new user account. Role will be set to 'user' by default.
          </p>
        </div>
      </div>

      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {createMutation.isError && (
        <ErrorMessage
          message={
            createMutation.error instanceof Error
              ? createMutation.error.message
              : "Failed to create user. Please try again."
          }
          onRetry={() => createMutation.reset()}
          onDismiss={() => createMutation.reset()}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            onSubmit={async (formData) => {
              await createMutation.mutateAsync(formData);
            }}
            onCancel={() => router.push("/admin/users")}
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

