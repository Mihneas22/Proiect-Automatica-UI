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
import { Problem, User } from "../types/models";
import { CalculateNumSub } from "../use_cases/admin/CalculateNumSub";
import { CalculateAverageAcc } from "../use_cases/admin/CalculateAverageAcc";

export default function AdminDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  const calculateUseCase = new CalculateNumSub();
  const calculateAverageAccUseCase = new CalculateAverageAcc();

  useEffect(() => {
    const checkAndFetch = async () => {
      if (!token) {
        console.log("No token found, redirecting to login...");
        setIsLoading(false);
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);

        const checkRes = await fetch("https://localhost:7148/api/admin/checkAdmin", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Token: token }),
        });

        const data = await checkRes.json();
        if (checkRes.ok && data.flag === true) {
          setIsAdminVerified(true);

          const [problemsRes, usersRes] = await Promise.all([
            fetch("https://localhost:7148/api/admin/getProblems", {
              headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            }),
            fetch("https://localhost:7148/api/admin/getUsers", {
              headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            }),
          ]);

          if (problemsRes.ok) {
            const pData = await problemsRes.json();
            const rawList = pData.problems?.$values || pData.problems || [];
            setProblems(Array.isArray(rawList) ? rawList : []);
          }

          if (usersRes.ok) {
            const uData = await usersRes.json();
            const rawList = uData.users?.$values || uData.users || [];
            setUsers(Array.isArray(rawList) ? rawList : []);
          }
        } else {
          console.error("Access denied:", data.message);
          navigate("/");
        }
      } catch (error) {
        console.error("Critical error:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAndFetch();
  }, [token, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F7F8FA]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdminVerified) return null;

  const filteredProblems = Array.isArray(problems)
    ? problems.filter((p) => {
        const name = p.name?.toLowerCase() || "";
        const id = p.problemId?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        return name.includes(search) || id.includes(search);
      })
    : [];

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
            <StatCard title="Total Problems" value={problems.length} icon={<BookOpen />} color="text-blue-600" bg="bg-blue-50" />
            <StatCard title="Total Submissions" value={calculateUseCase.execute(problems)} icon={<Activity />} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard title="Active Users" value={users.length} icon={<Users />} color="text-purple-600" bg="bg-purple-50" />
            <StatCard title="Avg. Success Rate" value={calculateAverageAccUseCase.execute(problems)} icon={<CheckCircle />} color="text-orange-600" bg="bg-orange-50" />
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
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {filteredProblems.map((prob) => (
                    <tr key={prob.problemId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{prob.name}</span>
                          <span className="text-xs text-gray-400">ID: {prob.problemId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                          <button className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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