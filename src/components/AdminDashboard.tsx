import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, BookOpen, Users, Activity, 
  Plus, Search, Edit3, Trash2, ExternalLink,
  CheckCircle, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Tipuri de date pentru Dashboard
interface DashboardStats {
  totalProblems: number;
  totalSubmissions: number;
  totalUsers: number;
  successRate: number;
}

interface ProblemSummary {
  problemId: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptanceRate: number;
  totalSubmissions: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalProblems: 0, totalSubmissions: 0, totalUsers: 0, successRate: 0
  });
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Aici vei apela API-ul de Admin
    // Exemplu: fetchStats(); fetchProblems();
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      {/* Sidebar - Navigație Admin */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
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
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium text-sm transition-all">
            <BookOpen className="w-4 h-4" />
            <span>Manage Problems</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium text-sm transition-all">
            <Users className="w-4 h-4" />
            <span>Users Control</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">System Overview</h2>
          <button 
            onClick={() => navigate("/admin/problems/new")}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-md shadow-emerald-100 text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Create Problem</span>
          </button>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Problems" value="128" icon={<BookOpen />} color="text-blue-600" bg="bg-blue-50" />
            <StatCard title="Total Submissions" value="14,202" icon={<Activity />} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard title="Active Users" value="3,450" icon={<Users />} color="text-purple-600" bg="bg-purple-50" />
            <StatCard title="Avg. Success Rate" value="64.2%" icon={<CheckCircle />} color="text-orange-600" bg="bg-orange-50" />
          </div>

          {/* Table Section */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold text-gray-800">Problem Management</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by ID or name..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-64"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                    <th className="px-6 py-4">Problem</th>
                    <th className="px-6 py-4">Difficulty</th>
                    <th className="px-6 py-4">Success Rate</th>
                    <th className="px-6 py-4">Submissions</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">Two Sum</span>
                          <span className="text-xs text-gray-400 font-mono">ID: PROB-00{i+1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold uppercase">
                          Easy
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[70%]" />
                          </div>
                          <span className="text-xs font-medium text-gray-600">70%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">1,240</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => navigate(`/problem/PROB-00${i+1}`)}
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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