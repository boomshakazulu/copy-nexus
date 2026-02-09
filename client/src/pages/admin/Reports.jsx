import { useEffect, useMemo, useState } from "react";
import DateRangePill from "../../components/reports/DateRangePill";
import KpiCard from "../../components/reports/KpiCard";
import Card from "../../components/reports/Card";
import SalesByCategoryChart from "../../components/reports/SalesByCategoryChart";
import SalesOverTimeChart from "../../components/reports/SalesOverTimeChart";
import TopProductsTable from "../../components/reports/TopProductsTable";
import { useI18n } from "../../i18n";
import { http } from "../../utils/axios";
import auth from "../../utils/auth";

export default function Reports() {
  const { t } = useI18n();
  const [report, setReport] = useState({
    range: null,
    kpis: { totalSales: 0, orders: 0, aov: 0 },
    salesByCategory: [],
    salesOverTime: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allTime, setAllTime] = useState(false);

  const fetchReport = async (range) => {
    try {
      setLoading(true);
      setError("");
      const token = auth.getToken();
      const res = await http.get("/admin/reports", {
        headers: { Authorization: `Bearer ${token}` },
        params: range || undefined,
      });
      setReport(res.data);
    } catch (_err) {
      setError(t("admin.reports.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const dateValue = useMemo(() => {
    const from = report?.range?.from ? new Date(report.range.from) : null;
    const to = report?.range?.to ? new Date(report.range.to) : null;
    const toInput = (d) => (d ? d.toISOString().slice(0, 10) : "");
    return {
      from: toInput(from),
      to: toInput(to),
    };
  }, [report]);

  const handleFromChange = (value) => {
    if (allTime) return;
    fetchReport({ from: value || undefined, to: dateValue.to || undefined });
  };

  const handleToChange = (value) => {
    if (allTime) return;
    fetchReport({ from: dateValue.from || undefined, to: value || undefined });
  };

  const handleToggleAllTime = (next) => {
    setAllTime(next);
    if (next) {
      fetchReport();
    } else {
      fetchReport({ from: dateValue.from || undefined, to: dateValue.to || undefined });
    }
  };

  const topProducts = (report?.topProducts || []).map((row) => ({
    name: row.name,
    cat: t(`admin.reports.categories.${row.category}`) || row.category,
    sales: row.sales,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {t("admin.admin")}
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#00294D]">
              {t("admin.reports.title")}
            </h1>
          </div>
          <DateRangePill
            from={dateValue.from}
            to={dateValue.to}
            onChangeFrom={handleFromChange}
            onChangeTo={handleToChange}
            isAllTime={allTime}
            onToggleAllTime={handleToggleAllTime}
            allTimeLabel={t("admin.reports.allTime")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          label={t("admin.reports.kpis.totalSales")}
          value={report?.kpis?.totalSales || 0}
          tone="yellow"
          isMoney
          kind="sales"
        />
        <KpiCard
          label={t("admin.reports.kpis.orders")}
          value={report?.kpis?.orders || 0}
          tone="red"
          kind="orders"
        />
        <KpiCard
          label={t("admin.reports.kpis.avgOrderValue")}
          value={report?.kpis?.aov || 0}
          tone="amber"
          isMoney
          kind="aov"
        />
      </div>

      {error && (
        <p className="text-sm font-semibold text-red-600">{error}</p>
      )}

      {loading && (
        <p className="text-sm text-gray-500">{t("admin.reports.loading")}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t("admin.reports.salesByCategory")}>
          <SalesByCategoryChart data={report?.salesByCategory || []} />
        </Card>
        <Card title={t("admin.reports.salesOverTime")}>
          <SalesOverTimeChart data={report?.salesOverTime || []} />
        </Card>
      </div>

      <TopProductsTable rows={topProducts} />
    </div>
  );
}
