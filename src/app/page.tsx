"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import confetti from "canvas-confetti";
import {
  BookOpen,
  CircleDollarSign,
  Clock3,
  Coins,
  Download,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  TrendingUp,
} from "lucide-react";

const MIN_WAGE = 10320;
const BOOK_HOURS = 5;
const SP500_RATE = 0.08;
const SP500_YEARS = 10;
const DAYS_PER_YEAR = 365;

const WAGE_PRESETS = [
  { label: "최저시급", value: MIN_WAGE },
  { label: "2만", value: 20000 },
  { label: "3.5만", value: 35000 },
  { label: "5만", value: 50000 },
] as const;

type TabId = "calculator" | "timer";

type FallingCoin = {
  id: number;
  left: number;
  drift: number;
  duration: number;
  delay: number;
  spin: number;
  size: number;
};

function formatWon(value: number) {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

function futureValueAnnuity(annualContribution: number) {
  return (
    annualContribution *
    ((Math.pow(1 + SP500_RATE, SP500_YEARS) - 1) / SP500_RATE)
  );
}

function formatDuration(totalHours: number) {
  const days = Math.floor(totalHours / 24);
  const hours = Math.round(totalHours - days * 24);
  return { days, hours, totalHours };
}

export default function Home() {
  const [tab, setTab] = useState<TabId>("calculator");
  const [hours, setHours] = useState(3);
  const [wage, setWage] = useState(MIN_WAGE);
  const [wageInput, setWageInput] = useState(String(MIN_WAGE));
  const [exporting, setExporting] = useState(false);

  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const baseElapsedRef = useRef(0);
  const [coins, setCoins] = useState<FallingCoin[]>([]);
  const coinIdRef = useRef(0);

  const cardRef = useRef<HTMLDivElement>(null);

  const yearlyHours = hours * DAYS_PER_YEAR;
  const yearlyLoss = yearlyHours * wage;
  const books = yearlyHours / BOOK_HOURS;
  const futureValue = futureValueAnnuity(yearlyLoss);
  const duration = formatDuration(yearlyHours);
  const wagePerSecond = wage / 3600;
  const liveLoss = (elapsedMs / 1000) * wagePerSecond;
  const sliderFill = ((hours - 0.5) / (8 - 0.5)) * 100;

  const activePreset = useMemo(
    () => WAGE_PRESETS.find((preset) => preset.value === wage)?.value ?? null,
    [wage],
  );

  const applyWage = (value: number) => {
    const next = Math.max(0, value);
    setWage(next);
    setWageInput(String(next));
  };

  const downloadCard = async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#0a0a0a",
      });
      const link = document.createElement("a");
      link.download = "doomscroll-cost.png";
      link.href = dataUrl;
      link.click();
      confetti({
        particleCount: 140,
        spread: 78,
        startVelocity: 42,
        origin: { y: 0.62 },
        colors: ["#f59e0b", "#ef4444", "#fbbf24", "#fecaca", "#fff7ed"],
      });
      window.setTimeout(() => {
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#f59e0b", "#ef4444", "#fde68a"],
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#f59e0b", "#ef4444", "#fde68a"],
        });
      }, 180);
    } finally {
      setExporting(false);
    }
  };

  const spawnBurst = useCallback(() => {
    const count = 3 + Math.floor(Math.random() * 3);
    const burst: FallingCoin[] = Array.from({ length: count }, () => {
      coinIdRef.current += 1;
      return {
        id: coinIdRef.current,
        left: 6 + Math.random() * 88,
        drift: (Math.random() - 0.5) * 90,
        duration: 1.25 + Math.random() * 0.9,
        delay: Math.random() * 0.28,
        spin: 180 + Math.random() * 540,
        size: 18 + Math.random() * 16,
      };
    });
    setCoins((prev) => [...prev.slice(-40), ...burst]);
  }, []);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (startedAtRef.current == null) return;
      setElapsedMs(baseElapsedRef.current + (Date.now() - startedAtRef.current));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running || tab !== "timer") return;
    spawnBurst();
    let timeoutId: number;
    const loop = () => {
      const wait = 1000 + Math.random() * 1000;
      timeoutId = window.setTimeout(() => {
        spawnBurst();
        loop();
      }, wait);
    };
    loop();
    return () => window.clearTimeout(timeoutId);
  }, [running, tab, spawnBurst]);

  const startTimer = () => {
    if (running) return;
    startedAtRef.current = Date.now();
    setRunning(true);
  };

  const pauseTimer = () => {
    if (!running) return;
    if (startedAtRef.current != null) {
      baseElapsedRef.current += Date.now() - startedAtRef.current;
    }
    startedAtRef.current = null;
    setElapsedMs(baseElapsedRef.current);
    setRunning(false);
  };

  const resetTimer = () => {
    startedAtRef.current = null;
    baseElapsedRef.current = 0;
    setElapsedMs(0);
    setRunning(false);
    setCoins([]);
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-neutral-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_42%),radial-gradient(circle_at_80%_20%,_rgba(239,68,68,0.12),_transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-300 uppercase">
              <Flame className="size-3.5" />
              Opportunity Cost
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              DoomScroll Cost
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
              스마트폰 딴짓이 태우는 시급, 시간, 그리고 10년 뒤의 복리 자산을
              금융 인포그래픽으로 확인하세요.
            </p>
          </div>
          <div className="flex rounded-full border border-white/10 bg-neutral-900/80 p-1 backdrop-blur">
            {(
              [
                { id: "calculator", label: "1년 기회비용" },
                { id: "timer", label: "금화 증발 타이머" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === item.id ? "text-neutral-950" : "text-neutral-400 hover:text-white"
                }`}
              >
                {tab === item.id && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-red-500"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {tab === "calculator" ? (
            <motion.section
              key="calculator"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28 }}
              className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
            >
              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-neutral-900/70 p-5 shadow-[0_0_80px_rgba(245,158,11,0.06)] sm:p-7">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Smartphone className="size-5" />
                      <h2 className="text-lg font-bold text-white">하루 스크롤 시간</h2>
                    </div>
                    <p className="font-mono text-2xl font-black text-amber-400">
                      {hours.toFixed(1)}
                      <span className="ml-1 text-sm font-semibold text-neutral-400">h</span>
                    </p>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={8}
                    step={0.5}
                    value={hours}
                    onChange={(event) => setHours(Number(event.target.value))}
                    className="hours-slider w-full"
                    style={{ ["--fill" as string]: `${sliderFill}%` }}
                    aria-label="하루 스마트폰 스크롤 시간"
                  />
                  <div className="mt-2 flex justify-between text-xs text-neutral-500">
                    <span>0.5시간</span>
                    <span>8시간</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-neutral-900/70 p-5 sm:p-7">
                  <div className="mb-4 flex items-center gap-2 text-red-300">
                    <CircleDollarSign className="size-5" />
                    <h2 className="text-lg font-bold text-white">시급</h2>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {WAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => applyWage(preset.value)}
                        className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                          activePreset === preset.value
                            ? "border-red-400 bg-red-500/15 text-red-200"
                            : "border-white/10 bg-neutral-950 text-neutral-300 hover:border-amber-500/40"
                        }`}
                      >
                        {preset.label}
                        <span className="mt-1 block font-mono text-xs text-neutral-500">
                          {formatWon(preset.value)}원
                        </span>
                      </button>
                    ))}
                  </div>
                  <label className="block text-xs font-medium text-neutral-500">
                    직접 입력 (원)
                    <input
                      type="number"
                      min={0}
                      value={wageInput}
                      onChange={(event) => {
                        const next = event.target.value;
                        setWageInput(next);
                        const parsed = Number(next);
                        if (!Number.isNaN(parsed)) setWage(Math.max(0, parsed));
                      }}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 font-mono text-lg text-white outline-none ring-amber-400/40 focus:ring-2"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <StatCard
                    icon={<Coins className="size-4" />}
                    label="1년 손실액"
                    value={`${formatWon(yearlyLoss)}원`}
                    tone="red"
                  />
                  <StatCard
                    icon={<Clock3 className="size-4" />}
                    label="날아간 총 시간"
                    value={`${formatWon(duration.totalHours)}시간`}
                    hint={`${formatWon(duration.days)}일 ${duration.hours}시간`}
                    tone="amber"
                  />
                  <StatCard
                    icon={<BookOpen className="size-4" />}
                    label="독서 환산 (1권 5시간)"
                    value={`${books.toFixed(1)}권`}
                    tone="amber"
                  />
                  <StatCard
                    icon={<TrendingUp className="size-4" />}
                    label="S&P 500 8% · 10년 적립"
                    value={`${formatWon(futureValue)}원`}
                    hint="매년 손실액을 넣었다면"
                    tone="red"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-[360px] overflow-hidden rounded-[28px] border border-amber-500/20 shadow-[0_20px_80px_rgba(239,68,68,0.12)]">
                  <ShareCard
                    cardRef={cardRef}
                    hours={hours}
                    wage={wage}
                    yearlyLoss={yearlyLoss}
                    yearlyHours={yearlyHours}
                    books={books}
                    futureValue={futureValue}
                  />
                </div>
                <button
                  type="button"
                  onClick={downloadCard}
                  disabled={exporting}
                  className="inline-flex w-full max-w-[360px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-red-500 px-5 py-3.5 text-sm font-bold text-neutral-950 transition hover:brightness-110 disabled:opacity-60"
                >
                  <Download className="size-4" />
                  {exporting ? "카드 생성 중..." : "스토리 카드 PNG 저장"}
                </button>
                <p className="text-center text-xs text-neutral-500">
                  인스타그램 스토리 비율(9:16) · html-to-image
                </p>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="timer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28 }}
              className="relative min-h-[70vh] overflow-hidden rounded-3xl border border-red-500/20 bg-neutral-900/60"
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <AnimatePresence>
                  {coins.map((coin) => (
                    <motion.div
                      key={coin.id}
                      className="absolute top-0"
                      style={{ left: `${coin.left}%` }}
                      initial={{ y: -48, x: 0, opacity: 0, rotate: 0, scale: 0.7 }}
                      animate={{
                        y: "85vh",
                        x: coin.drift,
                        opacity: [0, 1, 1, 0],
                        rotate: coin.spin,
                        scale: 1,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: coin.duration,
                        delay: coin.delay,
                        ease: [0.22, 0.01, 0.55, 1],
                        opacity: { duration: coin.duration, times: [0, 0.08, 0.82, 1] },
                      }}
                      onAnimationComplete={() =>
                        setCoins((prev) => prev.filter((item) => item.id !== coin.id))
                      }
                    >
                      <Coins
                        className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.85)]"
                        style={{ width: coin.size, height: coin.size }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center px-5 py-12 text-center">
                <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-amber-400 uppercase">
                  Live evaporation
                </p>
                <p className="text-sm text-neutral-400">
                  시급 {formatWon(wage)}원 기준 · 초당 {wagePerSecond.toFixed(2)}원
                </p>
                <motion.p
                  key={Math.floor(liveLoss)}
                  animate={running ? { scale: [1, 1.03, 1] } : undefined}
                  transition={{ duration: 0.35 }}
                  className="mt-6 font-mono text-5xl font-black tracking-tight text-red-400 sm:text-7xl"
                >
                  -{formatWon(liveLoss)}원
                </motion.p>
                <p className="mt-3 font-mono text-neutral-500">
                  {Math.floor(elapsedMs / 1000)}초 경과
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  {!running ? (
                    <button
                      type="button"
                      onClick={startTimer}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-red-500 px-6 py-3 text-sm font-bold text-neutral-950"
                    >
                      <Play className="size-4" />
                      딴짓 시작
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pauseTimer}
                      className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/40 bg-neutral-950 px-6 py-3 text-sm font-bold text-amber-300"
                    >
                      <Pause className="size-4" />
                      정지
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={resetTimer}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-6 py-3 text-sm font-semibold text-neutral-300 hover:border-red-400/40"
                  >
                    <RotateCcw className="size-4" />
                    리셋
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone: "amber" | "red";
}) {
  const toneClass =
    tone === "red"
      ? "border-red-500/20 bg-red-500/5 text-red-300"
      : "border-amber-500/20 bg-amber-500/5 text-amber-300";
  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-80">
        {icon}
        {label}
      </div>
      <p className="font-mono text-xl font-black text-white sm:text-2xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-neutral-400">{hint}</p> : null}
    </div>
  );
}

