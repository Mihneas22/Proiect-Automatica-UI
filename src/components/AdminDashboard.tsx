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

  // Funcție pentru verificarea permisiunilor și încărcarea datelor
  const verificaSiIncarcaDate = async () => {
    if (!token) {
      console.log("Token inexistent, redirecționare către login...");
      setIsLoading(false);
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      // Verificăm dacă utilizatorul este admin
      const checkRes = await fetch(
        "https://localhost:7148/api/admin/checkAdmin",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Token: token }),
        }
      );

      const data = await checkRes.json();
      
      if (checkRes.ok && data.flag === true) {
        setIsAdminVerified(true);

        // Încărcăm problemele și utilizatorii în paralel
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
        console.error("Acces refuzat:", data.message);
        navigate("/");
      }
    } catch (error) {
      console.error("Eroare critică:", error);
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verificaSiIncarcaDate();
  }, [token, navigate]);

  const stergeProblemaAsync = async (problem: Problem) => {
    if (!window.confirm(`Sigur dorești să ștergi problema "${problem.name}"?`)) return;

    try {
      const response = await fetch(
        `https://localhost:7148/api/problem/deleteProblem`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ Id: problem.problemId }),
        }
      );
      const result = await response.json();
      if (result.flag === true) {
        verificaSiIncarcaDate(); // Reîmprospătăm datele
      }
    } catch (err: any) {
      console.log(["Eroare", err.message]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F7F8FA]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Se verifică permisiunile...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdminVerified) return null;

  const problemeFiltrate = Array.isArray(problems)
    ? problems.filter((p) => {
        const nume = p.name?.toLowerCase() || "";
        const id = p.problemId?.toLowerCase() || "";
        const cautare = searchTerm.toLowerCase();
        return nume.includes(cautare) || id.includes(cautare);
      })
    : [];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3 text-emerald-600">
            <LayoutDashboard className="w-6 h-6" />
            <span className="font-bold text-lg tracking-tight text-gray-800">
              PanouAdmin
            </span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-semibold text-sm">
            <BarChart3 className="w-4 h-4" />
            <span>Prezentare Generală</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">Statistici Sistem</h2>
          <button
            onClick={() => navigate("/admin/addProblem")}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Crează Problemă</span>
          </button>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Probleme"
              value={problems.length}
              icon={<BookOpen />}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <StatCard
              title="Total Trimiteri"
              value={calculateUseCase.execute(problems)}
              icon={<Activity />}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <StatCard
              title="Utilizatori Activi"
              value={users.length}
              icon={<Users />}
              color="text-purple-600"
              bg="bg-purple-50"
            />
            <StatCard
              title="Rată Succes Medie"
              value={calculateAverageAccUseCase.execute(problems)}
              icon={<CheckCircle />}
              color="text-orange-600"
              bg="bg-orange-50"
            />
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Gestionare Probleme</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Caută..."
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
                    <th className="px-6 py-4">Problemă</th>
                    <th className="px-6 py-4 text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {problemeFiltrate.map((prob) => (
                    <tr
                      key={prob.problemId}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">
                            {prob.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            ID: {prob.problemId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            className="p-2 text-gray-400 hover:text-blue-600"
                            title="Editează"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => stergeProblemaAsync(prob)}
                            className="p-2 text-gray-400 hover:text-red-600"
                            title="Șterge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {problemeFiltrate.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={2} className="px-6 py-10 text-center text-gray-500">
                        Nu s-au găsit probleme care să corespundă căutării.
                      </td>
                    </tr>
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
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          {title}
        </p>
        <h4 className="text-2xl font-black text-gray-800">{value}</h4>
      </div>
      <div className={`p-3 ${bg} ${color} rounded-xl`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
    </div>
  );
}