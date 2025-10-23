"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileForm {
  first_name: string;
  last_name: string;
  phone: string;
  experience_level: string;
  preferred_tank_size: number;
  newsletter_subscribed: boolean;
  marketing_emails: boolean;
}

export default function ProfilePage() {
  const { user, profile, updateProfile, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>();

  // Load current profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.getProfile(),
  });

  // Populate form when data loads
  useEffect(() => {
    if (profileData) {
      const data = profileData as any;
      setValue('first_name', data.user.first_name || '');
      setValue('last_name', data.user.last_name || '');
      setValue('phone', data.user.phone || '');
      setValue('experience_level', data.profile.experience_level);
      setValue('preferred_tank_size', data.profile.preferred_tank_size || 0);
      setValue('newsletter_subscribed', data.profile.newsletter_subscribed);
      setValue('marketing_emails', data.profile.marketing_emails);
    }
  }, [profileData, setValue]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiClient.updateProfile(data),
    onSuccess: (response: any) => {
      updateUser(response.user);
      updateProfile(response.profile);
      setSuccess("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setTimeout(() => setSuccess(""), 3000);
    },
  });

  const onSubmit = (data: ProfileForm) => {
    setSuccess("");
    updateProfileMutation.mutate({
      user: {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
      },
      profile: {
        experience_level: data.experience_level,
        preferred_tank_size: data.preferred_tank_size || null,
        newsletter_subscribed: data.newsletter_subscribed,
        marketing_emails: data.marketing_emails,
      },
    });
  };

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
              Update your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
                  {success}
                </div>
              )}

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
                </div>
              </div>

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
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Experience Level
                </label>
                <select
                  {...register("experience_level")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Tank Size */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Preferred Tank Size (gallons)
                </label>
                <input
                  {...register("preferred_tank_size", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Preferences */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    {...register("newsletter_subscribed")}
                    type="checkbox"
                    id="newsletter"
                    className="rounded"
                  />
                  <label htmlFor="newsletter" className="text-sm">
                    Subscribe to newsletter
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    {...register("marketing_emails")}
                    type="checkbox"
                    id="marketing"
                    className="rounded"
                  />
                  <label htmlFor="marketing" className="text-sm">
                    Receive marketing emails
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || updateProfileMutation.isPending}
                className="w-full"
              >
                {isSubmitting || updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}