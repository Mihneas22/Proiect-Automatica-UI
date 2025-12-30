import AddSubmissionDTO from "../types/compiler";

export async function runSubmission(payload: AddSubmissionDTO, token: string) {
  const response = await fetch("http://localhost:5052/api/compiler/addSub", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Submission failed");
  }

  return response.json();
}
