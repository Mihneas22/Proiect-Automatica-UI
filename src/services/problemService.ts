import { Problem } from "../data/problems";

export async function fetchProblem(token: string, id: string): Promise<Problem> {
  const response = await fetch(`http://localhost:5052/api/problem/getProblem/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch problem");
  }

  const result = await response.json();
  return result.problem;
}
