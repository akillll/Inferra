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
  Cell
} from "recharts";

import {
  getMetrics
} from "../api/metricsApi";

export default function Dashboard() {

  const [metrics, setMetrics] =
    useState(null);

  useEffect(() => {

    loadMetrics();

    const interval = setInterval(
      loadMetrics,
      50000
    );

    return () =>
      clearInterval(interval);

  }, []);


  const loadMetrics =
    async () => {

      const data =
        await getMetrics();

      setMetrics(data);
    };

  if (!metrics) {
    return <div>Loading...</div>;
  }

  return (

    <div className="p-6 space-y-8">

      <div className="grid grid-cols-4 gap-4">

        <div className="border p-4 rounded">
          <div>Total Requests</div>
          <div className="text-2xl font-bold">
            {metrics.total_requests}
          </div>
        </div>

        <div className="border p-4 rounded">
          <div>Avg Latency</div>
          <div className="text-2xl font-bold">
            {metrics.avg_latency} ms
          </div>
        </div>

        <div className="border p-4 rounded">
          <div>Total Errors</div>
          <div className="text-2xl font-bold">
            {metrics.total_errors}
          </div>
        </div>

        <div className="border p-4 rounded">
          <div>Total Tokens</div>
          <div className="text-2xl font-bold">
            {metrics.total_tokens}
          </div>
        </div>

      </div>


      <div className="border p-4 rounded">

        <div className="font-bold mb-4">
          Requests Per Minute
        </div>

        <LineChart
          width={700}
          height={300}
          data={
            metrics.requests_per_minute
          }
        >

          <XAxis dataKey="minute" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="count"
          />

        </LineChart>

      </div>


      <div className="border p-4 rounded">

        <div className="font-bold mb-4">
          Provider Usage
        </div>

        <PieChart
          width={400}
          height={300}
        >

          <Pie
            data={
              metrics.provider_usage
            }
            dataKey="count"
            nameKey="provider"
            outerRadius={100}
            label
          >

            {
              metrics.provider_usage.map(
                (_, index) => (
                  <Cell key={index} />
                )
              )
            }

          </Pie>

          <Tooltip />

        </PieChart>

      </div>

    </div>
  );
}