function ShareCard({
  cardRef,
  hours,
  wage,
  yearlyLoss,
  yearlyHours,
  books,
  futureValue,
}: {
  cardRef: RefObject<HTMLDivElement | null>;
  hours: number;
  wage: number;
  yearlyLoss: number;
  yearlyHours: number;
  books: number;
  futureValue: number;
}) {
  return (
    <div
      ref={cardRef}
      style={{
        width: 360,
        height: 640,
        background:
          "linear-gradient(165deg, #1a1208 0%, #0a0a0a 38%, #1a0707 100%)",
        color: "#fafafa",
        fontFamily:
          "Noto Sans KR, Pretendard, system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: 28,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "999px",
          background: "rgba(245,158,11,0.16)",
          filter: "blur(40px)",
          top: -80,
          right: -60,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "999px",
          background: "rgba(239,68,68,0.16)",
          filter: "blur(40px)",
          bottom: 40,
          left: -70,
        }}
      />
      <p
        style={{
          margin: 0,
          fontSize: 11,
          letterSpacing: "0.22em",
          color: "#fbbf24",
          fontWeight: 800,
        }}
      >
        DOOMSCROLL COST
      </p>
      <h3
        style={{
          margin: "14px 0 0",
          fontSize: 28,
          lineHeight: 1.25,
          fontWeight: 900,
        }}
      >
        올해 스크롤이
        <br />
        삼킨 돈
      </h3>
      <p style={{ margin: "10px 0 0", color: "#a3a3a3", fontSize: 13 }}>
        하루 {hours.toFixed(1)}시간 · 시급 {formatWon(wage)}원
      </p>

      <div
        style={{
          marginTop: 28,
          padding: "22px 20px",
          borderRadius: 20,
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(248,113,113,0.35)",
        }}
      >
        <p style={{ margin: 0, fontSize: 12, color: "#fca5a5", fontWeight: 700 }}>
          1년 기회비용
        </p>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 34,
            fontWeight: 900,
            color: "#fecaca",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          {formatWon(yearlyLoss)}원
        </p>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <ShareRow label="날아간 시간" value={`${formatWon(yearlyHours)}시간`} />
        <ShareRow label="읽지 못한 책" value={`${books.toFixed(1)}권`} />
        <ShareRow
          label="S&P 500 10년 적립"
          value={`${formatWon(futureValue)}원`}
        />
      </div>

      <p
        style={{
          marginTop: "auto",
          fontSize: 11,
          color: "#737373",
          letterSpacing: "0.04em",
        }}
      >
        복리 8% · 매년 같은 금액을 투자했다면
      </p>
    </div>
  );
}

function ShareRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 14px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ fontSize: 12, color: "#a3a3a3" }}>{label}</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: "#fbbf24",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        {value}
      </span>
    </div>
  );
}
