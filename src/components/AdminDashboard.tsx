import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Activity,
  Plus,
  Search,
  Edit3,
  Trash2,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface DashboardStats {
  totalProblems: number;
  totalSubmissions: number;
  totalUsers: number;
  successRate: number;
}

interface ProblemSummary {
  problemId: string;
  name: string;
  difficulty: string;
  acceptanceRate: number;
  totalSubmissions: number;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    totalProblems: 0,
    totalSubmissions: 0,
    totalUsers: 0,
    successRate: 0,
  });
  
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role != "admin") {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [problemsRes, usersRes] = await Promise.all([
          fetch("https://localhost:7148/api/admin/getProblems", {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
          fetch("https://localhost:7148/api/admin/getUsers", {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
        ]);

        if (problemsRes.ok) {
          const data = await problemsRes.json();
          
          const rawList = data.problems?.$values || data.problems || [];
          const problemsList = Array.isArray(rawList) ? rawList : [];
          
          setProblems(problemsList);
          setStats((prev) => ({
            ...prev,
            totalProblems: problemsList.length,
          }));
        }

        if (usersRes.ok) {
          const data = await usersRes.json();
          const usersList = data.users?.$values || data.users || [];
          setStats((prev) => ({
            ...prev,
            totalUsers: Array.isArray(usersList) ? usersList.length : 0,
          }));
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, token]);
  
  const filteredProblems = Array.isArray(problems) 
    ? problems.filter((p) => {
        const name = p.name?.toLowerCase() || "";
        const id = p.problemId?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        return name.includes(search) || id.includes(search);
      })
    : [];

  if (user?.role != "admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white shadow-xl rounded-2xl">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acces Refuzat</h1>
          <p className="text-gray-600">Nu ai permisiuni de administrator.</p>
          <button onClick={() => navigate("/")} className="mt-4 text-emerald-600 font-bold">
            Înapoi la Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3 text-emerald-600">
            <LayoutDashboard className="w-6 h-6" />
            <span className="font-bold text-lg tracking-tight text-gray-800">AdminPanel</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-semibold text-sm">
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Manage Problems</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">System Overview</h2>
          <button
            onClick={() => navigate("/admin/addProblem")}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Create Problem</span>
          </button>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Problems" value={stats.totalProblems} icon={<BookOpen />} color="text-blue-600" bg="bg-blue-50" />
            <StatCard title="Total Submissions" value="14,202" icon={<Activity />} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard title="Active Users" value={stats.totalUsers} icon={<Users />} color="text-purple-600" bg="bg-purple-50" />
            <StatCard title="Avg. Success Rate" value="64.2%" icon={<CheckCircle />} color="text-orange-600" bg="bg-orange-50" />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Problem Management</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                    <th className="px-6 py-4">Problem</th>
                    <th className="px-6 py-4">Difficulty</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {isLoading ? (
                    <tr><td colSpan={3} className="p-10 text-center text-gray-400">Loading data...</td></tr>
                  ) : filteredProblems.length > 0 ? (
                    filteredProblems.map((prob) => (
                      <tr key={prob.problemId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800">{prob.name}</span>
                            <span className="text-xs text-gray-400">ID: {prob.problemId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                            prob.difficulty === "Hard" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                          }`}>
                            {prob.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                            <button className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="p-10 text-center text-gray-400">No problems found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <h4 className="text-2xl font-black text-gray-800">{value}</h4>
      </div>
      <div className={`p-3 ${bg} ${color} rounded-xl`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
    </div>
  );
}