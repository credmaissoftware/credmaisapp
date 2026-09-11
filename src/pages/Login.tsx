import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { hasPortalSession } from "@/lib/portalSession";
import { z } from "zod";
import ConstellationBackground from "@/components/ConstellationBackground";
import defaultLogo from "@/assets/credmais-cplus-logo.jpg";
import { supabase } from "@/integrations/supabase/client";
import { setRememberMe, getRememberMe } from "@/integrations/supabase/remember";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Globe,
  Users,
  BarChart3,
  ShieldCheck,
  MonitorSmartphone,
} from "lucide-react";
import { useWhiteLabel } from "@/contexts/WhiteLabelContext";
import { toSafeHttpUrl } from "@/lib/safeUrl";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { withTimeout } from "@/lib/withTimeout";

// ---------- ValidaÃ§Ã£o ----------
const emailSchema = z
  .string()
  .trim()
  .min(1, "Informe seu e-mail")
  .email("E-mail invÃ¡lido")
  .max(255, "E-mail muito longo");

const passwordLoginSchema = z
  .string()
  .min(1, "Informe sua senha")
  .max(72, "Senha muito longa");

const passwordRegisterSchema = z
  .string()
  .min(6, "Use no mÃ­nimo 6 caracteres")
  .max(72, "Senha muito longa");

const AUTH_REQUEST_TIMEOUT_MS = 15_000;

const nameSchema = z
  .string()
  .trim()
  .min(2, "Informe seu nome (mÃ­n. 2 caracteres)")
  .max(80, "Nome muito longo");

