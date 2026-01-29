import DateRangePill from "../../components/reports/DateRangePill";
import KpiCard from "../../components/reports/KpiCard";
import Card from "../../components/reports/Card";
import SalesByCategoryChart from "../../components/reports/SalesByCategoryChart";
import SalesOverTimeChart from "../../components/reports/SalesOverTimeChart";
import TopProductsTable from "../../components/reports/TopProductsTable";
import { useI18n } from "../../i18n";

export default function Reports() {
  const { t } = useI18n();
  // sample data for styling
  const kpis = { totalSales: 52340000, orders: 1280, aov: 40890 };
  const topProducts = [
    {
      name: t("admin.reports.sampleProducts.copierA"),
      cat: t("admin.reports.categories.copiers"),
      sales: 15400000,
    },
    {
      name: t("admin.reports.sampleProducts.tonerX"),
      cat: t("admin.reports.categories.toner"),
      sales: 12700000,
    },
    {
      name: t("admin.reports.sampleProducts.copierB"),
      cat: t("admin.reports.categories.copiers"),
      sales: 11250000,
    },
    {
      name: t("admin.reports.sampleProducts.drumQ"),
      cat: t("admin.reports.categories.parts"),
      sales: 8950000,
    },
  ];

  return (
    <div className="bg-white p-6 rounded w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#00294D]">
          {t("admin.reports.title")}
        </h1>
        <DateRangePill
          from={t("admin.reports.dateFrom")}
          to={t("admin.reports.dateTo")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label={t("admin.reports.kpis.totalSales")}
          value={kpis.totalSales}
          tone="yellow"
          isMoney
          kind="sales"
        />
        <KpiCard
          label={t("admin.reports.kpis.orders")}
          value={kpis.orders}
          tone="red"
          kind="orders"
        />
        <KpiCard
          label={t("admin.reports.kpis.avgOrderValue")}
          value={kpis.aov}
          tone="amber"
          isMoney
          kind="aov"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title={t("admin.reports.salesByCategory")}>
          <SalesByCategoryChart />
        </Card>
        <Card title={t("admin.reports.salesOverTime")}>
          <SalesOverTimeChart />
        </Card>
      </div>

      <TopProductsTable rows={topProducts} />
    </div>
  );
}
