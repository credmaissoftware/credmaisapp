import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, MessageCircle, Sparkles } from "lucide-react";
import { SiteHeader, SiteFooter, Grain, Eyebrow } from "@/components/site/SiteLayout";
import { PLAN_LIST } from "@/lib/plans";
import logo from "@/assets/credmais-cplus-logo.jpg";
import hero from "@/assets/credmais-hero-cinematic-v2.webp";
import story from "@/assets/credmais-story-strip-v2.webp";
import flow from "@/assets/credmais-flow-sculpture-v2.webp";

const chapters = [
  { n: "01", label: "ORGANIZE", title: "Sua carteira inteira,\nsem perder o fio.", text: "Clientes, contratos, parcelas, garantias e histórico financeiro em uma visão que deixa tudo claro." },
  { n: "02", label: "AUTOMATIZE", title: "A cobrança acontece\nna hora certa.", text: "Lembretes, WhatsApp, PIX e portal do cliente trabalham juntos — antes e depois do vencimento." },
  { n: "03", label: "RECEBA", title: "Juros, multas e acordos\ncalculados de verdade.", text: "Receba o total, uma parcela ou só os juros. Renove a data e mantenha o principal com segurança." },
  { n: "04", label: "CRESÇA", title: "Decida olhando\npara números vivos.", text: "Lucro, inadimplência, capital em circulação e próximos recebimentos atualizados a cada movimento." },
];

const stats = [["24/7", "carteira acompanhada"], ["1", "painel para toda operação"], ["0", "planilhas espalhadas"]];
const reveal = { hidden: { opacity: 0, y: 42 }, visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const } } };