// ---------- TraduÃ§Ã£o de erros do Supabase ----------
const friendlyAuthError = (err: any): string => {
  const msg = String(err?.message || "").toLowerCase();
  const code = String(err?.code || "").toLowerCase();
  if (code.includes("invalid_credentials") || msg.includes("invalid login"))
    return "E-mail ou senha incorretos.";
  if (msg.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar.";
  if (code === "user_already_exists" || msg.includes("already registered") || msg.includes("user already"))
    return "Este e-mail jÃ¡ estÃ¡ cadastrado. FaÃ§a login.";
  if (msg.includes("rate limit") || err?.status === 429)
    return "Muitas tentativas. Aguarde alguns minutos.";
  if (msg.includes("weak password"))
    return "Senha fraca. Use letras e nÃºmeros.";
  if (msg.includes("network") || msg.includes("failed to fetch"))
    return "Sem conexÃ£o. Verifique sua internet.";
  return err?.message || "NÃ£o foi possÃ­vel concluir. Tente novamente.";
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");
  const { settings: platform } = usePlatformSettings();
  const [isRegister, setIsRegister] = useState(!!planParam);

  // Se o dono do app fechar o cadastro, ninguÃ©m fica preso na aba de criar conta
  // (inclusive quem chegou por um link antigo com ?plan=).
  useEffect(() => {
    if (!platform.allow_new_registrations && isRegister) setIsRegister(false);
  }, [platform.allow_new_registrations, isRegister]);
  const [selectedPlan, setSelectedPlan] = useState<"trial" | "paid" | null>(
    planParam === "paid" ? "paid" : planParam === "trial" ? "trial" : null,
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMeState] = useState<boolean>(() => getRememberMe());
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; plan?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean; name?: boolean }>({});
  const navigate = useNavigate();
  // Estes trÃªs ficavam DEPOIS do `return` logo abaixo. Quando `hasPortalSession()`
  // mudava de valor entre dois renders â€” Ã© o que acontece ao sair do portal do
  // cliente neste mesmo navegador â€” a quantidade de hooks mudava junto e o React
  // derrubava a tela de login inteira (erro #310).
  const { toast } = useToast();
  const { config } = useWhiteLabel();

  // Se este navegador possui sessÃ£o do portal do cliente, nÃ£o permitir acesso
  // Ã  tela de login do credor â€” devolve o cliente ao portal dele.
  const temSessaoDoPortal = hasPortalSession();

  const sanitizeNext = (raw: string | null): string | null => {
    if (!raw) return null;
    if (!raw.startsWith("/")) return null;
    if (raw.startsWith("//") || raw.startsWith("/\\")) return null;
    if (raw.toLowerCase().startsWith("/login") || raw.toLowerCase().startsWith("/reset-password")) return null;
    return raw;
  };
  const nextPath = sanitizeNext(searchParams.get("next"));
  const logoSrc = config.companyLogo || defaultLogo;
  const brandTitle = config.loginTitle || config.companyName || "CREDMAIS APP";
  const brandSubtitle = config.loginSubtitle || "SISTEMA DE GESTÃƒO DE EMPRÃ‰STIMOS";
  const footerText = config.footerText || `Â© ${new Date().getFullYear()} CREDMAIS APP Â· TODOS OS DIREITOS RESERVADOS`;

  // ForÃ§a da senha (apenas no registro)
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  }, [password]);
  const strengthLabel = ["", "Fraca", "RazoÃ¡vel", "Boa", "Forte"][passwordStrength];
  const strengthColor = [
    "bg-white/10",
    "bg-red-400/80",
    "bg-amber-400/80",
    "bg-yellow-300/80",
    "bg-emerald-400/80",
  ][passwordStrength];

  const validateField = (field: "email" | "password" | "name", value: string) => {
    try {
      if (field === "email") emailSchema.parse(value);
      if (field === "password") (isRegister ? passwordRegisterSchema : passwordLoginSchema).parse(value);
      if (field === "name") nameSchema.parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: err.errors[0]?.message }));
      }
    }
  };

  const validateAll = (mode: "login" | "register"): boolean => {
    const next: typeof errors = {};
    const eRes = emailSchema.safeParse(email);
    if (!eRes.success) next.email = eRes.error.errors[0]?.message;
    if (mode === "login") {
      const pRes = passwordLoginSchema.safeParse(password);
      if (!pRes.success) next.password = pRes.error.errors[0]?.message;
    }
    if (mode === "register") {
      const nRes = nameSchema.safeParse(name);
      if (!nRes.success) next.name = nRes.error.errors[0]?.message;
      // No password / plan validation: account is created after payment confirmation.
    }
    setErrors(next);
    setTouched({ email: true, password: mode === "login", name: mode === "register" });
    return Object.keys(next).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateAll("login")) return;
    setLoading(true);
    setRememberMe(rememberMe);
    let error: { message?: string; code?: string; status?: number } | null = null;
    try {
      ({ error } = await withTimeout(supabase.auth.signInWithPassword({ email: email.trim(), password }), AUTH_REQUEST_TIMEOUT_MS));
    } catch (authError) {
      error = authError as typeof error;
    }
    if (error) {
      setLoading(false);
      const msg = friendlyAuthError(error);
      setFormError(msg);
      toast({ title: "Erro ao entrar", description: msg, variant: "destructive" });
      return;
    }

    // A decisÃ£o de assinatura pertence ao ProtectedRoute, que tambÃ©m considera
    // vitalÃ­cio, administrador e a tabela de assinaturas. Duplicar a regra aqui
    // mandava contas vÃ¡lidas ao checkout antes da verificaÃ§Ã£o completa.
    setLoading(false);
    navigate(nextPath ?? "/dashboard", { replace: true });
  };

  // NEW FLOW: don't create the auth user here. Send the visitor straight to checkout.
  // The Mercado Pago webhook will create the account (invite email) only after a confirmed payment.
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateAll("register")) return;
    setLoading(true);

    try {
      const { data: checkoutUrl } = await supabase.rpc("get_signup_checkout_url");
      if (!checkoutUrl) {
        setLoading(false);
        const msg = "Nenhum link de pagamento configurado. Entre em contato com o suporte.";
        setFormError(msg);
        toast({ title: "IndisponÃ­vel", description: msg, variant: "destructive" });
        return;
      }

      // Pass email + name to the checkout so Mercado Pago can pre-fill and link the payer.
      const checkout = toSafeHttpUrl(checkoutUrl);
      if (!checkout) {
        setLoading(false);
        const msg = "O endereÃ§o de pagamento configurado Ã© invÃ¡lido. Entre em contato com o suporte.";
        setFormError(msg);
        toast({ title: "Pagamento indisponÃ­vel", description: msg, variant: "destructive" });
        return;
      }
      checkout.searchParams.set("email", email.trim());
      if (name.trim()) checkout.searchParams.set("name", name.trim());
      const url = checkout.toString();

      toast({
        title: "Redirecionando para o pagamento ðŸ’³",
        description: "ApÃ³s a confirmaÃ§Ã£o, vocÃª receberÃ¡ um e-mail para criar sua senha e acessar o sistema.",
      });
      setTimeout(() => {
        window.location.href = url;
      }, 1200);
    } catch (err: any) {
      setLoading(false);
      const msg = err?.message || "NÃ£o foi possÃ­vel abrir o checkout. Tente novamente.";
      setFormError(msg);
      toast({ title: "Erro", description: msg, variant: "destructive" });
    }
  };

  // ---------- Estilos ----------
  const inputBase =
    "w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/[0.04] border text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 transition-all duration-200";
  const inputOk = "border-white/[0.08] focus:ring-white/30 focus:border-white/30";
  const inputErr = "border-red-400/40 focus:ring-red-400/40 focus:border-red-400/60";
  const cls = (field: "email" | "password" | "name") =>
    `${inputBase} ${touched[field] && errors[field] ? inputErr : inputOk}`;

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? (
      <p className="mt-1.5 text-[11px] text-red-300/90 flex items-center gap-1.5 animate-fade-in">
        <AlertCircle size={12} className="shrink-0" />
        <span>{msg}</span>
      </p>
    ) : null;

  // O desvio para o portal do cliente acontece aqui embaixo, com todos os hooks
  // jÃ¡ chamados â€” o comportamento Ã© o mesmo de antes, sem o risco de mudar a
  // quantidade de hooks entre um render e outro.
  if (temSessaoDoPortal) {
    return <Navigate to="/portal-cliente" replace />;
  }

  return (
    <div
      className="relative min-h-dvh flex flex-col overflow-x-hidden font-body bg-[#020719] bg-cover bg-center bg-no-repeat px-5 py-6 sm:px-8 lg:px-12"
      style={{
        backgroundImage:
          "linear-gradient(90deg,rgba(2,7,25,.98),rgba(2,7,25,.78) 45%,rgba(2,7,25,.42)), url('/credmais-hero-cinematic-v2.webp')",
      }}
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_18%,rgba(22,139,255,.22),transparent_38%),linear-gradient(180deg,rgba(2,7,25,.08),rgba(2,7,25,.82))] backdrop-blur-[1px]" />
      <ConstellationBackground />

      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium hidden sm:inline">Voltar para o site</span>
      </button>

      <div className="absolute right-8 top-7 z-20 hidden items-center gap-2 text-xs font-medium text-white/75 sm:flex">
        <Globe size={14} /> PortuguÃªs (BR) <span className="ml-2 text-white/45">âŒ„</span>
      </div>

      <div className="absolute left-[5%] top-1/2 z-10 hidden max-w-[390px] -translate-y-1/2 lg:block">
        <div className="mb-5 h-0.5 w-10 bg-sky-400" />
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300/70">Gest&atilde;o de empr&eacute;stimos</p>
        <h2 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white xl:text-5xl">Cr&eacute;dito hoje,<br />mais <span className="text-sky-400">oportunidades</span><br />amanh&atilde;.</h2>
        <p className="mt-5 max-w-[320px] text-base leading-relaxed text-slate-300/75">Solu&ccedil;&otilde;es completas, seguras e inteligentes para voc&ecirc; e o seu neg&oacute;cio.</p>
        <div className="mt-8 space-y-4">
          {[[Users, "GestÃ£o completa", "Controle de clientes e emprÃ©stimos"], [BarChart3, "RelatÃ³rios inteligentes", "Acompanhe tudo em tempo real"], [ShieldCheck, "Mais seguranÃ§a", "Seus dados sempre protegidos"], [MonitorSmartphone, "Acesso em qualquer lugar", "No desktop, tablet ou celular"]].map(([Icon, title, text]) => { const ItemIcon = Icon as typeof Users; return <div key={title as string} className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-300/30 bg-sky-500/15 text-sky-300"><ItemIcon size={20} /></span><span><strong className="block text-sm text-white">{title as string}</strong><small className="text-[11px] text-slate-300/65">{text as string}</small></span></div>; })}
        </div>
      </div>

      {/* Logo & TÃ­tulo */}
      <div className="relative z-10 flex flex-col items-center mb-6 md:mb-8 animate-fade-in lg:hidden">
        <div className="relative w-[78px] h-[78px] md:w-[96px] md:h-[96px] flex items-center justify-center">
          <div className="absolute inset-2 rounded-full gold-glow" />
          <div className="absolute inset-0 rounded-full pointer-events-none">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[hsl(35,100%,54%)] shadow-[0_0_12px_hsl(35,100%,54%)]" />
          </div>
          <img
            src={logoSrc}
            alt={brandTitle}
            width={72}
            height={72}
            className="relative h-[64px] w-[64px] rounded-2xl object-cover ring-1 ring-primary/40 shadow-[0_0_34px_hsl(var(--primary)/.28)] md:h-[76px] md:w-[76px]"
          />
        </div>
        <h1 className="font-display max-w-[92vw] text-xl md:text-2xl font-semibold tracking-tight mt-3 text-gradient-gold text-center">
          {brandTitle} â€” GestÃ£o de EmprÃ©stimos
        </h1>
        <p className="text-white/40 text-[10px] md:text-xs mt-1.5 tracking-wider text-center">{brandSubtitle}</p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[500px] mx-auto animate-scale-in">
        <div className="rounded-[26px] overflow-hidden border border-sky-200/20 bg-slate-950/55 shadow-[0_0_0_1px_rgba(56,189,248,.08),0_30px_90px_rgba(0,0,0,.55),0_0_35px_rgba(14,165,233,.22)] backdrop-blur-2xl">
          <div className="flex flex-col items-center px-6 pt-7 sm:pt-8">
            <img src={logoSrc} alt={brandTitle} className="h-16 w-16 rounded-2xl object-cover ring-1 ring-sky-400/60 shadow-[0_0_28px_rgba(14,165,233,.35)]" />
            <p className="mt-3 text-xl font-bold tracking-tight text-white">CREDMAIS <span className="text-sky-400">APP</span></p>
            <p className="mt-1 text-[9px] tracking-[0.18em] text-white/40">{brandSubtitle}</p>
          </div>
          {!isRegister ? (
            <div className="flex flex-col md:flex-row">
              {/* Form de Login */}
              <div className="flex-1 p-6 sm:p-8 md:p-10 bg-white/[0.025]">
                <div className="mb-7 grid grid-cols-2 border-b border-white/15">
                  <button type="button" onClick={() => setIsRegister(false)} className="relative pb-3 text-sm font-semibold text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-sky-400">Entrar</button>
                  <button type="button" onClick={() => platform.allow_new_registrations && setIsRegister(true)} className="pb-3 text-sm font-semibold text-white/45 transition hover:text-white/80">Criar conta</button>
                </div>
                <h2 className="font-display text-xl font-semibold text-white mb-1">Bem-vindo</h2>
                <p className="text-white/40 text-sm mb-6">Acesse sua conta para continuar</p>

                {formError && (
                  <div
                    role="alert"
                    className="mb-4 p-3 rounded-xl border border-red-400/30 bg-red-500/10 text-red-100 text-xs flex items-start gap-2 animate-fade-in"
                  >
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="login-email" className="text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5 block">
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (touched.email) validateField("email", e.target.value);
                        }}
                        onBlur={() => {
                          setTouched((t) => ({ ...t, email: true }));
                          validateField("email", email);
                        }}
                        aria-invalid={!!(touched.email && errors.email)}
                        aria-describedby={errors.email ? "login-email-err" : undefined}
                        className={cls("email")}
                      />
                    </div>
                    <div id="login-email-err"><FieldError msg={touched.email ? errors.email : undefined} /></div>
                  </div>

                  <div>
                    <label htmlFor="login-password" className="text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5 block">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (touched.password) validateField("password", e.target.value);
                        }}
                        onBlur={() => {
                          setTouched((t) => ({ ...t, password: true }));
                          validateField("password", password);
                        }}
                        aria-invalid={!!(touched.password && errors.password)}
                        aria-describedby={errors.password ? "login-pwd-err" : undefined}
                        className={cls("password") + " pr-11"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div id="login-pwd-err"><FieldError msg={touched.password ? errors.password : undefined} /></div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                      <span className="relative inline-flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMeState(e.target.checked)}
                          className="peer sr-only"
                        />
                        <span className="w-4 h-4 rounded-[5px] border border-white/20 bg-white/[0.04] peer-checked:bg-white/90 peer-checked:border-white/90 transition-all duration-200" />
                        <svg
                          viewBox="0 0 16 16"
                          className="absolute w-3 h-3 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 8.5l3.5 3.5L13 5" />
                        </svg>
                      </span>
                      <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                        Lembrar-me
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(nextPath ? `/reset-password?next=${encodeURIComponent(nextPath)}` : "/reset-password")
                      }
                      className="text-xs text-white/40 hover:text-white/80 transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>


                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-white/10 flex items-center justify-center gap-2"
                    style={{ background: "var(--gradient-button)", color: "hsl(var(--primary-foreground))" }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Entrando...
                      </>
                    ) : (
                      <>
                        Entrar no Sistema <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>


              </div>

              {/* Painel direito */}
              <div className="hidden flex-1 flex-col items-center justify-center p-5 sm:p-7 md:p-10 glass bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/[0.06]">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
                  <ArrowRight size={28} className="text-white/70" />
                </div>
                <h2 className="font-display text-xl font-bold text-white mb-2">
                  {platform.allow_new_registrations ? "Primeira vez?" : "Cadastro fechado"}
                </h2>
                <p className="text-white/40 text-sm text-center mb-6 max-w-[260px]">
                  {platform.allow_new_registrations
                    ? "Crie uma conta gratuita e descubra todas as possibilidades."
                    : "No momento nÃ£o estamos aceitando novos cadastros. Fale com o suporte se jÃ¡ Ã© cliente."}
                </p>
                {platform.allow_new_registrations && (
                  <button
                    onClick={() => {
                      setIsRegister(true);
                      setErrors({});
                      setFormError(null);
                      setTouched({});
                    }}
                    className="px-8 py-2.5 rounded-2xl border border-white/20 text-white/70 text-sm font-medium hover:bg-white/10 transition-all duration-300"
                  >
                    Criar Conta
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 flex flex-col items-center justify-center p-7 md:p-10 glass bg-white/[0.02] border-b md:border-b-0 md:border-r border-white/[0.06]">
                <h2 className="font-display text-xl font-bold text-white mb-2">JÃ¡ tem conta?</h2>
                <p className="text-white/40 text-sm text-center mb-6 max-w-[260px]">
                  Entre com suas credenciais e acesse o sistema.
                </p>
                <button
                  onClick={() => {
                    setIsRegister(false);
                    setErrors({});
                    setFormError(null);
                    setTouched({});
                  }}
                  className="px-8 py-2.5 rounded-2xl border border-white/20 text-white/70 text-sm font-medium hover:bg-white/10 transition-all duration-300"
                >
                  Fazer Login
                </button>
              </div>

              <div className="flex-1 p-7 md:p-10 glass bg-white/[0.03]">
                <h2 className="font-display text-xl font-semibold text-white mb-1">Assinar &amp; criar conta</h2>
                <p className="text-white/40 text-sm mb-4">
                  Pague primeiro com seguranÃ§a. Sua conta Ã© criada automaticamente apÃ³s a confirmaÃ§Ã£o â€” vocÃª recebe um e-mail para definir a senha.
                </p>

                <div className="mb-5 p-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.04] text-[11px] text-amber-100/80 leading-relaxed">
                  <strong className="text-amber-200">Como funciona:</strong> preencha nome e e-mail â†’
                  Ã© redirecionado para o pagamento no Mercado Pago â†’ recebe e-mail de boas-vindas com link para entrar.
                </div>

                {formError && (
                  <div
                    role="alert"
                    className="mb-4 p-3 rounded-xl border border-red-400/30 bg-red-500/10 text-red-100 text-xs flex items-start gap-2 animate-fade-in"
                  >
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="reg-name" className="text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5 block">
                      Nome
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        id="reg-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Nome completo"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (touched.name) validateField("name", e.target.value);
                        }}
                        onBlur={() => {
                          setTouched((t) => ({ ...t, name: true }));
                          validateField("name", name);
                        }}
                        aria-invalid={!!(touched.name && errors.name)}
                        className={cls("name")}
                      />
                    </div>
                    <FieldError msg={touched.name ? errors.name : undefined} />
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5 block">
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (touched.email) validateField("email", e.target.value);
                        }}
                        onBlur={() => {
                          setTouched((t) => ({ ...t, email: true }));
                          validateField("email", email);
                        }}
                        aria-invalid={!!(touched.email && errors.email)}
                        className={cls("email")}
                      />
                    </div>
                    <FieldError msg={touched.email ? errors.email : undefined} />
                    <p className="mt-1.5 text-[10px] text-white/40">
                      Use o mesmo e-mail no checkout para que sua assinatura seja vinculada Ã  sua conta.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-white/10 flex items-center justify-center gap-2"
                    style={{ background: "var(--gradient-button)", color: "white" }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Abrindo checkout...
                      </>
                    ) : (
                      <>
                        Ir para o pagamento <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-white/30 text-center leading-relaxed">
                    Pagamento processado de forma segura pelo Mercado Pago. Sem fidelidade â€” cancele quando quiser.
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="relative z-10 text-white/20 text-[10px] mt-8 tracking-wider text-center px-4">
        {footerText}
      </p>
    </div>
  );
};

export default Login;
