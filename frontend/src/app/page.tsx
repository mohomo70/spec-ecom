"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/auth";


export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Freshwater Fish Store</h1>
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

        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Premium Freshwater Fish for Your Aquarium
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover our wide selection of healthy, beautiful freshwater fish species.
            Expert care instructions and fast, reliable shipping.
          </p>
          <Link href="/products">
            <Button size="lg" className="text-lg px-8 py-3">
              Browse Our Collection
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Expert Care</CardTitle>
                <CardDescription>
                  Detailed care instructions for every fish species
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Each fish comes with comprehensive care guides, tank requirements,
                  and compatibility information.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Healthy Fish</CardTitle>
                <CardDescription>
                  Only the highest quality, disease-free fish
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We quarantine and test all fish before shipping to ensure
                  they arrive healthy and ready for your aquarium.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fast Shipping</CardTitle>
                <CardDescription>
                  Live arrival guarantee with insulated packaging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Professional packaging and expedited shipping to get your
                  fish to you quickly and safely.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Freshwater Fish Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