export default function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.2]);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#020719] font-body text-white selection:bg-[#ff9f1a] selection:text-[#020719]">
      <Grain /><SiteHeader />
      <section ref={heroRef} className="relative min-h-[calc(100svh-4rem)] overflow-hidden border-b border-white/10">
        <motion.img src={hero} alt="Empreendedor acompanhando sua operação financeira" className="absolute inset-0 h-full w-full object-cover object-[62%_center]" style={{ y: heroY, scale: heroScale, opacity: heroOpacity }} fetchPriority="high" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#020719_0%,rgba(2,7,25,.96)_28%,rgba(2,7,25,.58)_58%,rgba(2,7,25,.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,#020719_100%)]" />
        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1380px] items-center px-5 py-20 sm:px-8 lg:px-12">
          <motion.div initial="hidden" animate="visible" variants={reveal} className="max-w-[760px]">
            <Eyebrow>Controle para quem faz o dinheiro girar</Eyebrow>
            <h1 className="mt-7 font-display text-[clamp(3.4rem,8.7vw,8.2rem)] font-semibold leading-[.78] tracking-[-.075em] text-[#f6f7ff]">Feito para<br /><span className="text-[#168bff]">receber.</span></h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-white/70 sm:text-lg">Da criação do contrato à última cobrança: uma operação inteira conectada, visual e automática.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link to="/checkout?plan=completo" className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#0877ff] px-8 font-semibold shadow-[0_0_48px_rgba(8,119,255,.34)] transition hover:bg-[#2494ff]">Começar agora <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              <Link to="/login" className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 bg-black/10 px-8 font-medium backdrop-blur-xl transition hover:bg-white/10">Acessar minha conta</Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-[10px] uppercase tracking-[.35em] text-white/45 md:flex"><span className="h-10 w-px bg-gradient-to-b from-[#168bff] to-transparent" /> Role para descobrir</div>
      </section>

      <section className="relative overflow-hidden bg-[#f1eee7] py-24 text-[#061028] md:py-36">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: .2 }} variants={reveal} className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div className="text-[11px] font-bold uppercase tracking-[.34em] text-[#0877ff]">CredMais em movimento</div><h2 className="font-display text-[clamp(2.9rem,7vw,7rem)] font-semibold leading-[.86] tracking-[-.065em]">Emprestar é só o começo.</h2></div>
          <div className="mt-16 grid gap-10 border-t border-[#061028]/15 pt-9 md:grid-cols-2 lg:ml-[40%]"><p className="text-xl leading-8">O desafio real é acompanhar cada compromisso sem deixar nenhum detalhe escapar.</p><p className="leading-7 text-[#061028]/65">Por isso o CredMais transforma uma rotina cheia de contas, mensagens e datas em uma jornada simples: organizar, automatizar, receber e crescer.</p></div>
        </motion.div>
      </section>

      <section className="bg-[#081633] py-20 md:py-28"><div className="mx-auto max-w-[1500px] px-4 sm:px-7">
        <motion.div initial={{ opacity: 0, scale: .96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: .25 }} transition={{ duration: 1, ease: [0.16, 1, .3, 1] }} className="relative overflow-hidden rounded-[2rem] border border-white/10"><img src={story} alt="Jornada de cobrança e recebimento pelo celular" className="min-h-[420px] w-full object-cover" loading="lazy" /><div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020719]/55 via-transparent to-transparent" /></motion.div>
        <div className="mt-6 flex justify-between text-[10px] uppercase tracking-[.28em] text-white/45"><span>Do cadastro</span><span>ao pagamento confirmado</span></div>
      </div></section>

      <section className="bg-[#ff9f1a] text-[#04102c]">{chapters.map((c, i) => (
        <motion.article key={c.n} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .35 }} variants={reveal} className={`border-b border-[#04102c]/15 px-5 py-20 sm:px-8 md:py-28 lg:px-12 ${i % 2 ? "bg-[#0877ff] text-white" : ""}`}>
          <div className="mx-auto grid max-w-[1280px] gap-10 md:grid-cols-[150px_1fr_.72fr] md:items-start"><div><div className="font-display text-[clamp(4rem,10vw,8rem)] font-semibold leading-none tracking-[-.08em] opacity-25">{c.n}</div><div className="mt-2 text-[10px] font-bold tracking-[.32em]">{c.label}</div></div><h2 className="whitespace-pre-line font-display text-[clamp(2.7rem,6vw,5.6rem)] font-semibold leading-[.88] tracking-[-.06em]">{c.title}</h2><p className="max-w-sm self-end text-base leading-7 opacity-70 md:pt-20">{c.text}</p></div>
        </motion.article>
      ))}</section>

      <section className="relative min-h-[92svh] overflow-hidden bg-[#020719]"><img src={flow} alt="Fluxo automatizado de cobrança e pagamento" className="absolute inset-0 h-full w-full object-cover" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-r from-[#020719] via-[#020719]/60 to-transparent" />
        <div className="relative mx-auto flex min-h-[92svh] max-w-[1280px] items-center px-5 py-24 sm:px-8 lg:px-12"><motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: .35 }} variants={reveal} className="max-w-2xl"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ff9f1a]/35 bg-[#ff9f1a]/10 text-[#ffb23e]"><Sparkles /></div><h2 className="mt-8 font-display text-[clamp(3rem,7vw,6.8rem)] font-semibold leading-[.84] tracking-[-.07em]">Uma cobrança.<br />Todo o fluxo.</h2><p className="mt-8 max-w-lg text-lg leading-8 text-white/65">Notifique, atualize os valores, aceite o comprovante e registre o recebimento sem quebrar a sequência.</p><Link to="/inteligencia" className="mt-9 inline-flex items-center gap-2 border-b border-[#ff9f1a] pb-2 text-sm font-semibold text-[#ffb23e]">Conhecer a automação <ArrowUpRight className="h-4 w-4" /></Link></motion.div></div>
      </section>

      <section className="bg-[#f1eee7] px-5 py-24 text-[#061028] sm:px-8 md:py-36 lg:px-12"><div className="mx-auto max-w-[1280px]">
        <div className="grid gap-12 border-b border-[#061028]/15 pb-14 lg:grid-cols-2 lg:items-end"><h2 className="font-display text-[clamp(3rem,7vw,6.6rem)] font-semibold leading-[.85] tracking-[-.065em]">Números que contam a história certa.</h2><p className="max-w-md text-lg leading-8 text-[#061028]/60 lg:justify-self-end">Menos tempo procurando informação. Mais tempo decidindo o próximo movimento.</p></div>
        <div className="grid md:grid-cols-3">{stats.map(([value, label]) => <motion.div key={label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="border-b border-[#061028]/15 py-12 md:border-b-0 md:border-r md:px-8 first:pl-0 last:border-r-0"><div className="font-display text-[clamp(4.5rem,9vw,8rem)] font-semibold leading-none tracking-[-.08em] text-[#0877ff]">{value}</div><div className="mt-4 text-sm uppercase tracking-[.2em]">{label}</div></motion.div>)}</div>
      </div></section>

      <section className="bg-[#020719] px-5 py-24 sm:px-8 md:py-36 lg:px-12"><div className="mx-auto max-w-[1120px]">
        <Eyebrow>Planos simples</Eyebrow><h2 className="mt-7 font-display text-[clamp(3rem,7vw,6rem)] font-semibold leading-[.88] tracking-[-.06em]">Escolha o ritmo.<br />O controle é seu.</h2>
        <div className="mt-16 grid gap-5 md:grid-cols-2">{PLAN_LIST.map((plan) => <motion.div key={plan.tier} whileHover={{ y: -8 }} className={`relative overflow-hidden rounded-[2rem] border p-8 md:p-10 ${plan.highlight ? "border-[#0877ff] bg-[#0877ff]" : "border-white/15 bg-white/[.035]"}`}>{plan.highlight && <div className="absolute right-0 top-0 rounded-bl-2xl bg-[#ff9f1a] px-5 py-3 text-[10px] font-bold uppercase tracking-[.24em] text-[#061028]">Mais completo</div>}<div className="text-sm uppercase tracking-[.25em] text-white/60">{plan.name}</div><div className="mt-8 font-display text-6xl font-semibold tracking-[-.06em]">R$ {plan.priceLabel}<span className="ml-2 text-sm font-normal tracking-normal text-white/60">/mês</span></div><ul className="mt-9 space-y-3 border-t border-white/15 pt-8">{plan.features.map(f => <li key={f} className="flex gap-3 text-sm text-white/75"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ffb23e]" />{f}</li>)}</ul><Link to={`/checkout?plan=${plan.tier}`} className={`mt-10 flex min-h-14 items-center justify-center rounded-full font-semibold ${plan.highlight ? "bg-[#020719]" : "bg-white text-[#020719]"}`}>Assinar {plan.name}</Link></motion.div>)}</div>
      </div></section>

      <section className="relative overflow-hidden bg-[#ff9f1a] px-5 py-24 text-[#04102c] sm:px-8 md:py-32 lg:px-12"><div className="absolute -right-20 -top-32 select-none font-display text-[28rem] font-bold leading-none text-[#04102c]/5">+</div><div className="relative mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[1fr_auto] lg:items-end"><div><img src={logo} alt="CredMais" className="h-16 w-16 rounded-2xl" /><h2 className="mt-8 font-display text-[clamp(3.2rem,8vw,7.5rem)] font-semibold leading-[.82] tracking-[-.07em]">Sua carteira<br />pede movimento.</h2></div><div className="lg:pb-3"><Link to="/checkout?plan=completo" className="group flex min-h-16 items-center justify-center gap-3 rounded-full bg-[#04102c] px-9 font-semibold text-white">Começar agora <ArrowRight className="transition-transform group-hover:translate-x-1" /></Link><a href="https://wa.me/5511964541758" className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold"><MessageCircle className="h-4 w-4" /> Falar com a equipe</a></div></div></section>
      <SiteFooter />
    </div>
  );
}
