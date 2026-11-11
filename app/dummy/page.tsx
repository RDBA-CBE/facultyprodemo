"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
    Phone,
    Mail,
    MapPin,
    Globe,
    Share2,
    X,
    Lock,
    Check,
} from "lucide-react";
import {
    FaWhatsapp,
    FaLinkedinIn,
    FaTwitter,
    FaFacebookF,
    FaInstagram,
} from "react-icons/fa";

// Sample Data 1: Repute Digital Business Agency (Matches user screenshot media_1792231739703.png)
const SAMPLE_HARIHARAN = {
    id: 3,
    random_id: "CNT-C150IBZHA7",
    created_by: 1,
    first_name: "Hariharan",
    last_name: "M",
    phone: "+91 9876543210, +91 98949 48445",
    email: "hariharan@repute.com, support@repute.com",
    company: "Repute Digital Business Agency",
    title: "Full Stack Golang Engineer",
    department: "Engineering & Product",
    whatsapp_link: "https://wa.me/919876543210",
    whatsapp_text: "+91 9876543210",
    linkedin_link: "https://linkedin.com/in/hariharan-dev",
    linkedin_text: "hariharan-dev",
    twitter_link: "https://twitter.com/hariharan_dev",
    twitter_text: "@hariharan_dev",
    facebook_link: "https://facebook.com/hariharan.official",
    facebook_text: "Hariharan M",
    instagram_link: "https://instagram.com/hariharan.codes",
    instagram_text: "@hariharan.codes",
    website: "https://repute.com",
    addressHeader: "Visit our Office",
    address: "#15/9A, Sabapathi Street, KK Pudur, Coimbatore – 641038, Tamil Nadu.",
    created_at: "2026-10-14T16:02:42.695+05:30",
    updated_at: "2026-10-14T16:02:42.695+05:30",
    photoUri: "",
    logoUri: "",
    companyTagline: "Digital Business Agency",
    designation: "Full Stack Golang Engineer",
    themeColor: "#EA3B2E",
    themeHaloColor: "rgba(234, 59, 46, 0.16)",
    themeGlowColor: "rgba(234, 59, 46, 0.38)",
    topGradient: "radial-gradient(ellipse at 50% 25%, #FF7A6E 0%, #EA3B2E 50%, #C4261B 100%)",
};

// Sample Data 2: Shiva Textiles (Golden yellow theme)
const SAMPLE_AASHISH = {
    id: 1,
    random_id: "CNT-A100STX",
    created_by: 1,
    first_name: "Aashish",
    last_name: "Saravanan",
    phone: "+91 98949 48445, +91 98765 43210",
    email: "aashish@shivatextiles.in, info@shivatextiles.in",
    company: "Shiva Textiles",
    title: "Chief Operating Officer",
    department: "Executive Operations",
    whatsapp_link: "https://wa.me/919894948445",
    whatsapp_text: "+91 98949 48445",
    linkedin_link: "https://linkedin.com/in/aashish-saravanan",
    linkedin_text: "aashish-saravanan",
    twitter_link: "https://twitter.com/shivatextiles",
    twitter_text: "@shivatextiles",
    facebook_link: "https://facebook.com/shivatextiles",
    facebook_text: "Shiva Textiles",
    instagram_link: "https://instagram.com/shivatextiles",
    instagram_text: "Instagram",
    website: "https://shivatextiles.in",
    addressHeader: "Visit our Office",
    address: "567- 568, DR. NANJAPPA ROAD, Ram Nagar, Gandhipuram, Coimbatore, Tamil Nadu 641018",
    created_at: "2026-10-14T16:02:42.695+05:30",
    updated_at: "2026-10-14T16:02:42.695+05:30",
    photoUri: "",
    logoUri: "",
    companyTagline: "New Experience Every Time...",
    designation: "Chief Operating Officer",
    themeColor: "#FFC631",
    themeHaloColor: "rgba(255, 198, 49, 0.22)",
    themeGlowColor: "rgba(255, 198, 49, 0.45)",
    topGradient: "radial-gradient(ellipse at 50% 25%, #FEE8A2 0%, #F5BE4C 45%, #E2961D 100%)",
};

