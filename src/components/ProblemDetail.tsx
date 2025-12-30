import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Upload, ChevronDown } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import AddSubmissionDTO from "../types/compiler";
import { Problem, User } from "../data/problems";
import { GetUserDTO } from "../types/auth";

export default function ProblemDetail() {
  const { user, token } = useAuth();
  const [userData, setUser] = useState<User | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblems] = useState<Problem>();

  type CodeFile = {
    id: string;
    name: string;
    content: string;
  };

  const [files, setFiles] = useState<CodeFile[]>([
    { id: "main", name: "main.c", content: "" },
  ]);

  const [activeFileId, setActiveFileId] = useState("main");
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [tempFileName, setTempFileName] = useState("");

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const normalizeArray = <T,>(obj?: { $values?: T[] }): T[] => {
    return Array.isArray(obj?.$values) ? obj.$values : [];
  };

  useEffect(() => {
    if (!token) return;

    const userDto: GetUserDTO = {
      Username: user?.name || "",
      Email: user?.email || "",
    };

    const userDataFetch = async () => {
      try {
        const response = await fetch("http://localhost:5052/api/user/getUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userDto),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch user");
        }

        const result = await response.json();
        console.log("RAW USER FROM API:", result.user);
        setUser(result.user);

        if (result.flag == false) {
          console.log("Error: " + result.message);
          return;
        }
      } catch (error: any) {
        console.error("Error fetching user:", error.message);
      }
    };

    userDataFetch();

    const getProblems = async () => {
      try {
        const response = await fetch(
          `http://localhost:5052/api/problem/getProblem/${id}`,
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

        if (result.problem) {
          result.problem.tags = normalizeArray(result.problem.tags);
          result.problem.inputsJson = normalizeArray(result.problem.inputsJson);
          result.problem.outputsJson = normalizeArray(result.problem.outputsJson);
        }

        setProblems(result.problem);
      } catch (error: any) {
        console.error("Error fetching problems:", error.message);
      }
    };

    getProblems();
  }, [token, id]);

  useEffect(() => {
    if (user) console.log("User logged", user);
  }, [user]);

  const [activeTab, setActiveTab] = useState<
    "description" | "solutions" | "submissions"
  >("description");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    if (!userData || !problem) {
      setConsoleOutput(["You must be logged in and select a problem."]);
      return;
    }

    const mergedSourceCode: Record<string, string> = {};
    files.forEach((file) => {
      mergedSourceCode[file.name] = file.content;
    });

    setConsoleOutput(["Running solution..."]);

    const runAllTests = async () => {
      const payload: AddSubmissionDTO = {
        sourceCode: mergedSourceCode,
        namesOfFiles: files.map((f) => f.name),
        userId: userData.id,
        problemId: problem.problemId,
      };

      const response = await fetch(
        "http://localhost:5052/api/compiler/runCode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      setConsoleOutput([result.message]);
    };
    runAllTests();
  };

  const handleSubmit = async () => {
    if (!userData || !problem) {
      setConsoleOutput(["You must be logged in and select a problem."]);
      return;
    }

    setConsoleOutput(["Submitting solution..."]);

    const mergedSourceCode: Record<string, string> = {};
    files.forEach((file) => {
      mergedSourceCode[file.name] = file.content;
    });

    const payload: AddSubmissionDTO = {
      sourceCode: mergedSourceCode,
      namesOfFiles: files.map((f) => f.name),
      userId: userData.id,
      problemId: problem.problemId,
    };

    try {
      const response = await fetch(
        "http://localhost:5052/api/compiler/addSubmission",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Submission failed");
      }

      const result = await response.json();

      setConsoleOutput([
        result.message
      ]);
    } catch (error: any) {
      setConsoleOutput([
        "Submission failed",
        "",
        error.message || "Unexpected error",
      ]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600">
                {problem?.problemId}.
              </span>
              <h1 className="text-lg font-semibold text-gray-900">
                {problem?.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto bg-white">
          <div className="p-6">
            <div className="flex space-x-6 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("description")}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === "description"
                    ? "text-emerald-600 border-b-2 border-emerald-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("solutions")}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === "solutions"
                    ? "text-emerald-600 border-b-2 border-emerald-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Solutions
              </button>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === "submissions"
                    ? "text-emerald-600 border-b-2 border-emerald-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Submissions
              </button>
            </div>

            {activeTab === "description" && (
              <div className="space-y-6">
                <div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {problem?.content}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Examples
                  </h3>
                  <div className="space-y-4">
                    {problem?.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Constraints
                  </h3>
                  <div className="space-y-1">
                    {problem?.inputsJson?.map((input, index) => (
                      <div key={index} className="flex space-x-4">
                        <span className="text-sm font-mono text-gray-700">
                          Input: {input}
                        </span>
                        <span className="text-sm font-mono text-gray-700">
                          Output: {problem.outputsJson[index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {problem?.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Acceptance Rate:{" "}
                    <span className="font-medium text-gray-900">
                      {problem?.acceptanceRate}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "solutions" && (
              <div className="text-center py-12 text-gray-500">
                Solutions will be available after submission
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="text-center py-12 text-gray-500">
                No submissions yet
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 flex flex-col bg-gray-900">
          <div className="border-b border-gray-700 px-4 py-3 flex items-center justify-between bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select className="appearance-none bg-gray-700 text-gray-200 px-4 py-2 pr-10 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer">
                  <option>C</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Run</span>
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Submit</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* FILE TABS */}
            <div className="flex bg-gray-800 border-b border-gray-700">
              {files.map((file) => (
                <div key={file.id} className="flex items-center">
                  {renamingFileId === file.id ? (
                    <input
                      autoFocus
                      value={tempFileName}
                      onChange={(e) => setTempFileName(e.target.value)}
                      onBlur={() => setRenamingFileId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setFiles((prev) =>
                            prev.map((f) =>
                              f.id === file.id
                                ? { ...f, name: tempFileName || f.name }
                                : f
                            )
                          );
                          setRenamingFileId(null);
                        }
                        if (e.key === "Escape") {
                          setRenamingFileId(null);
                        }
                      }}
                      className="px-3 py-1 bg-gray-900 text-white font-mono text-sm w-32 outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => setActiveFileId(file.id)}
                      onDoubleClick={() => {
                        setRenamingFileId(file.id);
                        setTempFileName(file.name);
                      }}
                      className={`px-4 py-2 text-sm font-mono transition
              ${
                file.id === activeFileId
                  ? "bg-gray-900 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
                    >
                      {file.name}
                    </button>
                  )}
                  {files.length > 1 && (
                    <button
                      onClick={() => {
                        setFiles((prev) =>
                          prev.filter((f) => f.id !== file.id)
                        );
                        if (activeFileId === file.id) {
                          setActiveFileId(files[0].id);
                        }
                      }}
                      className="px-2 text-gray-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newId = crypto.randomUUID();
                  setFiles((prev) => [
                    ...prev,
                    { id: newId, name: `file${prev.length}.c`, content: "" },
                  ]);
                  setActiveFileId(newId);
                }}
                className="ml-auto px-4 text-gray-400 hover:text-white"
              >
                +
              </button>
            </div>

            {/* TEXTAREA (UI IDENTIC) */}
            <textarea
              value={activeFile.content}
              onChange={(e) =>
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === activeFileId
                      ? { ...f, content: e.target.value }
                      : f
                  )
                )
              }
              className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>

          <div className="h-64 border-t border-gray-700 bg-gray-800 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Console
              </h3>
              {consoleOutput.length > 0 ? (
                <div className="space-y-1 font-mono text-sm text-gray-300">
                  {consoleOutput.map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Run your code to see output here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
