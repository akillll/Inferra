import {
  useEffect,
  useState
} from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";

import {
  getMetrics
} from "../api/metricsApi";

const PROVIDER_COLORS = [
  "#0f172a",
  "#2563eb",
  "#059669",
  "#d97706",
  "#7c3aed"
];

const formatNumber = (value) =>
  new Intl.NumberFormat("en").format(value || 0);

export default function Dashboard() {

  const [metrics, setMetrics] =
    useState(null);
  const [error, setError] =
    useState("");

  useEffect(() => {

    loadMetrics();

    const interval = setInterval(
      loadMetrics,
      5000
    );

    return () =>
      clearInterval(interval);

  }, []);


  const loadMetrics =
    async () => {

      try {
        const data =
          await getMetrics();

        setMetrics(data);
        setError("");
      } catch (err) {
        setError(err.message);
      }
    };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Loading metrics...
      </div>
    );
  }

  return (

    <aside className="flex h-screen flex-col overflow-y-auto">

      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="text-sm font-semibold text-slate-950">
          Runtime dashboard
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Live inference health and usage
        </div>
      </header>

      <div className="space-y-4 p-4">

        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500">Requests</div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">
              {formatNumber(metrics.total_requests)}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500">Latency</div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">
              {metrics.avg_latency}
              <span className="ml-1 text-xs font-medium text-slate-500">ms</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500">Errors</div>
            <div className="mt-2 text-2xl font-semibold text-red-600">
              {formatNumber(metrics.total_errors)}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500">Tokens</div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">
              {formatNumber(metrics.total_tokens)}
            </div>
          </div>

        </div>


        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">

          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-950">
                Request volume
              </div>
              <div className="text-xs text-slate-500">
                Requests per minute
              </div>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={
                  metrics.requests_per_minute
                }
                margin={{
                  top: 8,
                  right: 8,
                  left: -24,
                  bottom: 0
                }}
              >

                <XAxis
                  dataKey="minute"
                  tick={{
                    fontSize: 10,
                    fill: "#64748b"
                  }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: "#64748b"
                  }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={false}
                />

              </LineChart>
            </ResponsiveContainer>
          </div>

        </section>


        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">

          <div className="mb-4">
            <div className="text-sm font-semibold text-slate-950">
              Provider usage
            </div>
            <div className="text-xs text-slate-500">
              Logs grouped by provider
            </div>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>

                <Pie
                  data={
                    metrics.provider_usage
                  }
                  dataKey="count"
                  nameKey="provider"
                  innerRadius={44}
                  outerRadius={76}
                  paddingAngle={3}
                >

                  {
                    metrics.provider_usage.map(
                      (_, index) => (
                        <Cell
                          key={index}
                          fill={PROVIDER_COLORS[index % PROVIDER_COLORS.length]}
                        />
                      )
                    )
                  }

                </Pie>

                <Tooltip />

              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2">
            {
              metrics.provider_usage.map((item, index) => (
                <div
                  key={item.provider}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          PROVIDER_COLORS[index % PROVIDER_COLORS.length]
                      }}
                    />
                    <span className="truncate text-slate-600">
                      {item.provider || "unknown"}
                    </span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {formatNumber(item.count)}
                  </span>
                </div>
              ))
            }
          </div>

        </section>

      </div>

    </aside>
  );
}
