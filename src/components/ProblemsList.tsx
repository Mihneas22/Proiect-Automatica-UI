import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Problem } from "../data/problems";
import { useAuth } from "../hooks/useAuth";

export default function ProblemsList() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    if (!user) return;

    const getProblems = async () => {
      try {
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

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch problems");
        }

        const result = await response.json();

        const problemsArray = Array.isArray(result.problems?.$values)
          ? result.problems.$values
          : [];

        setProblems(problemsArray);
      } catch (error: any) {
        console.error("Error fetching problems:", error.message);
      }
    };

    getProblems();
  }, [user, token]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody className="divide-y divide-gray-200">
            {problems.map((problem) => {
              const tagsArray = Array.isArray(problem.tags)
                ? problem.tags
                : [];

              return (
                <tr
                  key={problem.problemId ?? problem.name}
                  onClick={() => navigate(`/problems/${problem.problemId}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">{problem.name}</td>
                  <td className="px-6 py-4">{problem.acceptanceRate ?? "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {tagsArray.map((tag, index) => (  
                        <span
                          key={`${problem.problemId}-${tag}-${index}`}
                          className="px-2 py-1 text-xs bg-gray-100 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
