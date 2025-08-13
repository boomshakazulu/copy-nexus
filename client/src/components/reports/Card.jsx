export default function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-extrabold text-[#00294D] mb-3">{title}</h3>
      {children}
    </div>
  );
}
