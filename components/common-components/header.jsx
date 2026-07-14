"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  ArrowRight,
  Bookmark,
  BookMarked,
  Heart,
  Loader,
  Lock,
  LogIn,
  LogOut,
  MenuIcon,
  MoveRight,
  RefreshCcw,
  Settings,
  User,
  User2,
  User2Icon,
  UserPlus,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  buildFormData,
  Dropdown,
  Failure,
  useSetState,
} from "@/utils/function.utils";
import CustomSelect from "./dropdown";
import Models from "@/imports/models.import";
import Modal from "./modal";
import { Input } from "../ui/input";
import CustomPhoneInput from "./phoneInput";
import * as Validation from "@/utils/validation.utils";
import * as Yup from "yup";
import { Success } from "./toast";
import ReCAPTCHA from "react-google-recaptcha";
import { CAPTCHA_SITE_KEY } from "@/utils/constant.utils";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Determine if we're on the home page
  const isHomePage = pathname === "/";

  const [activeMenu, setActiveMenu] = useState(null);
  const [clickedMenu, setClickedMenu] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const captchaCanvasRef = useRef(null);
  const loginCaptchaCanvasRef = useRef(null);
  const loginRecaptchaRef = useRef(null);
  const registerRecaptchaRef = useRef(null);
  const [loginCaptchaToken, setLoginCaptchaToken] = useState("");
  const [registerCaptchaToken, setRegisterCaptchaToken] = useState("");

  const [state, setState] = useSetState({
    token: null,
    group: null,
    username: null,
    logoutLoading: false,
    isOpenLogin: false,
    isOpenEmailVerify: false,
    loginFailModal: false,
    loginErrorMessage: "",
    registrationFailModal: false,
    registrationErrorMessage: "",
    captchaValue: "",
    captchaInput: "",
    captchaRefreshing: false,
    loginCaptchaValue: "",
    loginCaptchaInput: "",
    loginCaptchaRefreshing: false,
  });

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    return Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  };

  const refreshCaptcha = () => {
    setState({
      captchaValue: generateCaptcha(),
      captchaInput: "",
      captchaRefreshing: true,
      errors: {
        ...state.errors,
        captchaInput: "",
      },
    });
    window.setTimeout(() => {
      setState({ captchaRefreshing: false });
    }, 500);
  };

  const refreshLoginCaptcha = (preserveError = false) => {
    setState({
      loginCaptchaValue: generateCaptcha(),
      loginCaptchaInput: "",
      loginCaptchaRefreshing: true,
      errors: {
        ...state.errors,
        ...(preserveError
          ? { loginCaptchaInput: state.errors?.loginCaptchaInput || "" }
          : { loginCaptchaInput: "" }),
      },
    });
    window.setTimeout(() => {
      setState({ loginCaptchaRefreshing: false });
    }, 500);
  };

  const drawCaptchaOnCanvas = (canvasRef, captchaText) => {
    const canvas = canvasRef?.current;
    if (!canvas) return false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    const width = canvas.width;
    const height = canvas.height;

    // Base
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#cfcfcf";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(0.6, 0.6, width - 1.2, height - 1.2);

    // Noise dots
    for (let i = 0; i < 40; i += 1) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(140,140,140,0.35)";
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2 + 1,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Interference lines
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(150,150,150,0.45)";
      ctx.lineWidth = 1 + Math.random();
      ctx.moveTo(Math.random() * 30, Math.random() * height);
      ctx.lineTo(width - Math.random() * 30, Math.random() * height);
      ctx.stroke();
    }

    const captcha = captchaText || "------";
    const slot = width / (captcha.length + 1);
    for (let i = 0; i < captcha.length; i += 1) {
      const ch = captcha[i];
      const x = slot * (i + 1);
      const y = height / 2 + 9;
      const angle = (Math.random() - 0.5) * 0.5;
      const fontSize = 28 + Math.floor(Math.random() * 3);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = `700 ${fontSize}px Georgia, "Times New Roman", serif`;
      ctx.fillStyle = "rgba(150,150,150,0.82)";
      ctx.fillText(ch, -8, 0);
      ctx.restore();
    }
    return true;
  };

  useEffect(() => {
    if (!state.isOpenReg) return;
    let cancelled = false;
    const attemptDraw = (retries = 8) => {
      if (cancelled) return;
      const ok = drawCaptchaOnCanvas(captchaCanvasRef, state.captchaValue);
      if (ok || retries <= 0) return;
      window.setTimeout(() => attemptDraw(retries - 1), 60);
    };
    attemptDraw();
    return () => {
      cancelled = true;
    };
  }, [state.captchaValue, state.isOpenReg]);

  useEffect(() => {
    if (!state.isOpenLogin) return;
    let cancelled = false;
    const attemptDraw = (retries = 8) => {
      if (cancelled) return;
      const ok = drawCaptchaOnCanvas(
        loginCaptchaCanvasRef,
        state.loginCaptchaValue,
      );
      if (ok || retries <= 0) return;
      window.setTimeout(() => attemptDraw(retries - 1), 60);
    };
    attemptDraw();
    return () => {
      cancelled = true;
    };
  }, [state.loginCaptchaValue, state.isOpenLogin]);

  useEffect(() => {
    if (!state.isOpenReg) return;
    if ((state.captchaValue || "").trim()) return;
    setState({ captchaValue: generateCaptcha() });
  }, [state.isOpenReg]);

  useEffect(() => {
    if (!state.isOpenLogin) return;
    setState({
      loginCaptchaValue: generateCaptcha(),
      loginCaptchaInput: "",
    });
  }, [state.isOpenLogin]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setState({ token });

    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "logout") {
        setState({ token: localStorage.getItem("token") });
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleOpenRegisterModal = () => {
      setState({
        isOpenReg: true,
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        department: "",
        terms: false,
        newsletter: false,
        errors: {},
        captchaValue: generateCaptcha(),
        captchaInput: "",
      });
      loadDepartmentList();
    };

    window.addEventListener("openRegisterModal", handleOpenRegisterModal);

    return () => {
      window.removeEventListener("openRegisterModal", handleOpenRegisterModal);
    };
  }, [setState]);

  useEffect(() => {
    const handleOpenLoginModal = () => {
      setState({
        isOpenLogin: true,
        email: "",
        password: "",
        errors: {},
        loginCaptchaValue: generateCaptcha(),
        loginCaptchaInput: "",
      });
    };

    window.addEventListener("openLoginModal", handleOpenLoginModal);

    return () => {
      window.removeEventListener("openLoginModal", handleOpenLoginModal);
    };
  }, [setState]);

  const loadDepartmentList = async () => {
    try {
      let page = 1;
      let hasNext = true;
      let allResults = [];
      let maxPages = 50;

      while (hasNext && page <= maxPages) {
        const res = await Models.department.masterDep({ page });

        if (res?.results?.length) {
          allResults = [...allResults, ...res.results];
        }

        hasNext = !!res?.next;
        page++;
      }

      setState({
        departmentList: Dropdown(allResults, "name"),
      });
    } catch (error) {
      console.log("department error", error);
    }
  };

  const handleLogout = async () => {
    try {
      setState({ logoutLoading: true });
      const refresh = localStorage.getItem("refresh");
      const res = await Models.auth.logout({ refresh });
      setState({ logoutLoading: true });
      setDialogOpen(false);
      localStorage.clear();
      window.location.href = "/";
    } catch (error) {
      localStorage.clear();
      window.location.href = "/";
      setState({ logoutLoading: false });
    }
  };

  const handleRegister = async () => {
    try {
      setState({ btnLoading: true, errors: {} });

      const validateBody = {
        first_name: state.first_name,
        last_name: state.last_name,

        email: state.email?.trim(),
        password: state.password,
        password_confirm: state.confirmPassword,
      };

      await Validation.register.validate(validateBody, { abortEarly: false });

      if (!state.terms) {
        throw { isTerms: true };
      }

      if (!registerCaptchaToken) {
        throw { isCaptcha: true };
      }

      const body = {
        username: state.first_name + " " + state.last_name,
        role: "applicant",
        ...validateBody,
        newsletter: state.newsletter,
        terms: state.terms,
        ...(state.department ? { department: state.department } : {}),
      };

      console.log("body", body);
      const formData = buildFormData({ ...body, recaptcha_token: registerCaptchaToken });

      const res = await Models.auth.create(formData);
      console.log("✌️res --->", res);
      setState({
        isOpenReg: false,
        // isOpenEmailVerify: true,
        errors: {},
        btnLoading: false,
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        department: "",
        terms: false,
        newsletter: false,
      });
      setRegisterCaptchaToken("");
      setState({ successRegistraion: true });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });

        if (!state.terms) {
          validationErrors.terms = "Please accept terms and conditions";
        }
        if (!registerCaptchaToken) {
          validationErrors.captchaInput = "Please complete the captcha";
        }

        console.log("✌️validationErrors --->", validationErrors);

        setState({ errors: validationErrors, btnLoading: false });
      } else if (error.isTerms) {
        setState({
          errors: { terms: "Please accept terms and conditions" },
          btnLoading: false,
        });
      } else if (error.isCaptcha) {
        setState({
          errors: { captchaInput: "Please complete the captcha" },
          btnLoading: false,
        });
      } else {
        setState({
          registrationErrorMessage:
            error?.error || "Registration failed. Please check your details.",
          registrationFailModal: true,
          btnLoading: false,
        });
      }
    }
  };

  const handleLogin = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        email: state.email?.trim(),
        password: state.password,
      };
      await Validation.login.validate(body, { abortEarly: false });
      if (!loginCaptchaToken) {
        throw { isLoginCaptcha: true };
      }
      const res = await Models.auth.login({ ...body, recaptcha_token: loginCaptchaToken });
      console.log("✌️res --->", res);
      localStorage.setItem("token", res.access);
      localStorage.setItem("refresh", res.refresh);
      localStorage.setItem("user", JSON.stringify(res.user));

      setLoginCaptchaToken("");
      setState({
        token: res.access,
        errors: {},
        isOpenLogin: false,
        email: "",
        password: "",
        loginCaptchaInput: "",
        loginCaptchaValue: "",
      });
      window.dispatchEvent(new CustomEvent("loginSuccess"));
      Success("Login Successfully!");

      // if (sessionStorage.getItem("from_login_btn") === "true") {
      //   sessionStorage.removeItem("from_login_btn");
      //   router.push("/profile");
      // }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        if (!loginCaptchaToken) {
          validationErrors.loginCaptchaInput = "Please complete the captcha";
        }
        console.log("✌️validationErrors --->", validationErrors);

        setState({ errors: validationErrors, btnLoading: false });
      } else if (error.isLoginCaptcha) {
        setState({
          errors: { loginCaptchaInput: "Please complete the captcha" },
          btnLoading: false,
        });
      } else {
        setState({
          loginErrorMessage:
            error?.error || "Login failed. Please check your credentials.",
          loginFailModal: true,
          btnLoading: false,
        });
      }
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  const navigationMenu = [
    {
      title: "Home",
      url: "/",
    },
    {
      title: "Jobs",
      url: "/jobs",
    },
    // {
    //   title: "About Us",
    //   url: "/about",
    // },
    // {
    //   title: "Contact Us",
    //   url: "/contact",
    // },
  ];

  const handleFormChange = (field, value) => {
    setState({
      [field]: value,
      errors: {
        ...state.errors,
        [field]: "",
      },
    });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={` sticky top-0 z-[50] bg-[#fff] text-white `}
      >
        <div className="section-wid">
          <div className="flex items-center justify-between h-16">
            <div className="flex gap-10">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0">
                <Link href="/" className="flex items-center space-x-3">
                  <img
                    src="/assets/images/faculty-logo.png"
                    alt="Logo"
                    className="!w-[200px] h-10"
                  />
                  {/* <span className="font-medium text-2xl tracking-tight text-white">
                  Faculty Pro
                </span> */}
                </Link>
              </div>

              {/* Navigation Menu (Desktop) */}
              <nav className="hidden lg:flex items-center ">
                <div className="flex items-center space-x-8">
                  {navigationMenu.map((menu) => {
                    const isActive =
                      pathname === menu.url ||
                      (menu.url === "/" && pathname === "/");
                    return (
                      <Link
                        key={menu.title}
                        href={menu.url}
                        onClick={(e) => {
                          if (menu.url === "/jobs" && pathname === "/jobs") {
                            e.preventDefault();
                            window.location.href = "/jobs";
                          }
                        }}
                        className={`font-medium transition-colors duration-200 ${
                          isActive
                            ? "text-[#F2B31D]"
                            : isHomePage
                              ? "text-black hover:text-[#F2B31D]"
                              : "text-black hover:text-[#F2B31D]"
                        }`}
                      >
                        {menu.title}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Right Side - Auth & Mobile Menu */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Auth Buttons (Desktop) */}
              {state.token ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 focus:outline-none profile-buttons">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#F2B31D] text-white">
                          <User2 className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
                    {/* <DropdownMenuSeparator /> */}
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>

                    {/* <DropdownMenuItem
                      onClick={() => router.push("/saved-jobs")}
                    >
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span>Saved Jobs</span>
                    </DropdownMenuItem> */}

                    <DropdownMenuItem
                      onClick={() => router.push("/change-password")}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      <span>Change password</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="auth-buttons hidden lg:flex items-center space-x-3">
                  <Button
                    onClick={() => {
                      sessionStorage.setItem("from_login_btn", "true");
                      setState({
                        isOpenLogin: true,
                        email: "",
                        password: "",
                        errors: {},
                      });
                    }}
                    variant="ghost"
                    className="text-black text-sm font-bold hover:text-[#F2B31D] transition-colors"
                  >
                    Login
                  </Button>
                  {/* <Button
                    onClick={() => {
                      setState({
                        isOpenReg: true,
                        email: "",
                        password: "",
                        confirmPassword: "",
                        first_name: "",
                        last_name: "",
                        department: "",
                        terms: false,
                        newsletter: false,
                        errors: {},
                        captchaValue: generateCaptcha(),
                        captchaInput: "",
                      });
                      loadDepartmentList();
                    }}
                    className="bg-[#f2b31d] hover:bg-[#d9a016] text-[#000] px-8 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-md"
                  >
                    Register
                    <MoveRight size={16} />
                  </Button> */}
                </div>
              )}

              {/* Mobile Menu Button */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`lg:hidden hover:bg-trasparent ${
                      isHomePage ? "text-[#1E3786]" : "text-[#1E3786]"
                    }`}
                  >
                    <MenuIcon className="h-6 w-6 text-[#1E3786] " />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4 mt-6">
                    {/* Mobile Navigation */}
                    {navigationMenu.map((menu) => {
                      const isActive =
                        pathname === menu.url ||
                        (menu.url === "/" && pathname === "/");
                      return (
                        <Link
                          key={menu.title}
                          href={menu.url}
                          onClick={() => setOpen(false)}
                          className={`font-medium py-2 px-4 rounded-lg transition-colors ${
                            isActive
                              ? "text-[#000] bg-[#0000ff0a]/10"
                              : "text-gray-700 hover:text-[#000] hover:bg-gray-100"
                          }`}
                        >
                          {menu.title}
                        </Link>
                      );
                    })}

                    {/* Mobile Auth Buttons */}
                    {!state.token && (
                      <div className="flex flex-col space-y-3 pt-4 border-t">
                        <Button
                          onClick={() => {
                            sessionStorage.setItem("from_login_btn", "true");
                            setState({
                              isOpenLogin: true,
                              email: "",
                              password: "",
                              errors: {},
                            });
                            setOpen(false);
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          Login
                        </Button>
                        <Button
                          onClick={() => {
                            setState({
                              isOpenReg: true,
                              email: "",
                              password: "",
                              confirmPassword: "",
                              first_name: "",
                              last_name: "",
                              department: "",
                              terms: false,
                              newsletter: false,
                              errors: {},
                              captchaValue: generateCaptcha(),
                              captchaInput: "",
                            });
                            loadDepartmentList();
                            setOpen(false);
                          }}
                          className="w-full bg-[#F2B31D] hover:bg-[#E5A01A] text-white"
                        >
                          Sign Up
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      <Modal
        isOpen={state.isOpenLogin}
        setIsOpen={() => {
          setState({
            errors: {},
            isOpenLogin: false,
            email: "",
            password: "",
            loginCaptchaInput: "",
            loginCaptchaValue: "",
          });
          setLoginCaptchaToken("");
          loginRecaptchaRef.current?.reset();
        }}
        closeIcon={false}
        hideHeader={true}
        preventOutsideClose={true}
        title="Sign In"
        width="500px"
        renderComponent={() => (
          <div
            className="space-y-6 bg-[#FFFCF3] py-6 px-10 max-h-[85vh] overflow-y-auto scrollbar-hide rounded rounded-lg"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
          >
            <div className="flex items-center justify-center w-full mb-6">
              <img
                src="/assets/images/faculty-logo.png"
                height={400}
                width={200}
                alt="Login Illustration"
                className="w-[160px] h-8"
              />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Sign in</h2>
              {/* <p className="text-gray-600 text-md">
                Don't have account{" "}
                <button
                  onClick={() => {
                    setState({
                      isOpenLogin: false,
                      isOpenReg: true,
                      email: "",
                      password: "",
                      confirmPassword: "",
                      first_name: "",
                      last_name: "",
                      department: "",
                      terms: false,
                      newsletter: false,
                      errors: {},
                    });
                    loadDepartmentList();
                  }}
                  className="text-amber-500 hover:text-amber-600 font-medium"
                >
                  Create Account
                </button>
              </p> */}
            </div>

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={state.email || ""}
                onChange={(e) => handleFormChange("email", e.target.value)}
                required
                bg="ffffff"
                error={state.errors?.email}
              />

              <Input
                type="password"
                placeholder="Password"
                value={state.password || ""}
                onChange={(e) => handleFormChange("password", e.target.value)}
                required
                bg="ffffff"
                error={state.errors?.password}
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                className="text-amber-500 hover:text-amber-600 text-sm"
                onClick={() => {
                  router.push(`/forget-password`);
                  setState({ isOpenLogin: false });
                }}
              >
                Forget password?
              </button>
            </div>
            
            {/* <div className="flex items-center justify-center gap-3 py-0">
             <RefreshCcw
                  className={`h-5 w-5 ${
                    state.loginCaptchaRefreshing ? "animate-spin" : ""
                  }`}
                />
            </div> */}

            {/* <div className="flex items-center justify-center gap-3 py-0">
              <canvas
                ref={loginCaptchaCanvasRef}
                width={260}
                height={60}
                className="h-[60px] w-[260px] rounded-md border border-gray-300 bg-gray-50"
                aria-label="Login captcha"
              />
              <button
                type="button"
                onClick={refreshLoginCaptcha}
                className="h-10 w-10 rounded-md border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                aria-label="Refresh login captcha"
              >
                <RefreshCcw
                  className={`h-5 w-5 ${
                    state.loginCaptchaRefreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div> */}

            {/* <Input
              placeholder="Enter captcha *"
              value={state.loginCaptchaInput || ""}
              onChange={(e) => handleFormChange("loginCaptchaInput", e.target.value)}
              bg="ffffff"
              error={state.errors?.loginCaptchaInput}
            /> */}

            <div className="flex items-center justify-center gap-3 py-0">
            <ReCAPTCHA
              ref={loginRecaptchaRef}
              sitekey={CAPTCHA_SITE_KEY}
              onChange={(token) => {
                setLoginCaptchaToken(token || "");
                if (token) setState({ errors: { ...state.errors, loginCaptchaInput: "" } });
              }}
            />
            </div>
            {state.errors?.loginCaptchaInput && (
              <p className="text-sm text-red-600 text-center -mt-2">{state.errors.loginCaptchaInput}</p>
            )}

            <Button
              type="button"
              className=" bg-[#1E3786] w-full py-3 text-white hover:bg-amber-500  font-bold rounded-3xl py-2 flex items-center justify-center gap-2"
              onClick={handleLogin}
            >
              {state.btnLoading ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="text-center mt-6">
              <a
                href="/terms-conditions"
                className="text-gray-500 text-sm hover:text-gray-700"
              >
                Terms and condition
              </a>
            </div>
          </div>
        )}
      />

      <Modal
        isOpen={state.isOpenReg}
        setIsOpen={() => {
          setState({
            errors: {},
            isOpenReg: false,
            email: "",
            password: "",
            confirmPassword: "",
            first_name: "",
            last_name: "",
            department: "",
            terms: false,
            newsletter: false,
          });
          setRegisterCaptchaToken("");
          registerRecaptchaRef.current?.reset();
        }}
        hideHeader={true}
        preventOutsideClose={true}
        title="Create Account"
        width="500px"
        renderComponent={() => (
          <div
            className="space-y-6 bg-[#FFFCF3] py-6 px-10 max-h-[98vh] overflow-y-auto scrollbar-hide rounded rounded-lg"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRegister();
            }}
          >
            <div className="flex items-center justify-center w-full mb-6 ">
              <img
                src="/assets/images/faculty-logo.png"
                height={300}
                width={100}
                alt="Registration Illustration"
                className="w-[160px] h-8"
              />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Create account.
              </h2>
              <p className="text-gray-600">
                Already have account?{" "}
                <button
                  onClick={() => {
                    setState({
                      isOpenReg: false,
                      isOpenLogin: true,
                      email: "",
                      password: "",
                      errors: {},
                    });
                  }}
                  className="text-amber-500 hover:text-amber-600 font-medium"
                >
                  Log In
                </button>
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="First Name *"
                  value={state.first_name || ""}
                  onChange={(e) =>
                    handleFormChange("first_name", e.target.value)
                  }
                  required
                  bg="ffffff"
                  error={state.errors?.first_name}
                />
                <Input
                  placeholder="Last Name *"
                  value={state.last_name || ""}
                  onChange={(e) =>
                    handleFormChange("last_name", e.target.value)
                  }
                  required
                  bg="ffffff"
                  error={state.errors?.last_name}
                />
              </div>

              <Input
                type="email"
                placeholder="Email address *"
                value={state.email || ""}
                onChange={(e) => handleFormChange("email", e.target.value)}
                required
                bg="ffffff"
                error={state.errors?.email}
              />

              <Input
                type="password"
                placeholder="Password *"
                value={state.password || ""}
                onChange={(e) => handleFormChange("password", e.target.value)}
                required
                bg="ffffff"
                error={state.errors?.password}
              />

              <Input
                type="password"
                placeholder="Confirm Password *"
                value={state.confirmPassword || ""}
                onChange={(e) =>
                  handleFormChange("confirmPassword", e.target.value)
                }
                required
                bg="ffffff"
                error={state.errors?.password_confirm}
              />

              <CustomSelect
                placeholder="Department"
                options={state.departmentList || []}
                value={state.department || ""}
                onChange={(selected) =>
                  handleFormChange("department", selected ? selected.value : "")
                }
                className="border border-gray-200 bg-white"
              />
            </div>
            <div className="gap-4 flex flex-col">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={state.terms || false}
                    onChange={(e) =>
                      handleFormChange("terms", e.target.checked)
                    }
                  />
                  <span className="text-gray-600 text-sm">
                    I've read and agree with your{" "}
                    <button
                      className="text-amber-500 hover:text-amber-600"
                      onClick={() => window.open("/terms-conditions", "_blank")}
                    >
                      Terms of Services
                    </button>
                    <span className="text-red-500"> *</span>
                  </span>
                </div>
                {state.errors?.terms && (
                  <span className="text-red-500 text-sm mt-1">
                    {state.errors.terms}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={state.newsletter || false}
                    onChange={(e) =>
                      handleFormChange("newsletter", e.target.checked)
                    }
                  />
                  <span className="text-gray-600 text-sm">
                    Accept to receive newsletter
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 py-0">
            <ReCAPTCHA
              ref={registerRecaptchaRef}
              sitekey={CAPTCHA_SITE_KEY}
              onChange={(token) => {
                setRegisterCaptchaToken(token || "");
                if (token) setState({ errors: { ...state.errors, captchaInput: "" } });
              }}
            />
            </div>
            {state.errors?.captchaInput && (
              <p className="text-red-500 text-sm text-center -mt-2">{state.errors.captchaInput}</p>
            )}

            {/* <div className="flex items-center justify-center gap-3 py-0">
              <canvas
                ref={captchaCanvasRef}
                width={260}
                height={60}
                className="h-[60px] w-[260px] rounded-md border border-gray-300 bg-gray-50"
                aria-label="Captcha"
              />
              <button
                type="button"
                onClick={refreshCaptcha}
                className="h-10 w-10 rounded-md border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                aria-label="Refresh captcha"
              >
                <RefreshCcw
                  className={`h-5 w-5 ${
                    state.captchaRefreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div> */}
            {/* <Input
              placeholder="Enter captcha *"
              value={state.captchaInput || ""}
              onChange={(e) => handleFormChange("captchaInput", e.target.value)}
              bg="ffffff"
              error={state.errors?.captchaInput}
            /> */}
            
            <Button
              onClick={() => {
                handleRegister();
              }}
              type="button"
              className="bg-[#1E3786] w-full py-3  hover:bg-amber-500  text-white rounded-3xl flex items-center justify-center gap-2"
            >
              {state.btnLoading ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            {/* <div className="text-center text-gray-500 my-4">or</div> */}
            {/* 
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 py-3"
              >
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
                Sign up with Facebook
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 py-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </Button>
            </div> */}

            <div className="text-center mt-6">
              <a
                href="/terms-conditions"
                className="text-gray-500 text-sm hover:text-gray-700"
                target="_blank"
              >
                Terms and condition
              </a>
            </div>
          </div>
        )}
      />

      <Modal
        isOpen={state.isOpenEmailVerify}
        setIsOpen={() => {
          setState({ errors: {}, isOpenEmailVerify: false });
        }}
        hideHeader={true}
        title="Email Verification"
        width="500px"
        renderComponent={() => (
          <div className="space-y-6 bg-[#FFFCF3] py-6 px-10 max-h-[85vh] overflow-y-auto scrollbar-hide rounded rounded-lg">
            <div className="flex items-center justify-center w-full mb-6">
              <img
                src="/assets/images/login.png"
                height={200}
                width={150}
                alt="Email Verification Illustration"
                className="object-contain"
              />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Email Verification
              </h2>
              <p className="text-gray-600 mb-2">
                We've sent an verification to{" "}
                <span className="font-semibold text-gray-900">
                  emailaddress@gmail.com
                </span>{" "}
                to verify your
              </p>
              <p className="text-gray-600">
                email address and activate your account.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Verification Code"
                value={state.verificationCode || ""}
                onChange={(e) =>
                  handleFormChange("verificationCode", e.target.value)
                }
                required
                bg="ffffff"
                error={state.errors?.verificationCode}
              />
            </div>

            <Button
              onClick={() =>
                setState({
                  isOpenForget: true,
                  isOpenEmailVerify: false,
                  isOpenLogin: false,
                  isOpenReg: false,
                })
              }
              type="button"
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-lg flex items-center justify-center gap-2"
            >
              Verify My Account
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Didn't recieve any code!{" "}
                <button className="text-amber-500 hover:text-amber-600 font-medium">
                  Resends
                </button>
              </p>
            </div>

            <div className="text-center mt-6">
              <button className="text-gray-500 text-sm hover:text-gray-700">
                Terms and condition
              </button>
            </div>
          </div>
        )}
      />

      <Modal
        isOpen={state.isOpenForget}
        setIsOpen={() => {
          setState({ errors: {}, isOpenForget: false });
        }}
        hideHeader={true}
        title="Forget Password"
        width="500px"
        renderComponent={() => (
          <div className="space-y-6 bg-[#FFFCF3] py-6 px-10 max-h-[85vh] overflow-y-auto scrollbar-hide rounded rounded-lg">
            <div className="flex items-center justify-center w-full mb-6">
              <img
                src="/assets/images/login.png"
                height={200}
                width={150}
                alt="Forget Password Illustration"
                className="object-contain"
              />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Forget Password
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  Go back to{" "}
                  <button
                    onClick={() =>
                      setState({ isOpenForget: false, isOpenLogin: true })
                    }
                    className="text-amber-500 hover:text-amber-600 font-medium"
                  >
                    Sign In
                  </button>
                </p>
                <p className="text-gray-600 text-sm">
                  Don't have account{" "}
                  <button
                    onClick={() =>
                      setState({
                        isOpenForget: false,
                        isOpenReg: true,
                        captchaValue: generateCaptcha(),
                        captchaInput: "",
                        errors: {},
                      })
                    }
                    className="text-amber-500 hover:text-amber-600 font-medium"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={state.email || ""}
                onChange={(e) => handleFormChange("email", e.target.value)}
                required
                bg="ffffff"
                error={state.errors?.email}
              />
            </div>

            <Button
              onClick={() =>
                setState({
                  isOpenForget: false,
                  isOpenEmailVerify: false,
                  isOpenLogin: false,
                  isOpenReg: false,
                  isOpenReset: true,
                })
              }
              type="button"
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-lg flex items-center justify-center gap-2"
            >
              Reset Password
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="text-center text-gray-500 my-4">or</div>

            {/* <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 py-3"
              >
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
                Sign in with Facebook
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 py-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
            </div> */}

            <div className="text-center mt-6">
              <button className="text-gray-500 text-sm hover:text-gray-700">
                Terms and condition
              </button>
            </div>
          </div>
        )}
      />

      <Modal
        isOpen={state.isOpenReset}
        setIsOpen={() => {
          setState({ errors: {}, isOpenReset: false });
        }}
        hideHeader={true}
        title="Reset Password"
        width="500px"
        renderComponent={() => (
          <div className="space-y-6 bg-[#FFFCF3] py-6 px-10 max-h-[85vh] overflow-y-auto scrollbar-hide rounded rounded-lg">
            <div className="flex items-center justify-center w-full mb-6">
              <img
                src="/assets/images/login.png"
                height={200}
                width={150}
                alt="Reset Password Illustration"
                className="object-contain"
              />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Reset Password
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                Duis luctus interdum metus, ut consectetur ante consectetur sed.
              </p>
              <p className="text-gray-600 text-sm">
                Suspendisse euismod viverra massa sit amet mollis.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="password"
                placeholder="New Password"
                value={state.newPassword || ""}
                onChange={(e) =>
                  handleFormChange("newPassword", e.target.value)
                }
                required
                bg="ffffff"
                error={state.errors?.newPassword}
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={state.confirmPassword || ""}
                onChange={(e) =>
                  handleFormChange("confirmPassword", e.target.value)
                }
                required
                bg="ffffff"
                error={state.errors?.confirmPassword}
              />
            </div>

            <Button
              onClick={() =>
                setState({
                  isOpenForget: false,
                  isOpenEmailVerify: false,
                  isOpenLogin: false,
                  isOpenReg: false,
                  isOpenReset: false,
                })
              }
              type="button"
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-lg flex items-center justify-center gap-2"
            >
              Reset Password
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="text-center mt-6">
              <button className="text-gray-500 text-sm hover:text-gray-700">
                Terms and condition
              </button>
            </div>
          </div>
        )}
      />

      <Modal
        isOpen={state.successRegistraion}
        setIsOpen={() => {
          setState({ errors: {}, successRegistraion: false });
        }}
        title="User Registration"
        width="auto"
        hideHeader={true}
        renderComponent={() => (
          <div className="relative h-fit bg-[#f3f4f6] flex flex-col items-center justify-center text-center p-8 overflow-hidden">
            <h2 className="text-xl font-bold text-green-500 mb-6 z-10">
              Registration Successfull
            </h2>

            <p className="text-gray-600  max-w-lg text-sm leading-relaxed z-10">
              Please Check Your Email Inbox and verify your email address to
              continue
            </p>
          </div>
        )}
      />

      <Modal
        isOpen={state.loginFailModal}
        setIsOpen={() => {
          setState({ loginFailModal: false });
        }}
        title="Login Failed"
        width="auto"
        hideHeader={true}
        renderComponent={() => (
          <div className="relative h-fit bg-[#f3f4f6] flex flex-col items-center justify-center text-center p-8 overflow-hidden">
            <h2 className="text-xl font-bold text-red-500 mb-6 z-10">
              Login Failed
            </h2>

            <p className="text-black font-semibold max-w-lg text-md leading-relaxed z-10">
              {state.loginErrorMessage}
            </p>

            <Button
              onClick={() => {
                setState({
                  loginFailModal: false,
                  // email: "",
                  // password: "",
                  errors: {},
                });
                setLoginCaptchaToken("");
                loginRecaptchaRef.current?.reset();
              }}
              className="mt-6 bg-[#1E3786] hover:bg-[#1E3786]/90 text-white rounded-3xl px-8"
            >
              Try Again
            </Button>
          </div>
        )}
      />

      <Modal
        isOpen={state.registrationFailModal}
        setIsOpen={() => {
          setState({ registrationFailModal: false });
        }}
        title="Registration Failed"
        width="auto"
        hideHeader={true}
        renderComponent={() => (
          <div className="relative h-fit bg-[#f3f4f6] flex flex-col items-center justify-center text-center p-8 overflow-hidden">
            <h2 className="text-xl font-bold text-red-500 mb-6 z-10">
              Registration Failed
            </h2>

            <p className="text-black font-seminibold max-w-lg text-md leading-relaxed z-10">
              {state.registrationErrorMessage}
            </p>

            <Button
              onClick={() => {
                setState({
                  registrationFailModal: false,
                  email: "",
                  password: "",
                  confirmPassword: "",
                  first_name: "",
                  last_name: "",
                  department: "",
                  terms: false,
                  newsletter: false,
                  errors: {},
                });
                setRegisterCaptchaToken("");
                registerRecaptchaRef.current?.reset();
              }}
              className="mt-6 bg-[#1E3786] hover:bg-[#1E3786]/90 text-white rounded-3xl px-8"
            >
              Try Again
            </Button>
          </div>
        )}
      />
    </>
  );
};

export default Header;
