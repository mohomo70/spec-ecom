"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth";

export default function HeaderNav() {
  const { user } = useAuthStore();

  return (
    <nav className="flex gap-4">
      <Link href="/products">
        <Button variant="ghost">Products</Button>
      </Link>
      {/* <Link href="/cart">
        <Button variant="ghost">Cart (0)</Button>
      </Link> */}
      {user ? (
        <Link href="/profile">
          <Button>Profile</Button>
        </Link>
      ) : (
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      )}
    </nav>
  );
}