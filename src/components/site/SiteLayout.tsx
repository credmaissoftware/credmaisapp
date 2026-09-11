import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import logo from "@/assets/credmais-cplus-logo.jpg";
import flowVisual from "@/assets/credmais-flow-sculpture-v2.webp";

const NAV = [
  { to: "/inteligencia", label: "Cobrança" },
  { to: "/sobre-credmais", label: "O app" },
  { to: "/missao", label: "Missão" },
  { to: "/planos", label: "Planos" },
];

/** Fine film-grain overlay — keeps the deep navy from looking flat/synthetic. */
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.055] mix-blend-soft-light"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#64B5FF]">
      <span className="h-px w-8 bg-[#168BFF]/65" />
      {children}
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-[#168BFF]/20 bg-[#020719]/85 backdrop-blur-2xl transition-all duration-300">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link to="/" className="group flex items-center gap-3">
          <img
            src={logo}
            alt="CredMais App"
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-[#168BFF]/35 transition-all group-hover:ring-[#168BFF]/70"
            loading="eager"
          />
          <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-white">
            Cred<span className="text-[#168BFF]">Mais</span>
          </span>
        </Link>

        <nav className="hidden items-center md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`relative px-4 py-2 text-[13px] tracking-wide transition-colors ${
                pathname === n.to ? "text-white" : "text-white/55 hover:text-white"
              }`}
            >
              {n.label}
              {pathname === n.to && (
                <span className="absolute inset-x-4 -bottom-[1px] h-px bg-[#168BFF]" />
              )}
            </Link>
          ))}
          <span className="mx-3 h-4 w-px bg-white/10" />
          <Link to="/login" className="px-2 text-[13px] text-white/55 transition-colors hover:text-white">
            Entrar
          </Link>
          <Link
            to="/checkout?plan=completo"
            className="ml-3 rounded-xl bg-[#006FEF] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_0_24px_rgba(0,111,239,.28)] transition-all hover:bg-[#168BFF]"
          >
            Assinar
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#168BFF]/15 bg-[#020719]/98 px-5 py-4 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col">
            {[...NAV, { to: "/login", label: "Entrar" }].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-white/[0.06] py-4 text-[15px] text-white/80"
              >
                {n.label}
                <span className="text-[#168BFF]">↗</span>
              </Link>
            ))}
            <Link
              to="/checkout?plan=completo"
              onClick={() => setOpen(false)}
              className="mt-5 rounded-xl bg-[#006FEF] px-4 py-3.5 text-center text-sm font-semibold text-white"
            >
              Assinar agora
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative border-t border-[#168BFF]/15 bg-[#010512] px-5 py-14">
      <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-9 w-9 rounded-lg object-cover ring-1 ring-[#168BFF]/30" loading="lazy" />
            <div className="font-display text-sm font-semibold text-white">CredMais App</div>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-white/60">
            Carteira, parcelas, juros de atraso e cobrança no WhatsApp em um só lugar.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px] sm:gap-x-20">
          <div className="col-span-2 text-[11px] uppercase tracking-[0.28em] text-white/60 sm:col-span-1">
            Navegar
          </div>
          <div className="hidden text-[11px] uppercase tracking-[0.28em] text-white/60 sm:block">Contato</div>
          <div className="flex flex-col gap-2.5 text-white/60">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="w-fit hover:text-white">
                {n.label}
              </Link>
            ))}
            <Link to="/privacidade" className="w-fit hover:text-white">
              Privacidade
            </Link>
          </div>
          <div className="flex flex-col gap-2.5 text-white/60">
            <a href="https://wa.me/5511964541758" target="_blank" rel="noreferrer" className="w-fit hover:text-white">
              (11) 96454-1758
            </a>
            <Link to="/login" className="w-fit hover:text-white">
              Acessar painel
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 flex w-full max-w-[1160px] flex-col gap-2 border-t border-white/[0.06] pt-6 text-[11px] text-white/60 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} CredMais App</span>
        <span>São Paulo, Brasil</span>
      </div>
    </footer>
  );
}

export function SitePage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children?: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="min-h-screen bg-[#020719] font-body text-white">
      <Grain />
      <SiteHeader />
      <section className="relative min-h-[68svh] overflow-hidden border-b border-white/10">
        <motion.img
          src={flowVisual}
          alt=""
          aria-hidden
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 1.08 }}
          animate={{ opacity: .48, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 1.2, ease: [0.16, 1, .3, 1] }}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#020719_0%,rgba(2,7,25,.94)_46%,rgba(2,7,25,.3)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020719] via-transparent to-transparent" />
        <motion.div initial={{ opacity: 0, y: reducedMotion ? 0 : 48 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : .9, ease: [0.16, 1, .3, 1] }} className="relative mx-auto flex min-h-[68svh] w-full max-w-[1280px] flex-col justify-end px-5 pb-16 pt-24 sm:px-8 md:pb-20 lg:px-12">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="font-display mt-7 max-w-4xl text-[clamp(3.2rem,7.5vw,7.2rem)] font-semibold leading-[.84] tracking-[-0.065em]">{title}</h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/65 md:text-lg">{intro}</p>
        </motion.div>
      </section>
      <main className="relative mx-auto w-full max-w-[1160px] px-5 py-24 sm:px-8 md:py-32">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: reducedMotion ? 0 : .65, ease: [0.16, 1, .3, 1] }}
      whileHover={reducedMotion ? undefined : { y: -6 }}
      className={`relative rounded-[1.75rem] border border-white/[0.11] bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,.24)] backdrop-blur-xl transition-colors hover:border-[#168bff]/45 md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}
