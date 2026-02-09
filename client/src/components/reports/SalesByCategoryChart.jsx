import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useI18n } from "../../i18n";
import { formatCOP } from "../../utils/helpers";

export default function SalesByCategoryChart({ data = [] }) {
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
        <BarChart data={data} barSize={24}>
          <CartesianGrid vertical={false} stroke="#eef2f7" />
          <XAxis
            dataKey="key"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => t(`admin.reports.categories.${value}`)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatCOP(value, true)}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            formatter={(value, name, props) => [
              formatCOP(value, true),
              t(`admin.reports.categories.${props.payload.key}`),
            ]}
          />
          <Bar dataKey="sales" fill="#0D3B66" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
