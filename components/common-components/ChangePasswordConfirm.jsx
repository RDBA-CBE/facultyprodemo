"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux"; // Import useDispatch
import { setAuthData } from "@/store/slice/AuthSlice"; // Import the action
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import useToast from "@/components/ui/toast";
import { Failure, Success } from "../common-components/toast";
import * as Yup from "yup";
import { Eye, EyeOff, Loader } from "lucide-react";
// import Validation from "@/utils/validation.utils";
import * as Validation from "../../utils/validation.utils";
import ProtectedRoute from "./privateRouter";

const ChangePasswordConfirmForm = () => {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [id, setId] = useState(null);
  const [token, setToken] = useState(null);
  useEffect(() => {
    // Ensure that searchParams are read only on the client side
    if (typeof window !== "undefined") {
      const idFromSearchParams = searchParams.get("id");
      const tokenFromSearchParams = searchParams.get("token");

      if (idFromSearchParams) {
        setId(idFromSearchParams);
      }
      if (tokenFromSearchParams) {
        setToken(tokenFromSearchParams);
      }
    }
  }, [searchParams]);

  const dispatch = useDispatch(); // Initialize dispatch
  const [isMounted, setIsMounted] = useState(false); // Track mounting state

  const [state, setState] = useSetState({
    old_password: "",
    new_password: "",
    confirm_password: "",
    btnLoading: false,
    showPassword: false,
    showConfirmPassword: false,
    showNewPassword: false,
  });

  useEffect(() => {
    setIsMounted(true); // Ensure component is only rendered on client
  }, []);
  console.log("id", id);
  // console.log("token", token);

  const handleSubmit = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        old_password: state?.old_password,
        new_password: state.new_password,
        confirm_password: state.confirm_password,
      };
      // await Validation.change_password.validate(body);
      const res = await Models.auth.changepassword(body);
      console.log("res", res);
      setState({
        btnLoading: false,
        old_password: "",
        new_password: "",
        confirm_password: "",
      });

      Success(res?.detail);

      router.push("/");
    } catch (error) {
      console.log("error: ", error);
      setState({ btnLoading: false });
      if (error?.password) {
        Failure(error.password[0]);
      } else if (error?.non_field_errors) {
        Failure(error?.non_field_errors[0]);
      } else if (error?.old_password) {
        Failure(error?.old_password[0]);
      } else if (error?.confirm_password) {
        Failure(error?.confirm_password[0]);
      } else {
        Failure(error?.message);
      }
      setState({ submitLoading: false }); // Stop loading after error
    }
  };

  // 🚀 Prevent hydration errors by ensuring the component renders only after mount
  if (!isMounted) return null;

  return (
    <div className="flex items-center justify-center">
      <Card className="md:w-[400px] w-[100%]">
        <CardHeader>
          <CardTitle className="text-2xl">Change Password</CardTitle>
          {/* <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription> */}
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="old password">Old Password</Label>
                <div className="relative">
                  <Input
                    id="old-password"
                    type={state.showPassword ? "text" : "password"}
                    placeholder="Enter Your New Password"
                    required
                    value={state.old_password}
                    onChange={(e) => setState({ old_password: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setState({ showPassword: !state.showPassword });
                    }}
                    className={` ${
                      state.errors?.password
                        ? "absolute top-2 right-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                        : "absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                    }`}
                  >
                    {state?.showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={state.showNewPassword ? "text" : "password"}
                    placeholder="Enter Your New Password"
                    required
                    value={state.new_password}
                    onChange={(e) => setState({ new_password: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setState({ showNewPassword: !state.showNewPassword });
                    }}
                    className={` ${
                      state.errors?.password
                        ? "absolute top-2 right-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                        : "absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                    }`}
                  >
                    {state?.showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                <p style={{ fontSize: "12px" }}>min 8 characters required</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-passsword"
                    type={state.showConfirmPassword ? "text" : "password"}
                    placeholder="Enter Your Confirm Password"
                    className="pr-10"
                    required
                    value={state.confirm_password}
                    onChange={(e) =>
                      setState({ confirm_password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setState({
                        showConfirmPassword: !state.showConfirmPassword,
                      });
                    }}
                    className={` ${
                      state.errors?.password
                        ? "absolute top-2 right-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                        : "absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                    }`}
                  >
                    {state?.showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                <p style={{ fontSize: "12px" }}>min 8 characters required</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  // onClick={() => router?.back()}
                  onClick={() =>
                    setState({
                      btnLoading: false,
                      old_password: "",
                      new_password: "",
                      confirm_password: "",
                    })
                  }
                  variant="outline"
                  className="w-full text-themeGreen hover:text-themeGreen border-themeGreen hover:border-themeGreen"
                >
                  Reset
                </Button>

                <Button
                  type="button"
                  className="w-full bg-themeGreen hover:bg-themeGreen "
                  onClick={handleSubmit}
                >
                  {state.btnLoading ? <Loader /> : "Confirm"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProtectedRoute(ChangePasswordConfirmForm);
