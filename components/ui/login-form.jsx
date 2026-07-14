"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
// import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { Failure, Success, useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import * as Yup from "yup";
import Utils from "@/imports/utils.import";

export default function AuthPage() {
  const router = useRouter();

  const [state, setState] = useSetState({
    email: "",
    password: "",
    loading: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({
      [name]: value,
      error: { ...state.error, [name]: "" },
    });
  };

  const handleSubmit = async () => {
    try {
      setState({ loading: true });
      const body = {
        email: state.email,
        password: state.password,
      };

      await Utils.Validation.signin.validate(body, {
        abortEarly: false,
      });
      const res = await Models.auth.login(body);
      Success("Login Successfully");
      localStorage.setItem("token", res?.access);
      localStorage.setItem("refresh", res?.refresh);
      localStorage.setItem("userId", res?.user_id);
      localStorage.setItem("name", res?.name);
      localStorage.setItem("wishlist_id", res?.wishlist_id);
      localStorage.setItem("profile_id", res?.profile_id);

      if (res?.groups?.length > 0) {
        localStorage.setItem("group", res?.groups?.[0]?.name);
        localStorage.setItem("groupId", res?.groups?.[0]?.id);
      }
      window.location.href = "/property-list";
      // router.push("/property-list")

      setState({ loading: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, loading: false });
      } else {
        Failure(error?.error);
      }
      setState({ loading: false });

      console.log("✌️error --->", error);
    }
  };

  return (
    <div className="flex" style={{ paddingTop: "30px" }}>
      {/* LEFT SIDE - Background with image & overlay */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="hidden md:flex relative flex-1 items-center justify-center"
      >
        <Image
          src="/assets/images/real-estate/01.png" // replace with a nice real estate / city image
          alt="Real Estate Background"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20" />
        <div className="relative z-10 text-white text-center px-8">
          <h1 className="text-4xl font-bold">Find Your Dream Home</h1>
          <p className="mt-3 text-gray-200 max-w-md mx-auto">
            Join our real estate platform to explore the latest listings and
            manage your properties effortlessly.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="flex flex-1 items-center justify-center px-6"
      >
        <Card className="w-full max-w-md shadow-xl rounded-3xl backdrop-blur bg-white/90">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                R
              </div>
              <span className="text-lg font-semibold">Repute</span>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-sm text-gray-500 mt-1">
                Sign in to manage your properties and explore new listings.
              </p>
            </div>

            <div className="space-y-2">
              <Input
                title="Email"
                placeholder="you@example.com"
                className="rounded-xl"
                value={state.email}
                name="email"
                onChange={handleInputChange}
                error={state.error?.email}
              />
            </div>

            <div className="space-y-2">
              <Input
                title="Password"
                placeholder="Enter your password"
                type="password"
                className="rounded-xl"
                value={state.password}
                name="password"
                onChange={handleInputChange}
                error={state.error?.password}
              />

              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm  hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button
              className="w-full bg-red-600 hover:bg-red-700 rounded-xl text-white font-semibold"
              onClick={() => handleSubmit()}
              loading={state.loading}
            >
              Sign In
            </Button>

            <div className="relative flex items-center my-2">
              <div className="flex-grow border-t border-gray-200" />
              <span className="px-3 text-xs text-gray-400">OR</span>
              <div className="flex-grow border-t border-gray-200" />
            </div>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-3 rounded-xl"
            >
              Continue with Google
            </Button>

            <p className="text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link
                href="/signin"
                className="font-medium text-red-600 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
