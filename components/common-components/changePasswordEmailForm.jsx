"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux"; // Import useDispatch
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

const ChangePasswordEmailForm = () => {
    const router = useRouter();
    const dispatch = useDispatch(); // Initialize dispatch
    const [isMounted, setIsMounted] = useState(false); // Track mounting state

    const [state, setState] = useSetState({
        username: "",
        password: "",
    });

    useEffect(() => {
        setIsMounted(true); // Ensure component is only rendered on client
    }, []);

    const handleSubmit = async () => {
        try {

            const body = {
                email: state.username,
                // password: state.password,
            };
            const res = await Models.auth.forgotpassword(body);
            console.log("res", res)

            // Dispatch action to store tokens and group in Redux
            // dispatch(setAuthData({ tokens: res.access, groups: res.group[0] }));

            Success(res?.message);

            // ✅ Trigger storage event to notify other tabs
            // window.dispatchEvent(new Event("storage"));

            router.push("/");
        } catch (error) {
            console.log("error: ", error);

            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });

                console.log("validationErrors: ", validationErrors);

                // Set validation errors in state
                setState({ errors: validationErrors });
                setState({ submitLoading: false }); // Stop loading after error
            } else {
                setState({ submitLoading: false }); // Stop loading after unexpected error
                if (error?.email) {
                    Failure(error.email[0])
                } else {
                    Failure("An error occurred. Please try again.");

                }
            }
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
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter Your mail ID"
                                    required
                                    value={state.username}
                                    onChange={(e) => setState({ username: e.target.value })}
                                />
                            </div>
                            {/* <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter Your Password"
                                    required
                                    value={state.password}
                                    onChange={(e) => setState({ password: e.target.value })}
                                />
                            </div> */}
                            <div className="flex items-center gap-2">
                                <Button onClick={() => router?.back()} variant="outline" className="w-full text-themeGreen hover:text-themeGreen border-themeGreen hover:border-themeGreen">Cancel</Button>

                                <Button type="button" className="w-full bg-themeGreen hover:bg-themeGreen " onClick={handleSubmit}>
                                    Submit
                                </Button>
                             </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChangePasswordEmailForm;
