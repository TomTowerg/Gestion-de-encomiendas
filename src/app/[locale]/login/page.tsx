"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, User, Briefcase, Lock, Package } from "lucide-react";

type Role = "CONSERJE" | "RESIDENTE";

export default function LoginPage() {
  const t = useTranslations("Login");
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const roleFromUrl = searchParams.get("role")?.toUpperCase() as Role | null;
  const initialRole: Role =
    roleFromUrl === "CONSERJE" || roleFromUrl === "RESIDENTE"
      ? roleFromUrl
      : "RESIDENTE";

  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);

  useEffect(() => {
    const r = searchParams.get("role")?.toUpperCase() as Role | null;
    if (r === "CONSERJE" || r === "RESIDENTE") setSelectedRole(r);
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        redirect: true,
        callbackUrl: `/api/auth/set-role?role=${selectedRole}&next=/dashboard`,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center font-sans p-4 sm:p-8 relative overflow-hidden bg-[#09090b] selection:bg-[#f59e0b] selection:text-[#09090b]"
    >

      {/* ── Fondo ── */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mockups/fondo_1920_x_1080.png"
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: "cover",
            objectPosition: "center 30%",
            opacity: 0.12,
            filter: "blur(10px) saturate(0.4)",
          }}
          aria-hidden="true"
        />
        {/* Gradiente oscuro */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#09090b]/95 to-[#1a1208]/80" />
        {/* Glow amber suave desde abajo-centro */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-[#f59e0b] rounded-full blur-[140px] opacity-[0.05]" />
      </div>

      {/* ── Tarjeta ── */}
      <div
        className="w-full max-w-md relative z-10"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <div className="bg-[#18181b]/75 backdrop-blur-2xl rounded-2xl border border-white/[0.06] shadow-[0_0_80px_rgba(0,0,0,0.7)] overflow-hidden">

          {/* Línea amber superior */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-50" />

          {/* Glow ambient amber arriba-derecha */}
          <div className="absolute -top-16 right-6 w-40 h-40 bg-[#f59e0b] rounded-full blur-[90px] opacity-[0.07] pointer-events-none" />

          <div className="p-8 sm:p-10">

            {/* ── Volver ── */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase text-white/30 hover:text-[#f59e0b] transition-colors duration-300 mb-10 group w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-300" />
              {t("back")}
            </Link>

            {/* ── Marca ── */}
            <div className="flex items-center gap-3.5 mb-7">
              <div className="w-11 h-11 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-[#f59e0b]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[9px] font-semibold tracking-[0.35em] uppercase text-white/25 mb-0.5">
                  {t("accessTitle")}
                </p>
                <h1
                  className="text-xl font-bold text-[#fafafa] tracking-[0.15em] uppercase leading-none"
                  style={{ fontFamily: "var(--font-syne), sans-serif" }}
                >
                  {t("accessBrand")}
                </h1>
              </div>
            </div>

            <p className="text-white/35 text-xs leading-relaxed tracking-wide mb-8">
              {t("accessSubtitle")}
            </p>

            {/* ── Selector de rol ── */}
            <div className="grid grid-cols-2 gap-3 mb-8">

              {(["RESIDENTE", "CONSERJE"] as Role[]).map((role) => {
                const isSelected = selectedRole === role;
                const Icon = role === "RESIDENTE" ? User : Briefcase;
                const label = role === "RESIDENTE" ? t("residenteLabel") : t("conserjeLabel");
                const subtag = role === "RESIDENTE" ? t("residenteSubtag") : t("conserjeSubtag");

                return (
                  <button
                    key={role}
                    id={`role-${role.toLowerCase()}`}
                    onClick={() => setSelectedRole(role)}
                    aria-pressed={isSelected}
                    className={`py-5 px-3 rounded-xl border flex flex-col items-center justify-center gap-2.5 transition-all duration-300 relative overflow-hidden group ${
                      isSelected
                        ? "border-[#f59e0b]/35 bg-[#f59e0b]/[0.07] text-white shadow-[0_0_24px_rgba(245,158,11,0.08)]"
                        : "border-white/[0.06] bg-white/[0.03] text-white/30 hover:text-white/60 hover:border-white/10 hover:bg-white/[0.05]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-b from-[#f59e0b]/[0.06] to-transparent pointer-events-none" />
                    )}
                    <Icon
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isSelected ? "text-[#f59e0b]" : "text-white/20 group-hover:text-white/45"
                      }`}
                      strokeWidth={1.5}
                    />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase relative">
                      {label}
                    </span>
                    <span
                      className={`text-[9px] tracking-wide font-medium transition-all duration-300 ${
                        isSelected
                          ? "text-[#f59e0b]/55 opacity-100 max-h-4"
                          : "text-transparent opacity-0 max-h-0"
                      }`}
                    >
                      {subtag}
                    </span>
                  </button>
                );
              })}

            </div>

            {/* ── Separador ── */}
            <div className="flex items-center gap-3 mb-6 text-white/18 text-[9px] uppercase tracking-[0.3em] justify-center">
              <div className="flex-1 h-px bg-white/[0.06]" />
              {t("oauthSeparator")}
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* ── Botón Google ── */}
            <button
              id="btn-google-signin"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-[#fafafa] hover:bg-white active:scale-[0.98] text-[#09090b] font-bold py-3.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative group shadow-[0_2px_24px_rgba(0,0,0,0.4)]"
            >
              {isLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#09090b]/20 border-t-[#09090b] animate-spin shrink-0" />
              ) : (
                /* Google logo con colores oficiales */
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span className="text-[11px] tracking-[0.2em] font-bold uppercase">
                {isLoading ? t("signingIn") : t("signInGoogle")}
              </span>
              {!isLoading && (
                <Lock className="absolute right-4 w-3 h-3 text-black/20 group-hover:text-black/40 transition-colors duration-200" />
              )}
            </button>

            {/* ── Nota de privacidad ── */}
            <p className="text-center text-white/18 text-[9px] tracking-wider leading-relaxed mt-6">
              {t("footerText")}
            </p>

          </div>
        </div>
      </div>
    </main>
  );
}
