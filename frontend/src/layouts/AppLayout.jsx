import Sidebar from "../components/Sidebar.jsx";

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

export default AppLayout;