export default function DummyPage() {
    const [activeProfile, setActiveProfile] = useState<"hariharan" | "aashish">("hariharan");
    const contact = activeProfile === "hariharan" ? SAMPLE_HARIHARAN : SAMPLE_AASHISH;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Form input state
    const [leadForm, setLeadForm] = useState({
        name: "",
        email: "",
        phone: "",
    });

    // Countdown for 10-second modal popup
    const [secondsLeft, setSecondsLeft] = useState(10);
    const hasTriggeredRef = useRef(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (!hasTriggeredRef.current) {
                        hasTriggeredRef.current = true;
                        setIsModalOpen(true);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Multi-burst celebration confetti
    const triggerCelebration = () => {
        confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.45 },
            colors: [contact.themeColor, "#3B82F6", "#10B981", "#EC4899", "#8B5CF6", "#F59E0B"],
            zIndex: 99999,
        });

        const end = Date.now() + 2200;
        const interval: any = setInterval(() => {
            if (Date.now() > end) {
                return clearInterval(interval);
            }
            confetti({
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                origin: { x: Math.random(), y: Math.random() - 0.2 },
                colors: [contact.themeColor, "#3B82F6", "#10B981", "#EF4444", "#EAB308"],
                zIndex: 99999,
            });
        }, 200);
    };

    // Generate & download .vcf contact card
    const handleSaveContact = () => {
        const phoneList = (contact.phone || "").split(",").map((p) => p.trim()).filter(Boolean);
        const emailList = (contact.email || "").split(",").map((e) => e.trim()).filter(Boolean);

        const vCardLines = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `N:${contact.last_name || ""};${contact.first_name || ""};;;`,
            `FN:${contact.first_name || ""} ${contact.last_name || ""}`.trim(),
            `ORG:${contact.company || ""};${contact.department || ""}`,
            `TITLE:${contact.designation || contact.title || ""}`,
            ...phoneList.map((num) => `TEL;TYPE=CELL,VOICE:${num}`),
            ...emailList.map((em) => `EMAIL;TYPE=INTERNET,WORK:${em}`),
            `URL:${contact.website || ""}`,
            `ADR;TYPE=WORK:;;${(contact.address || "").replace(/,/g, "\\,")};;;;`,
            `NOTE:${contact.companyTagline || ""}`,
            contact.whatsapp_link ? `X-SOCIALPROFILE;type=whatsapp:${contact.whatsapp_link}` : "",
            contact.linkedin_link ? `X-SOCIALPROFILE;type=linkedin:${contact.linkedin_link}` : "",
            contact.twitter_link ? `X-SOCIALPROFILE;type=twitter:${contact.twitter_link}` : "",
            contact.instagram_link ? `X-SOCIALPROFILE;type=instagram:${contact.instagram_link}` : "",
            contact.facebook_link ? `X-SOCIALPROFILE;type=facebook:${contact.facebook_link}` : "",
            "END:VCARD",
        ]
            .filter(Boolean)
            .join("\r\n");

        const blob = new Blob([vCardLines], { type: "text/vcard;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
            "download",
            `${contact.first_name || "Contact"}_${contact.last_name || ""}.vcf`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        triggerCelebration();
        setShowSuccessToast(true);
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        
    };

    const handleLeadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsModalOpen(false);
        triggerCelebration();
        setShowSuccessToast(true);
    };

    useEffect(() => {
        if (showSuccessToast) {
            const toastTimer = setTimeout(() => {
                setShowSuccessToast(false);
            }, 6000);
            return () => clearTimeout(toastTimer);
        }
    }, [showSuccessToast]);

    const handleShare = async () => {
        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({
                    title: `${contact.first_name} ${contact.last_name} - ${contact.company}`,
                    text: `Contact card for ${contact.first_name} ${contact.last_name}`,
                    url: window.location.href,
                });
            } catch {
                // Ignored
            }
        } else if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#E9ECF0] text-gray-800 flex flex-col items-center justify-start py-6 px-3 sm:px-4 pb-36 select-none sm:select-auto">
            {/* Custom CSS: Exact HiHello Nunito Sans Font & Halo Aura Breathing Animation */}
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,300;0,6..12,400;0,6..12,600;0,6..12,700;0,6..12,800;1,6..12,300;1,6..12,400;1,6..12,600&display=swap');

                .nfc-card-root,
                .nfc-card-root *,
                .nfc-modal-root,
                .nfc-modal-root * {
                    font-family: 'Nunito Sans', -apple-system, system-ui, sans-serif !important;
                }

                @keyframes shimmerEffect {
                    0% {
                        transform: translateX(-120%);
                    }
                    40%,
                    100% {
                        transform: translateX(140%);
                    }
                }
                .shimmer-sweep {
                    animation: shimmerEffect 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }

                /* Old button pulse animation */
                @keyframes pulseGlow {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 6px 16px -3px rgba(234, 59, 46, 0.35);
                    }
                    50% {
                        transform: scale(1.02);
                        box-shadow: 0 10px 22px 0px rgba(234, 59, 46, 0.55);
                    }
                }
                .btn-pulse-glow {
                    animation: pulseGlow 2.4s ease-in-out infinite;
                }

                /* New Frosted Halo Aura Breathing Animation (from latest screenshot) */
                @keyframes haloBreathing {
                    0%, 100% {
                        box-shadow: 0 0 16px 2px ${contact.themeGlowColor || "rgba(234, 59, 46, 0.22)"}, 0 4px 12px rgba(0, 0, 0, 0.05);
                        transform: scale(1);
                    }
                    50% {
                        box-shadow: 0 0 32px 8px ${contact.themeGlowColor || "rgba(234, 59, 46, 0.42)"}, 0 6px 16px rgba(0, 0, 0, 0.08);
                        transform: scale(1.018);
                    }
                }
                .save-button-halo {
                    animation: haloBreathing 2.4s ease-in-out infinite;
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                }
            `}</style>

            {/* Profile Switcher (Top quick switcher for testing both themes) */}
            <div className="w-full max-w-[420px] mb-3 flex items-center justify-between px-2 text-xs font-semibold text-gray-500">
                <span>Theme:</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveProfile("hariharan")}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                            activeProfile === "hariharan"
                                ? "bg-[#EA3B2E] text-white shadow-xs"
                                : "bg-white/80 hover:bg-white text-gray-700"
                        }`}
                    >
                        Repute (Red)
                    </button>
                    <button
                        onClick={() => setActiveProfile("aashish")}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                            activeProfile === "aashish"
                                ? "bg-[#FFC631] text-white shadow-xs"
                                : "bg-white/80 hover:bg-white text-gray-700"
                        }`}
                    >
                        Shiva (Yellow)
                    </button>
                </div>
            </div>

            {/* ======================================================== */}
            {/* MAIN CARD CONTAINER (Entire Card Bottom Fully Visible)   */}
            {/* ======================================================== */}
            <div className="nfc-card-root w-full max-w-[420px] bg-white rounded-[24px] sm:rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col relative border border-gray-200/60 pb-6 mb-4">

                {/* ======================================================== */}
                {/* SUCCESS MESSAGE BANNER                                   */}
                {/* ======================================================== */}
                {showSuccessToast && (
                    <div className="absolute top-4 inset-x-4 z-40 animate-in slide-in-from-top-4 duration-300">
                        <div className="bg-[#D1F4E0] border border-[#A6E7C6] rounded-2xl px-4 py-3 shadow-lg flex items-center justify-between text-emerald-950 backdrop-blur-md">
                            <div className="flex items-center space-x-3">
                                <div className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center text-white shrink-0 shadow-xs">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                                <div>
                                    <h4 className="text-[14px] font-bold tracking-tight text-emerald-900 leading-none">
                                        Congratulations
                                    </h4>
                                    <p className="text-[12px] text-emerald-800/90 font-medium mt-1">
                                        You made a new connection!
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSuccessToast(false)}
                                className="text-emerald-700 hover:text-emerald-950 p-1 rounded-full hover:bg-emerald-200/50 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* 1. TOP BANNER WITH LOGO & EXACT HIHELLO WAVE             */}
                {/* ======================================================== */}
                <div
                    className="relative w-full pt-10 pb-0 flex flex-col items-center justify-center overflow-hidden"
                    style={{
                        background: contact.topGradient,
                    }}
                >
                    {/* Share Button (Top Left) */}
                    <button
                        onClick={handleShare}
                        className="absolute top-3.5 left-4 z-20 w-8 h-8 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center text-white backdrop-blur-sm transition-all shadow-xs cursor-pointer"
                        title="Share card"
                    >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                    </button>

                    {/* BRANDING: Circular Badge + Silhouette + Company Name */}
                    <div className="relative z-10 flex flex-col items-center text-center px-6">
                        {activeProfile === "aashish" ? (
                            <>
                                {/* Arched Text: "SINCE 1977" */}
                                <div
                                    className="text-[11px] font-extrabold tracking-[0.22em] text-[#522D04] uppercase mb-1 drop-shadow-xs"
                                    style={{ letterSpacing: "0.22em" }}
                                >
                                    SINCE 1977
                                </div>

                                {/* Silhouette Oval Badge */}
                                <div className="w-15 h-19 bg-[#D81B60] rounded-[38px] flex items-center justify-center shadow-md border-2 border-[#FCE9BF]/50 relative overflow-hidden mb-2">
                                    <svg
                                        viewBox="0 0 100 130"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-10 h-14"
                                    >
                                        <circle cx="51" cy="22" r="9" fill="#FEE8A2" />
                                        <circle cx="45" cy="18" r="4.5" fill="#FEE8A2" />
                                        <path
                                            d="M51,32 C46,32 42,42 43,56 C44,68 38,82 43,105 C46,118 48,122 51,122 C53,122 56,112 55,95 C54,82 59,70 58,54 C57,42 55,32 51,32 Z"
                                            fill="#FEE8A2"
                                        />
                                        <path
                                            d="M44,60 C40,75 36,92 42,114 C44,102 46,88 50,74 C47,68 45,64 44,60 Z"
                                            fill="#FEE8A2"
                                            opacity="0.9"
                                        />
                                    </svg>
                                </div>

                                <h2 className="text-[26px] sm:text-[28px] font-extrabold text-[#231204] tracking-tight leading-tight">
                                    {contact.company}
                                </h2>

                                <div className="flex items-center space-x-1.5 text-[12px] sm:text-[13px] font-semibold text-[#663507] mt-1">
                                    <span className="text-[#D81B60] text-sm">🌸</span>
                                    <span>{contact.companyTagline}</span>
                                    <span className="text-[#D81B60] text-sm">🌸</span>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Repute Digital Business Agency Logo Emblem */}
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/40 mb-3">
                                    <span className="text-white text-3xl font-black tracking-tight">R</span>
                                </div>

                                <h2 className="text-[24px] sm:text-[26px] font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                                    {contact.company}
                                </h2>

                                <div className="flex items-center space-x-1.5 text-[13px] font-medium text-white/90 mt-1">
                                    <span>{contact.companyTagline}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* EXACT WAVE SVG FROM HIHELLO SOURCE CODE */}
                    <div className="relative w-full -mb-[1px] mt-6 leading-none pointer-events-none">
                        <svg
                            preserveAspectRatio="xMinYMax meet"
                            viewBox="0 0 246 57"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-auto block"
                        >
                            {/* White right curve cutout */}
                            <path
                                clipRule="evenodd"
                                d="M 214.7168,6.1113281 C 195.65271,5.9023124 172.37742,11.948182 137.87305,32.529297 110.16613,49.05604 86.980345,56.862784 65.015625,57 H 65 v 1 H 246 V 11.453125 C 236.0775,8.6129313 226.15525,6.2367376 214.7168,6.1113281 Z"
                                fill="white"
                                fillRule="evenodd"
                            />
                            {/* White left curve cutout */}
                            <path
                                clipRule="evenodd"
                                d="M 0,35.773438 V 58 H 65 L 64.97852,57 C 43.192081,57.127508 22.605139,49.707997 0,35.773438 Z "
                                fill="white"
                                fillRule="evenodd"
                            />
                            {/* Dynamic Accent Ribbon matching theme */}
                            <path
                                clipRule="evenodd"
                                d="m 0,16.7221 v 19.052 C 45.4067,63.7643 82.6667,65.4583 137.873,32.5286 193.08,-0.401184 219.54,3.87965 246,11.4535 V 6.51403 C 185.24,-16.8661 135.913,29.331 97.6933,40.8564 59.4733,52.3818 33.6467,44.1494 0,16.7221 Z "
                                fill={contact.themeColor}
                                fillRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>

                {/* ======================================================== */}
                {/* 2. PROFILE DETAILS (CardIdentity: 1px dashed black)      */}
                {/* ======================================================== */}
                <div className="px-6 pt-3 pb-3 bg-white">
                    <div
                        className="py-0.5"
                        style={{
                            borderLeft: "1px dashed black",
                            paddingLeft: "1.5rem",
                        }}
                    >
                        {/* CardName: font-size: 1.75rem (28px), font-weight: 800, line-height: 2.25rem (36px) */}
                        <h1
                            className="text-[#171923] tracking-normal"
                            style={{
                                fontSize: "1.75rem",
                                fontWeight: 800,
                                lineHeight: "2.25rem",
                                letterSpacing: "normal",
                            }}
                        >
                            {contact.first_name} {contact.last_name}
                        </h1>

                        {/* CardTitle: font-size: 1.1rem (17.6px), font-weight: 600, line-height: 1.5rem (24px) */}
                        <div className="mt-0.5">
                            <span
                                className="text-[#171923] whitespace-pre-wrap"
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 600,
                                    lineHeight: "1.5rem",
                                    letterSpacing: "normal",
                                }}
                            >
                                {contact.designation || contact.title}
                            </span>
                        </div>

                        {/* CardCompany: font-size: 1.1rem (17.6px), font-style: italic, font-weight: 300, line-height: 1.5rem */}
                        <div className="mt-0.5">
                            <span
                                className="text-[#171923]"
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 300,
                                    fontStyle: "italic",
                                    lineHeight: "1.5rem",
                                    letterSpacing: "normal",
                                }}
                            >
                                {contact.company}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* 3. VERTICAL LIST: ONLY PHONE, EMAIL, ADDRESS, WEBSITE (CardFieldText)    */}
                {/* ========================================================================= */}
                <div className="px-6 py-1 space-y-1 bg-white">

                    {/* 1. Phone */}
                    {contact.phone && (
                        <div className="flex items-start group py-2 rounded-xl hover:bg-black/[0.03] transition-colors">
                            <div
                                className="rounded-full flex items-center justify-center text-white shrink-0"
                                style={{
                                    backgroundColor: contact.themeColor,
                                    width: "2.625rem",
                                    height: "2.625rem",
                                    marginRight: "0.8125rem",
                                }}
                            >
                                <Phone className="w-5 h-5 fill-current" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div
                                    className="text-[#171923] leading-normal flex flex-wrap gap-x-1.5 gap-y-0.5"
                                    style={{
                                        fontSize: "1.1rem",
                                        lineHeight: "1.5rem",
                                        fontWeight: 400,
                                        letterSpacing: "normal",
                                    }}
                                >
                                    {contact.phone.split(",").map((num, idx, arr) => {
                                        const cleanNum = num.trim();
                                        return (
                                            <span key={idx} className="inline-flex items-center">
                                                <a
                                                    href={`tel:${cleanNum.replace(/\s+/g, "")}`}
                                                    className="hover:underline transition-colors"
                                                    style={{ color: "inherit" }}
                                                >
                                                    {cleanNum}
                                                </a>
                                                {idx < arr.length - 1 && <span className="text-gray-400">,</span>}
                                            </span>
                                        );
                                    })}
                                </div>
                                <p
                                    className="text-[#68768D]"
                                    style={{
                                        fontSize: "1rem",
                                        lineHeight: "1.5rem",
                                        fontWeight: 300,
                                        letterSpacing: "normal",
                                    }}
                                >
                                    work
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 2. Email */}
                    {contact.email && (
                        <div className="flex items-start group py-2 rounded-xl hover:bg-black/[0.03] transition-colors">
                            <div
                                className="rounded-full flex items-center justify-center text-white shrink-0"
                                style={{
                                    backgroundColor: contact.themeColor,
                                    width: "2.625rem",
                                    height: "2.625rem",
                                    marginRight: "0.8125rem",
                                }}
                            >
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div
                                    className="text-[#171923] leading-normal flex flex-wrap gap-x-1.5 gap-y-0.5"
                                    style={{
                                        fontSize: "1.1rem",
                                        lineHeight: "1.5rem",
                                        fontWeight: 400,
                                        letterSpacing: "normal",
                                    }}
                                >
                                    {contact.email.split(",").map((em, idx, arr) => {
                                        const cleanEmail = em.trim();
                                        return (
                                            <span key={idx} className="inline-flex items-center">
                                                <a
                                                    href={`mailto:${cleanEmail}`}
                                                    className="hover:underline transition-colors break-all"
                                                    style={{ color: "inherit" }}
                                                >
                                                    {cleanEmail}
                                                </a>
                                                {idx < arr.length - 1 && <span className="text-gray-400">,</span>}
                                            </span>
                                        );
                                    })}
                                </div>
                                <p
                                    className="text-[#68768D]"
                                    style={{
                                        fontSize: "1rem",
                                        lineHeight: "1.5rem",
                                        fontWeight: 300,
                                        letterSpacing: "normal",
                                    }}
                                >
                                    work
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 3. Address (Exact layout matching user screenshot media_1792231739703.png) */}
                    {contact.address && (
                        <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(
                                `${contact.company}, ${contact.address}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start group py-2 rounded-xl hover:bg-black/[0.03] transition-colors"
                        >
                            <div
                                className="rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
                                style={{
                                    backgroundColor: contact.themeColor,
                                    width: "2.625rem",
                                    height: "2.625rem",
                                    marginRight: "0.8125rem",
                                }}
                            >
                                <MapPin className="w-5 h-5 fill-current" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-[#171923] whitespace-pre-wrap leading-normal"
                                    style={{
                                        fontSize: "1.1rem",
                                        lineHeight: "1.5rem",
                                        fontWeight: 400,
                                        letterSpacing: "normal",
                                    }}
                                >
                                    {contact.addressHeader && (
                                        <span className="block font-normal">{contact.addressHeader}</span>
                                    )}
                                    {contact.company && <span className="block">{contact.company}</span>}
                                    <span>{contact.address}</span>
                                </p>
                                <p
                                    className="text-[#68768D] mt-0.5"
                                    style={{
                                        fontSize: "1rem",
                                        lineHeight: "1.5rem",
                                        fontWeight: 300,
                                        letterSpacing: "normal",
                                    }}
                                >
                                    work
                                </p>
                            </div>
                        </a>
                    )}

                    {/* 4. Website */}
                    {contact.website && (
                        <a
                            href={contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center group py-2 rounded-xl hover:bg-black/[0.03] transition-colors"
                        >
                            <div
                                className="rounded-full flex items-center justify-center text-white shrink-0"
                                style={{
                                    backgroundColor: contact.themeColor,
                                    width: "2.625rem",
                                    height: "2.625rem",
                                    marginRight: "0.8125rem",
                                }}
                            >
                                <Globe className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-[#171923] leading-normal break-all"
                                    style={{
                                        fontSize: "1.1rem",
                                        lineHeight: "1.5rem",
                                        fontWeight: 400,
                                        letterSpacing: "normal",
                                    }}
                                >
                                    {contact.website.replace(/^https?:\/\//, "")}
                                </p>
                                <p
                                    className="text-[#68768D]"
                                    style={{
                                        fontSize: "1rem",
                                        lineHeight: "1.5rem",
                                        fontWeight: 300,
                                        letterSpacing: "normal",
                                    }}
                                >
                                    website
                                </p>
                            </div>
                        </a>
                    )}

                </div>

                {/* ========================================================================= */}
                {/* 4. SOCIAL MEDIA ICONS: CENTERED HORIZONTAL ROW                             */}
                {/* ========================================================================= */}
                <div className="pt-4 pb-2 px-6 flex flex-col items-center justify-center bg-white">
                    <div className="flex items-center justify-center gap-3.5 sm:gap-4 flex-wrap">
                        {contact.whatsapp_link && (
                            <a
                                href={contact.whatsapp_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="WhatsApp"
                                className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                                style={{ backgroundColor: contact.themeColor }}
                                title="WhatsApp"
                            >
                                <FaWhatsapp className="w-5 h-5" />
                            </a>
                        )}

                        {contact.linkedin_link && (
                            <a
                                href={contact.linkedin_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                                style={{ backgroundColor: contact.themeColor }}
                                title="LinkedIn"
                            >
                                <FaLinkedinIn className="w-5 h-5" />
                            </a>
                        )}

                        {contact.twitter_link && (
                            <a
                                href={contact.twitter_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Twitter"
                                className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                                style={{ backgroundColor: contact.themeColor }}
                                title="Twitter"
                            >
                                <FaTwitter className="w-5 h-5" />
                            </a>
                        )}

                        {contact.facebook_link && (
                            <a
                                href={contact.facebook_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                                style={{ backgroundColor: contact.themeColor }}
                                title="Facebook"
                            >
                                <FaFacebookF className="w-5 h-5" />
                            </a>
                        )}

                        {contact.instagram_link && (
                            <a
                                href={contact.instagram_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                                style={{ backgroundColor: contact.themeColor }}
                                title="Instagram"
                            >
                                <FaInstagram className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>

            </div>

            {/* ========================================================================= */}
            {/* 5. FIXED SAVE CONTACT BUTTON WITH FROSTED HALO AURA ANIMATION             */}
            {/* ========================================================================= */}
            <div className="fixed bottom-5 left-0 right-0 z-30 flex flex-col items-center justify-center pointer-events-none px-4">
                <div className="w-full max-w-[420px] flex flex-col items-center pointer-events-auto">
                    {/* Halo Glow Box (Exact shape & translucent coral/yellow halo from screenshot) */}
                    <div
                        className="save-button-halo relative w-full max-w-[360px] p-2.5 rounded-[20px] flex items-center justify-center"
                        style={{
                            backgroundColor: contact.themeHaloColor || "rgba(234, 59, 46, 0.16)",
                        }}
                    >
                        {/* The Primary Button */}
                        <button
                            id="save-contact-btn"
                            onClick={handleSaveContact}
                            className="relative w-full h-[50px] sm:h-[52px] rounded-[12px] flex items-center justify-center gap-2.5 px-6 shadow-md hover:brightness-105 active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden"
                            style={{ backgroundColor: contact.themeColor || "#EA3B2E" }}
                        >
                            {/* Subtle shimmer sweep across button */}
                            <div className="shimmer-sweep absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 pointer-events-none" />

                            {/* Tray Download Icon matching user screenshot [ ↓ ] */}
                            <svg
                                className="w-5 h-5 text-white shrink-0 stroke-[2.4]"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
                                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                            </svg>

                            {/* Button Text */}
                            <span
                                className="tracking-wider uppercase select-none font-bold text-white text-[15px] sm:text-base leading-none"
                                style={{
                                    letterSpacing: "0.05em",
                                    fontWeight: 700,
                                }}
                            >
                                SAVE CONTACT
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* 6. 10-SECOND MODAL FORM (HiHello Lead Capture)           */}
            {/* ======================================================== */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
                    <div
                        className="nfc-modal-root bg-white rounded-[28px] sm:rounded-[32px] w-full max-w-[400px] p-7 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.25)] relative animate-in zoom-in-95 duration-200 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header: Title (2 lines) + Skip */}
                        <div className="flex items-start justify-between mb-6">
                            <h3
                                className="text-[#111827] font-extrabold tracking-tight leading-[1.25] pr-2"
                                style={{ fontSize: "1.375rem" }}
                            >
                                Share your information with
                                <span className="block mt-0.5">{contact.first_name}.</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-[15px] font-semibold text-[#4B5563] hover:text-[#111827] pt-0.5 px-1 transition-colors shrink-0 cursor-pointer"
                            >
                                Skip
                            </button>
                        </div>

                        {/* Clean minimalist form matching screenshot */}
                        <form onSubmit={handleLeadSubmit} className="space-y-6">

                            {/* Field 1: Your name */}
                            <div className="space-y-1">
                                <label className="block text-[13px] text-[#9CA3AF] font-medium tracking-normal">
                                    Your name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={leadForm.name}
                                    onChange={(e) =>
                                        setLeadForm({ ...leadForm, name: e.target.value })
                                    }
                                    placeholder="Your Name"
                                    className="w-full border-b border-[#E5E7EB] focus:border-[#93C5FD] outline-none pb-2 pt-0.5 text-[15px] text-[#111827] bg-transparent transition-colors placeholder:text-[#D1D5DB]"
                                />
                            </div>

                            {/* Field 2: Your email (with envelope icon) */}
                            <div className="space-y-1">
                                <label className="block text-[13px] text-[#9CA3AF] font-medium tracking-normal">
                                    Your email
                                </label>
                                <div className="flex items-center border-b border-[#E5E7EB] focus-within:border-[#93C5FD] transition-colors pb-2 pt-0.5">
                                    <Mail className="w-[18px] h-[18px] text-[#9CA3AF] stroke-[1.8] mr-2.5 shrink-0" />
                                    <input
                                        type="email"
                                        required
                                        value={leadForm.email}
                                        onChange={(e) =>
                                            setLeadForm({ ...leadForm, email: e.target.value })
                                        }
                                        placeholder="email@example.com"
                                        className="w-full outline-none text-[15px] text-[#111827] bg-transparent transition-colors placeholder:text-[#D1D5DB]"
                                    />
                                </div>
                            </div>

                            {/* Field 3: Your phone number (with 🇮🇳 flag and phone receiver icon) */}
                            <div className="space-y-1">
                                <label className="block text-[13px] text-[#9CA3AF] font-medium tracking-normal">
                                    Your phone number
                                </label>
                                <div className="flex items-center border-b border-[#E5E7EB] focus-within:border-[#93C5FD] transition-colors pb-2 pt-0.5">
                                    <span className="text-[17px] leading-none select-none mr-2">🇮🇳</span>
                                    <Phone className="w-4 h-4 text-[#9CA3AF] stroke-[1.8] mr-2.5 shrink-0" />
                                    <input
                                        type="tel"
                                        value={leadForm.phone}
                                        onChange={(e) =>
                                            setLeadForm({ ...leadForm, phone: e.target.value })
                                        }
                                        placeholder="+91 98765 43210"
                                        className="w-full outline-none text-[15px] text-[#111827] bg-transparent placeholder:text-[#D1D5DB]"
                                    />
                                </div>
                            </div>

                            {/* Action Button: Continue (Sky Blue #93C5FD) */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full h-[48px] rounded-[14px] font-bold text-white text-[15px] bg-[#E50914] hover:bg-[#E50914] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center tracking-normal shadow-none"
                                >
                                    Continue
                                </button>
                            </div>

                            {/* Privacy footer with amber lock */}
                            <div className="flex items-center justify-center space-x-2 pt-1 pb-1">
                                <Lock className="w-4 h-4 text-[#F59E0B] stroke-[2] shrink-0" />
                                <span className="text-[14px] text-[#1F2937] font-medium">
                                    Your data will always be kept private.
                                </span>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}