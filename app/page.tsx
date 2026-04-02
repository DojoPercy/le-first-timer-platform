"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { resetCachedBranchId } from "@/lib/auth/client-branch";

type LoginRole = "admin" | "caller" | "super_admin";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<LoginRole | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const payload = await response.json().catch(() => null);
        if (response.ok && payload?.authenticated && payload?.redirectTo) {
          router.push(payload.redirectTo);
          return;
        }
      } finally {
        setIsChecking(false);
      }
    };

    void checkSession();
  }, [router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!role) {
      toast.error("Please select a role");
      return;
    }
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          requiredRole: role,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to login");
      }

      if (payload?.role === "super_admin") {
        toast.success("Signed in successfully as Superadmin");
      } else if (payload?.role === "admin") {
        toast.success("Signed in successfully as Admin");
      } else if (payload?.role === "caller") {
        toast.success("Signed in successfully as Caller");
      }

      resetCachedBranchId();
      router.push(payload?.redirectTo || "/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full font-sans">
      <div className="flex w-full flex-col items-center justify-center overflow-y-auto bg-white px-4 py-6 sm:p-8 lg:w-1/2 lg:p-16 lg:pb-2">
        <div className="max-w-sm w-full space-y-6 sm:space-y-8 animate-fade-in">
          <div className="flex flex-col items-center space-y-3">
            <div className="mb-2 flex h-14 items-center justify-around bg-[#121D55] sm:h-18">
              <Image
                src="/logo.png"
                alt="First Timer Platform Logo"
                width={200}
                height={50}
                className="object-contain w-[150px] sm:w-[200px]"
              />
            </div>
            <h1 className="text-center text-xl font-bold text-black sm:text-2xl">
              First Timer Platform
            </h1>
            <p className="text-center text-sm text-gray-500">
              Sign in to manage branch first timers and follow-ups
            </p>
          </div>

          {!role ? (
            <div className="mb-6 flex w-full animate-fade-in flex-col gap-4">
              <Button
                variant="outline"
                className="h-12 w-full rounded-xl border-gray-200 text-base font-semibold text-black hover:bg-gray-50"
                onClick={() => setRole("admin")}
              >
                Sign in as Admin
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full rounded-xl border-gray-200 text-base font-semibold text-black hover:bg-gray-50"
                onClick={() => setRole("super_admin")}
              >
                Sign in as Superadmin
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full rounded-xl border-gray-200 text-base font-semibold text-black hover:bg-gray-50"
                onClick={() => setRole("caller")}
              >
                Sign in as Caller
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@branch.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 rounded-xl border-gray-200 pl-4"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="........"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 rounded-xl border-gray-200 pl-4 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-yellow-400 font-bold text-black transition-all hover:bg-yellow-500 sm:h-14"
              >
                {isLoading ? (
                  <>
                    <Spinner className="h-5 w-5 border-black/20 border-t-black" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full font-medium text-gray-400 hover:text-gray-600"
                onClick={() => setRole(null)}
                disabled={isLoading}
              >
                Change Role
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400">
            Enter your email and password to sign in
          </p>
        </div>
      </div>

      <div className="hidden overflow-hidden md:block md:w-1/2">
        <img
          src="/church.jpg"
          alt="First Timer Platform"
          className="h-screen w-full object-cover"
        />
      </div>
    </div>
  );
}
