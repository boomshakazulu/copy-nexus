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

const data = [
  { key: "copiers", navy: 280, yellow: 140 },
  { key: "toner", navy: 240, yellow: 160 },
  { key: "parts", navy: 320, yellow: 150 },
];

export default function SalesByCategoryChart() {
  const { t } = useI18n();
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={18}>
          <CartesianGrid vertical={false} stroke="#eef2f7" />
          <XAxis
            dataKey="key"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => t(`admin.reports.categories.${value}`)}
          />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            formatter={(value, name, props) => [
              value,
              t(`admin.reports.categories.${props.payload.key}`),
            ]}
          />
          <Bar dataKey="navy" fill="#0D3B66" radius={[6, 6, 0, 0]} />
          <Bar dataKey="yellow" fill="#F4C430" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
