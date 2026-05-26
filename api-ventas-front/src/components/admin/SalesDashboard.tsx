"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ShoppingCart, CalendarDays, BarChart2, Loader2 } from "lucide-react";
import {
  useLastShiftReport,
  useAveragesReport,
  useWeekdayReport,
  useMonthlyTrendReport,
  type WeekdayPoint,
} from "@/hooks/useReports";

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

function clpCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

function clpFull(n: number): string {
  return Math.round(n).toLocaleString("es-CL", { style: "currency", currency: "CLP" });
}

const DAY_COLORS = [
  "#f87171",
  "#fb923c",
  "#4ade80",
  "#f97316",
  "#ef4444",
  "#f43f5e",
  "#22c55e",
];

interface DonutTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; payload: WeekdayPoint }[];
}

function DonutTooltip({ active, payload }: DonutTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm shadow-xl">
      <p className="text-stone-700 dark:text-slate-300 font-medium mb-1">{entry.name}</p>
      <p className="text-stone-900 dark:text-slate-200 font-semibold">{clpFull(entry.value)}</p>
      <p className="text-stone-400 dark:text-slate-500 text-xs mt-0.5">{entry.payload.order_count} pedidos</p>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  loading,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
        {icon}
      </div>
      <p className="text-stone-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</p>
      {loading ? (
        <div className="h-8 w-32 bg-stone-200 dark:bg-slate-800 animate-pulse rounded-lg" />
      ) : (
        <p className="text-2xl font-bold text-stone-900 dark:text-slate-100 truncate">{value}</p>
      )}
      {sub && !loading && <p className="text-xs text-stone-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

interface MonthlyTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function MonthlyTooltip({ active, payload, label }: MonthlyTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="text-stone-700 dark:text-slate-300 font-medium mb-2 capitalize">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-stone-500 dark:text-slate-400 text-xs">{entry.name}:</span>
            <span className="text-stone-800 dark:text-slate-200 text-xs font-medium">{clpFull(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MONTHLY_OPTIONS = [6, 12] as const;

function MonthlyTrendChart({
  role,
  branchId,
}: {
  role: string | null;
  branchId: number | null;
}) {
  const isDark = useIsDark();
  const [months, setMonths] = useState<(typeof MONTHLY_OPTIONS)[number]>(6);
  const { data, isLoading } = useMonthlyTrendReport(role, branchId, months);

  const gridColor   = isDark ? "#1e293b" : "#e7e5e4";
  const tickColor   = isDark ? "#64748b" : "#a8a29e";
  const cursorColor = isDark ? "#334155" : "#d6d3d1";
  const dotBg       = isDark ? "#0f172a" : "#ffffff";

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 h-full min-h-[360px] animate-pulse" />
    );
  }

  const isEmpty = !data?.length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-widest">
          Tendencia de ventas
        </h3>
        <div className="flex gap-1">
          {MONTHLY_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                months === m
                  ? "bg-stone-200 dark:bg-slate-700 text-stone-800 dark:text-slate-100"
                  : "text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800"
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>
      {isEmpty ? (
        <div className="flex items-center justify-center h-[280px] text-stone-400 dark:text-slate-600 text-sm">
          Sin datos de ventas para este período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="month_label"
              tick={{ fill: tickColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: tickColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={clpCompact}
              width={62}
            />
            <Tooltip
              content={<MonthlyTooltip />}
              cursor={{ stroke: cursorColor, strokeWidth: 1 }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: tickColor, fontSize: 11 }}>{value}</span>
              )}
            />
            <Line
              dataKey="gross_sales"
              name="Ventas brutas"
              stroke="#f87171"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: dotBg, strokeWidth: 2 }}
            />
            <Line
              dataKey="net_sales"
              name="Ventas netas"
              stroke="#fb923c"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: dotBg, strokeWidth: 2 }}
            />
            <Line
              dataKey="tips"
              name="Propinas"
              stroke="#4ade80"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: dotBg, strokeWidth: 2 }}
            />
            <Line
              dataKey="net_losses"
              name="Pérdidas netas"
              stroke="#f43f5e"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 4, stroke: dotBg, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function WeekdayDonutChart({
  weekdays,
  loading,
}: {
  weekdays?: WeekdayPoint[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 min-h-[360px] animate-pulse" />
    );
  }

  const hasData = weekdays?.some((w) => w.total > 0);
  const days = weekdays ?? [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col">
      <h3 className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-widest mb-5">
        Distribución por día
      </h3>
      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={days}
                dataKey="total"
                nameKey="weekday_name"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={88}
                paddingAngle={4}
              >
                {days.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={DAY_COLORS[entry.weekday % DAY_COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center" style={{ height: 200 }}>
            <div className="w-[176px] h-[176px] rounded-full border-[28px] border-stone-200 dark:border-slate-800 flex items-center justify-center">
              <span className="text-stone-400 dark:text-slate-600 text-xs text-center leading-tight px-2">
                Sin ventas<br />registradas
              </span>
            </div>
          </div>
        )}
        {days.length > 0 && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
            {days.map((entry) => (
              <div key={entry.weekday} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: DAY_COLORS[entry.weekday % DAY_COLORS.length] }}
                />
                <span className="text-stone-500 dark:text-slate-400">{entry.weekday_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const TREND_DAYS = 30;

export function SalesDashboard() {
  const [branchId, setBranchId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setBranchId(Number(localStorage.getItem("branch_id")) || null);
    setRole(localStorage.getItem("user_role"));
    setReady(true);
  }, []);

  const { data: lastShift, isLoading: loadingShift } = useLastShiftReport(role, branchId);
  const { data: averages, isLoading: loadingAvg } = useAveragesReport(role, branchId, TREND_DAYS);
  const { data: weekdays, isLoading: loadingWeekday } = useWeekdayReport(role, branchId, 90);

  if (!ready) {
    return (
      <div className="flex items-center gap-3 text-stone-400 dark:text-slate-500 py-8 mb-10">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Cargando datos de ventas…</span>
      </div>
    );
  }

  let shiftSub = "Sin turno registrado";
  if (lastShift) {
    if (role === "admin") {
      shiftSub = `${lastShift.order_count} pedidos · todas las sucursales`;
    } else {
      const timeStr = lastShift.opened_at
        ? ` desde ${new Date(lastShift.opened_at).toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : "";
      shiftSub = `${lastShift.order_count} pedidos · ${
        lastShift.is_active ? "turno activo" : "último turno"
      }${timeStr}`;
    }
  }

  return (
    <div className="mb-10 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingCart className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
          iconBg="bg-emerald-500/10"
          label="Última sesión"
          value={lastShift ? clpFull(lastShift.total_sales) : "—"}
          sub={shiftSub}
          loading={!ready || loadingShift}
        />
        <StatCard
          icon={<CalendarDays className="w-5 h-5 text-sky-500 dark:text-sky-400" />}
          iconBg="bg-sky-500/10"
          label="Promedio por día"
          value={averages ? clpFull(averages.daily_average) : "—"}
          sub={`${averages?.total_days_with_sales ?? "—"} días con ventas / últimos ${TREND_DAYS}d`}
          loading={loadingAvg}
        />
        <StatCard
          icon={<BarChart2 className="w-5 h-5 text-violet-500 dark:text-violet-400" />}
          iconBg="bg-violet-500/10"
          label="Promedio por semana"
          value={averages ? clpFull(averages.weekly_average) : "—"}
          sub="Últimas 4 semanas"
          loading={loadingAvg}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
          iconBg="bg-amber-500/10"
          label="Promedio por mes"
          value={averages ? clpFull(averages.monthly_average) : "—"}
          sub="Último mes"
          loading={loadingAvg}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2">
          <MonthlyTrendChart role={role} branchId={branchId} />
        </div>
        <WeekdayDonutChart weekdays={weekdays} loading={loadingWeekday} />
      </div>
    </div>
  );
}
