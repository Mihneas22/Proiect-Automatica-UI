import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Problem } from "../data/problems";
import { useAuth } from "../hooks/useAuth";
import { Tag, BookOpen, BarChart3, ChevronRight } from "lucide-react";

export default function ProblemsList() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;

    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "http://localhost:5052/api/problem/getProblems",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch problems");

        const result = await response.json();
        // Handle C# JSON $values wrapping if present
        const problemsArray = Array.isArray(result.problems?.$values)
          ? result.problems.$values
          : Array.isArray(result.problems)
          ? result.problems
          : [];

        setProblems(problemsArray);
      } catch (error: any) {
        console.error("Error:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, [user, token]);

  const getAcceptanceColor = (rate: number) => {
    if (rate > 70) return "text-emerald-500";
    if (rate > 40) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Problems</h1>
          <p className="text-gray-500 mt-2">
            Master your C programming skills with our curated labs.
          </p>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Lab
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acceptance
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                // Skeleton Loader
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6 bg-gray-50/50"></td>
                  </tr>
                ))
              ) : problems.length > 0 ? (
                problems.map((problem) => (
                  <tr
                    key={problem.problemId}
                    onClick={() => navigate(`/problems/${problem.problemId}`)}
                    className="group hover:bg-emerald-50/30 cursor-pointer transition-all duration-200"
                  >
                    {/* Problem Name */}
                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {problem.name}
                      </span>
                    </td>

                    {/* Lab Name */}
                    <td className="px-6 py-5">
                      <div className="flex items-center text-sm text-gray-500">
                        <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                        {problem.lab || "General"}
                      </div>
                    </td>

                    {/* Acceptance Rate */}
                    <td className="px-6 py-5">
                      <div className="flex items-center text-sm font-medium">
                        <BarChart3 className="w-4 h-4 mr-2 text-gray-400" />
                        <span
                          className={getAcceptanceColor(problem.acceptanceRate)}
                        >
                          {problem.acceptanceRate
                            ? `${problem.acceptanceRate}%`
                            : "0%"}
                        </span>
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          // 1. Extrage array-ul brut indiferent de format (standard sau $values)
                          const rawTags =
                            (problem.tags as any)?.$values ?? problem.tags;

                          // 2. Verifică dacă este într-adevăr un array înainte de a folosi slice și map
                          if (Array.isArray(rawTags)) {
                            return rawTags
                              .slice(0, 3)
                              .map((tag: string, index: number) => (
                                <span
                                  key={`${problem.problemId}-tag-${index}`}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ));
                          }
                          return null; // Nu randează nimic dacă nu sunt tag-uri valide
                        })()}
                      </div>
                    </td>

                    {/* Action Arrow */}
                    <td className="px-6 py-5 text-right">
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No problems found. Check back later!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
