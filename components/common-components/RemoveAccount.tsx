"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  capitalizeFLetter,
  Failure,
  Success,
  useSetState,
} from "@/utils/function.utils";
import Models from "@/imports/models.import";
import { Loader, ArrowRight, ShieldCheck, X, RefreshCw, Clock } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import * as Yup from "yup";
import * as Validation from "@/utils/validation.utils";
import { Textarea } from "../ui/textarea";

// ─── Constants ────────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;
const OTP_VALIDITY_SECONDS = 900;

// ─── OTP Input ────────────────────────────────────────────────────────────────
const OtpInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  const handleChange = (index: number, char: string) => {
    if (char !== "" && !/^\d$/.test(char)) return;
    const next = digits.map((d, i) => (i === index ? char : d));
    onChange(next.join(""));
    if (char && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const next = digits.map((d, i) => (i === index - 1 ? "" : d));
      onChange(next.join(""));
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`
            w-11 h-12 text-center text-xl font-bold rounded-xl border-2 outline-none
            transition-all duration-200 bg-white caret-transparent
            ${digits[i]
              ? "border-[#1E3786] text-[#1E3786] shadow-md shadow-blue-100"
              : "border-gray-200 text-gray-800"
            }
            focus:border-[#1E3786] focus:shadow-md focus:shadow-blue-100
          `}
        />
      ))}
    </div>
  );
};

