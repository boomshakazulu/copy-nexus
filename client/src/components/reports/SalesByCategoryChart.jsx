import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Copiers", navy: 280, yellow: 140 },
  { name: "Toner", navy: 240, yellow: 160 },
  { name: "Parts", navy: 320, yellow: 150 },
];

export default function SalesByCategoryChart() {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={18}>
          <CartesianGrid vertical={false} stroke="#eef2f7" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "#f8fafc" }} />
          <Bar dataKey="navy" fill="#0D3B66" radius={[6, 6, 0, 0]} />
          <Bar dataKey="yellow" fill="#F4C430" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
