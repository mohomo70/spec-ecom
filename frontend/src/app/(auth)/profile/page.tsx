"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/lib/auth";

interface ProfileForm {
  first_name: string;
  last_name: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>();

  // Load current profile data
  const { data: profileData, isLoading, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.getProfile(),
    retry: false,
  });

  // Populate form when data loads
  useEffect(() => {
    if (profileData) {
      const data = profileData as any;
      setValue('first_name', data.first_name || '');
      setValue('last_name', data.last_name || '');
      setValue('email', data.email || '');
      if (data && setUser) {
        setUser(data);
      }
    }
  }, [profileData, setValue, setUser]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<ProfileForm>) => apiClient.updateProfile(data),
    onSuccess: (response: any) => {
      setSuccess("Profile updated successfully!");
      if (response && setUser) {
        setUser(response);
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (error: any) => {
      setError(error.message || "Failed to update profile");
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setSuccess("");
    setError("");
    updateProfileMutation.mutate(data);
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  if (profileError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Failed to load profile. Please try logging in again.</p>
            <Button onClick={handleLogout} className="mt-4">Return to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
                  {success}
                </div>
              )}

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                  {error}
                </div>
              )}

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>

              {/* Role (read-only) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={user?.role || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <input
                    {...register("first_name")}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <input
                    {...register("last_name")}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || updateProfileMutation.isPending}
                  className="flex-1"
                >
                  {isSubmitting || updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}