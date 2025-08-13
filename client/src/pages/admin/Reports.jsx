import DateRangePill from "../../components/reports/DateRangePill";
import KpiCard from "../../components/reports/KpiCard";
import Card from "../../components/reports/Card";
import SalesByCategoryChart from "../../components/reports/SalesByCategoryChart";
import SalesOverTimeChart from "../../components/reports/SalesOverTimeChart";
import TopProductsTable from "../../components/reports/TopProductsTable";

export default function Reports() {
  // sample data for styling
  const kpis = { totalSales: 52340000, orders: 1280, aov: 40890 };
  const topProducts = [
    { name: "Copier Model A", cat: "Copiers", sales: 15400000 },
    { name: "Toner Cartridge X", cat: "Toner", sales: 12700000 },
    { name: "Copier Model B", cat: "Copiers", sales: 11250000 },
    { name: "Drum Unit Q", cat: "Parts", sales: 8950000 },
  ];

  return (
    <div className="bg-white p-6 rounded w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#00294D]">
          Reports
        </h1>
        <DateRangePill from="Jan 1, 2024" to="Mar 31, 2024" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label="Total Sales"
          value={kpis.totalSales}
          tone="yellow"
          isMoney
        />
        <KpiCard label="Orders" value={kpis.orders} tone="red" />
        <KpiCard
          label="Avg Order Value"
          value={kpis.aov}
          tone="amber"
          isMoney
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Sales by Category">
          <SalesByCategoryChart />
        </Card>
        <Card title="Sales Over Time">
          <SalesOverTimeChart />
        </Card>
      </div>

      <TopProductsTable rows={topProducts} />
    </div>
  );
}
