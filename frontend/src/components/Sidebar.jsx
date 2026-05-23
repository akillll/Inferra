const navigationItems = [
  { label: "Chat", href: "#chat", active: true },
  { label: "Models", href: "#models", active: false },
  { label: "Ingestion", href: "#ingestion", active: false },
  { label: "Settings", href: "#settings", active: false },
];

function Sidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-lg font-semibold text-slate-950">Inferra</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`block rounded-md px-3 py-2 text-sm font-medium ${
              item.active
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
