import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useI18n } from "../../i18n";

const data = [
  { month: "jan", value: 120 },
  { month: "feb", value: 135 },
  { month: "mar", value: 110 },
  { month: "apr", value: 150 },
  { month: "may", value: 170 },
];

export default function SalesOverTimeChart() {
  const { t } = useI18n();
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid vertical={false} stroke="#eef2f7" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => t(`admin.reports.months.${value}`)}
          />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            labelFormatter={(value) => t(`admin.reports.months.${value}`)}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0D3B66"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
