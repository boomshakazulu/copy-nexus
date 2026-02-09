export default function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-extrabold text-[#0B2A4A] mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