// ─── Countdown Ring ───────────────────────────────────────────────────────────
const CountdownRing = ({ seconds, total }: { seconds: number; total: number }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - seconds / total);
  const isUrgent = seconds <= 30;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="5" />
        <circle
          cx="40" cy="40" r={radius} fill="none"
          stroke={isUrgent ? "#EF4444" : "#1E3786"}
          strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <Clock className={`w-3.5 h-3.5 mb-0.5 ${isUrgent ? "text-red-500" : "text-[#1E3786]"}`} />
        <span className={`text-sm font-bold leading-none ${isUrgent ? "text-red-500" : "text-[#1E3786]"}`}>
          {String(Math.floor(seconds / 60)).padStart(2, "0")}:
          {String(seconds % 60).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const RemoveAccount = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [id, setId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // OTP state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(OTP_VALIDITY_SECONDS);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const idFromSearchParams = searchParams.get("id");
      const tokenFromSearchParams = searchParams.get("token");
      if (idFromSearchParams) setId(idFromSearchParams);
      if (tokenFromSearchParams) setToken(tokenFromSearchParams);
    }
  }, [searchParams]);

  const [state, setState] = useSetState({
    deleteAccountEmail: "",
    deleteAccountReason: "",
    deleteAccountErrors: {} as Record<string, string>,
    sendOtpLoading: false,
  });

  // ─── Timer ──────────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    setSecondsLeft(OTP_VALIDITY_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (showOtpModal) {
      startTimer();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showOtpModal, startTimer]);

  // ─── Submit form → send OTP ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    const body = {
      email: (state.deleteAccountEmail || "").trim(),
      phone: (state.deleteAccountPhone || "").trim(),
      reason_text: (capitalizeFLetter(state.deleteAccountReason) || "").trim(),
    };

    try {
      await Validation.deleteAccountSchema.validate(body, { abortEarly: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        error.inner.forEach((err) => { validationErrors[err.path!] = err.message; });
        setState({ deleteAccountErrors: validationErrors });
        return;
      }
      throw error;
    }

    try {
      setState({ sendOtpLoading: true, deleteAccountErrors: {} });
      await Models.profile.delete_account(body);
      setState({ sendOtpLoading: false });
      setOtp("");
      setOtpError("");
      setShowOtpModal(true);
    } catch (err: any) {
      setState({ sendOtpLoading: false });
      Failure(err?.data?.error || err?.error || "Failed to send OTP. Please try again.");
    }
  };

  // ─── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    try {
      setResendLoading(true);
      setOtpError("");
      setOtp("");
      await Models.profile.delete_account({ email: (state.deleteAccountEmail || "").trim() });
      startTimer();
      Success("OTP resent to your email");
    } catch (err: any) {
      Failure(err?.data?.error || err?.error || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  // ─── Verify OTP → delete account ─────────────────────────────────────────────
  const handleVerify = async () => {
    if (otp.length < OTP_LENGTH) { setOtpError("Please enter the complete 6-digit OTP"); return; }
    if (secondsLeft === 0) { setOtpError("OTP has expired. Please request a new one."); return; }
    try {
      setVerifyLoading(true);
      setOtpError("");
      await Models.profile.verify_otp({ email: (state.deleteAccountEmail || "").trim(), otp });
      setShowOtpModal(false);
      Success("Account delete request submitted successfully");
      router.push("/");
    } catch (err: any) {
      setOtpError(err?.data?.error || err?.error || "Invalid OTP. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const isExpired = secondsLeft === 0;

  return (
    <>
      {/* ─── Delete Account Form ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-center min-h-screen bg-clr1">
        <div className="w-full max-w-md space-y-6 bg-[#FFFCF3] py-8 px-10 rounded-xl shadow-2xl">
          <div className="flex items-center justify-center w-full mb-6">
            <img
              src="/assets/images/login.png"
              height={200}
              width={100}
              alt="Delete Account Illustration"
              className="object-contain"
            />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Delete Account Form</h2>
            <p className="text-gray-600 text-sm">Fill your details to delete your account.</p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Input
                type="email"
                name="deleteAccountEmail"
                title="Email"
                value={state.deleteAccountEmail || ""}
                onChange={(e) =>
                  setState({
                    deleteAccountEmail: e.target.value,
                    deleteAccountErrors: { ...state.deleteAccountErrors, email: "" },
                  })
                }
                placeholder="Enter email"
                className="mt-1"
                required
                bg="ffffff"
                error={state.deleteAccountErrors?.email}
              />
            </div>

            <div className="relative">
              <Input
                title="Phone Number"
                value={state.deleteAccountPhone || ""}
                onChange={(e) =>
                  setState({
                    deleteAccountPhone: e.target.value,
                    deleteAccountErrors: { ...state.deleteAccountErrors, phone: "" },
                  })
                }
                placeholder="Enter phone number"
                className="mt-1"
                required
                bg="ffffff"
                error={state.deleteAccountErrors?.phone}
              /> 
            </div>

            <div className="relative">
              <Textarea
                title="Reason"
                value={state.deleteAccountReason || ""}
                onChange={(e) =>
                  setState({
                    deleteAccountReason: e.target.value,
                    deleteAccountErrors: { ...state.deleteAccountErrors, reason_text: "" },
                  })
                }
                placeholder="Tell us why you want to delete this account"
                className="mt-1 min-h-[80px]"
                required
                bg="ffffff"
                error={state.deleteAccountErrors?.reason_text}
              />
            </div>

            
          </div>

          <Button
            onClick={handleSubmit}
            type="button"
            className="w-full py-3 bg-[#1E3786] hover:bg-amber-500 text-white font-bold rounded-3xl flex items-center justify-center gap-2 transition-colors"
            disabled={state.sendOtpLoading}
          >
            {state.sendOtpLoading ? (
              <Loader className="animate-spin w-5 h-5" />
            ) : (
              <>Submit <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </div>

      {/* ─── OTP Modal ───────────────────────────────────────────────────────── */}
      {showOtpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && isExpired) setShowOtpModal(false); }}
        >
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#1E3786] via-blue-400 to-amber-400" />

            <div className="px-7 py-6 space-y-5">
              {isExpired && (
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close OTP modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-[#1E3786]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Verify your identity</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We sent a 6-digit code to<br />
                  <span className="font-semibold text-gray-700">{(state.deleteAccountEmail || "").trim()}</span>
                </p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <CountdownRing seconds={secondsLeft} total={OTP_VALIDITY_SECONDS} />
                {isExpired ? (
                  <p className="text-xs text-red-500 font-medium">OTP expired</p>
                ) : (
                  <p className="text-xs text-gray-400">
                    Code valid for {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
                  </p>
                )}
              </div>

              <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(""); }} />

              {otpError && (
                <p className="text-center text-xs text-red-500 font-medium">{otpError}</p>
              )}

              <Button
                onClick={handleVerify}
                disabled={verifyLoading || isExpired || otp.length < OTP_LENGTH}
                className="w-full py-3 bg-[#1E3786] hover:bg-amber-500 text-white font-bold rounded-3xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {verifyLoading ? (
                  <Loader className="animate-spin w-5 h-5" />
                ) : (
                  <>Verify &amp; Delete Account <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>

              <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                <span>Didn&apos;t receive the code?</span>
                <button
                  onClick={handleResend}
                  disabled={resendLoading || !isExpired}
                  className={`flex items-center gap-1 font-semibold transition-colors ${
                    isExpired
                      ? "text-[#1E3786] hover:text-amber-500 cursor-pointer"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {resendLoading ? (
                    <Loader className="animate-spin w-3.5 h-3.5" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  Resend OTP
                </button>
              </div>

              {isExpired && (
                <p className="text-center text-xs text-gray-400">
                  Timer expired — click &quot;Resend OTP&quot; to get a new code.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RemoveAccount;
