import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useI18n } from "../../i18n";
import { formatCOP } from "../../utils/helpers";

export default function SalesOverTimeChart({ data = [] }) {
  const { t } = useI18n();
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-slate-400">
        {t("admin.reports.empty")}
      </div>
    );
  }
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
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatCOP(value, true)}
          />
          <Tooltip
            labelFormatter={(value) => t(`admin.reports.months.${value}`)}
            formatter={(value, name) => [
              formatCOP(value, true),
              t(`admin.reports.series.${name}`),
            ]}
          />
          <Legend
            formatter={(value) => t(`admin.reports.series.${value}`)}
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#0D3B66"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="rentals"
            stroke="#F4B740"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
