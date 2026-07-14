import { motion, AnimatePresence, TargetAndTransition } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Chrome } from "lucide-react";
import { ROLES } from "@/utils/constant.utils";
import { Failure, Success, useSetState } from "@/utils/function.utils";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import Models from "@/imports/models.import";
import { TextInput } from "../common-components/textInput";
import { useRouter } from "next/navigation";

// Define types

export default function SignInForm() {

  const router=useRouter()

  const [state, setState] = useSetState({
    password: "",
    email: "",
  });

  useEffect(() => {
    if (state.role) {
      // Disable scroll
      document.body.style.overflow = "hidden";
    } else {
      // Enable scroll
      document.body.style.overflow = "auto";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [state.role]);

  const handleSubmit = async () => {
    try {
      const body = {
        email: state.email,
        password: state.password,
        first_name: state.first_name,
        last_name: state.last_name,
        terms_accepted: true,
        user_type: "buyer",
      };
      console.log("✌️body --->", body);

      // await Utils.Validation.signup.validate(body, { abortEarly: false });

      // const res: any = await Models.auth.singup(body);
      // console.log("✌️res --->", res);
      // Success(res?.message);
      // router.push("/login")
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, submitLoading: false });
      } else {
        if (error?.email?.length > 0) {
          console.log("✌️error?.email --->", error?.email[0]);
          Failure(error?.email[0]);
        } else if (error?.password?.length > 0) {
          Failure(error?.password[0]);
        }
        if (error) setState({ submitLoading: false });
      }
      console.log("✌️error --->", error);
    }
  };
  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setState({
      [name]: type === "checkbox" ? checked : value, // updates email/password properly
      error: { ...state.error, [name]: "" },
    });
  };

  return (
    <div className="flex" style={{ paddingTop: "30px" }}>
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

      {/* RIGHT SIDE - Card Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-1 justify-center items-center px-6"
      >
        <Card className="w-full max-w-md shadow-lg rounded-2xl">
          <CardContent className="p-8 space-y-6">
            {/* Logo / Header */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                R
              </div>
              <span className="text-lg font-semibold">Repute</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold">Create account</h2>
              <p className="text-sm text-gray-500">
                Sign in with this account across the following sites.
              </p>
            </div>

            {/* Role Selector */}
            {/* <div className="space-y-2">
              <Label>Select Role</Label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <Button
                    key={r}
                    variant={state.role === r ? "default" : "outline"}
                    className={`w-full ${
                      state.role === r ? "bg-red-500 text-white" : ""
                    }`}
                    onClick={() => setState({ role: r })}
                  >
                    {r}
                  </Button>
                ))}
              </div>
            </div> */}

            {/* Dynamic Fields */}
            {/* <AnimatePresence mode="wait">
              {state.role && (
                <motion.div
                  key={state.role} // re-renders when role changes
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className='grid grid-cols-2 gap-4'
                >
                  {roleFields[state.role].map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className='space-y-2'
                    >
                      <Label htmlFor={field.id}>{field.label}</Label>
                      <Input
                        id={field.id}
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence> */}

            {/* Email & Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <TextInput
                  title="First Name"
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={state.first_name}
                  error={state.error?.first_name}
                  onChange={handleInputChange}
                />
                <TextInput
                  title="Email"
                  id="email"
                  type="text"
                  name="email"
                  placeholder="Enter Email"
                  value={state.email}
                  error={state.error?.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <TextInput
                  title="Last Name"
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={state.last_name}
                  error={state.error?.last_name}
                  onChange={handleInputChange}
                />

                <TextInput
                  title="Password"
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter Password"
                  value={state.password}
                  error={state.error?.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <Button
              type="button"
              className="w-full bg-red-500 hover:bg-red-600"
              onClick={() => handleSubmit()}
              // loading={state.submitLoading}
            >
              Create account
            </Button>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t" />
              <span className="px-3 text-xs text-gray-400">OR</span>
              <div className="flex-grow border-t" />
            </div>

            {/* Social logins */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Chrome size={18} /> Continue Google
              </Button>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-gray-600">
              Already Have an Account?{" "}
              <Link
                href="/login"
                className="font-medium text-red-600 hover:underline"
              >
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
