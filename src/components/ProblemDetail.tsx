import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Play, Upload, ChevronDown, 
  FileCode, Terminal, Info, CheckCircle2, 
  Plus, X, Settings2, Clock
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import AddSubmissionDTO from "../types/compiler";
import { Problem, Submission, User } from "../types/models";
import { GetUserDTO } from "../types/auth";

type CodeFile = { id: string; name: string; content: string; };

export default function ProblemDetail() {
  const { user, token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [userData, setUser] = useState<User | null>(null);
  const [problem, setProblems] = useState<Problem>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<"description" | "submissions">("description");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const [files, setFiles] = useState<CodeFile[]>([{ id: "main", name: "main.c", content: "" }]);
  const [activeFileId, setActiveFileId] = useState("main");

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const normalizeArray = <T,>(obj?: { $values?: T[] } | T[]): T[] => {
    if (Array.isArray(obj)) return obj;
    return Array.isArray(obj?.$values) ? obj.$values : [];
  };

  const fetchData = async () => {
    if (!token) return;
    try {
      const userDto: GetUserDTO = { Username: user?.name || "", Email: user?.email || "" };
      const [userRes, probRes] = await Promise.all([
        fetch("http://localhost:5052/api/user/getUser", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(userDto),
        }),
        fetch(`http://localhost:5052/api/problem/getProblem/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        })
      ]);

      if (userRes.ok) {
        const res = await userRes.json();
        setUser(res.user);
      }

      if (probRes.ok) {
        const res = await probRes.json();
        if (res.problem) {
          res.problem.tags = normalizeArray(res.problem.tags);
          res.problem.inputsJson = normalizeArray(res.problem.inputsJson);
          res.problem.outputsJson = normalizeArray(res.problem.outputsJson);
          setProblems(res.problem);
          setSubmissions(normalizeArray(res.problem.problemSubmissions))
        }
      }
    } catch (error: any) {
      console.error("Initialization Error:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, id, user?.name, user?.email]);

  const createSubmissionPayload = (): AddSubmissionDTO | null => {
    if(!problem)
      return null;
    if (!userData || user?.role != "admin") 
      return null;
    const mergedSourceCode: Record<string, string> = {};
    files.forEach((file) => { mergedSourceCode[file.name] = file.content; });

    return {
      sourceCode: mergedSourceCode,
      namesOfFiles: files.map((f) => f.name),
      userId: userData.id,
      problemId: problem!.problemId,
    };
  };

  const handleAction = async (endpoint: string) => {
    const payload = createSubmissionPayload();
    if (!payload) return setConsoleOutput(["Auth error: Please log in again."]);

    setIsRunning(true);
    setConsoleOutput([`${endpoint === 'runCode' ? 'Running' : 'Submitting'}...`]);

    try {
      const response = await fetch(`http://localhost:5052/api/compiler/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      setConsoleOutput([result.message]);

      if (endpoint === 'addSubmission') {
        await fetchData();
      }
    } catch (err: any) {
      setConsoleOutput(["Error", err.message]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F7F8FA]">
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-500 hover:text-emerald-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-6 w-[1px] bg-gray-200 mx-2" />
          <div className="flex items-baseline space-x-2">
            <span className="text-gray-400 font-mono text-sm">{problem?.problemId}</span>
            <h1 className="text-base font-bold text-gray-800 tracking-tight">{problem?.name}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <div className={`px-3 py-1 rounded-full font-medium ${problem?.acceptanceRate && problem.acceptanceRate > 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
            {problem?.acceptanceRate}% Acceptance
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <section className="w-1/2 flex flex-col bg-white border-r border-gray-200">
          <div className="flex border-b border-gray-100 px-4">
            {(["description", "submissions"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-semibold capitalize transition-all relative ${
                  activeTab === tab ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === "description" ? (
              <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
                <div className="prose prose-slate max-w-none">
                  <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line font-sans">
                    {problem?.content}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="flex items-center text-sm font-bold text-gray-900 uppercase tracking-wider">
                    <Info className="w-4 h-4 mr-2 text-emerald-500" /> Examples
                  </h3>
                  <div className="space-y-3">
                    {problem?.inputsJson?.map((input, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 font-mono text-xs">
                        <div className="grid grid-cols-12 gap-2">
                          <span className="col-span-2 text-gray-400 font-bold uppercase">Input</span>
                          <span className="col-span-10 text-gray-800 bg-white p-1 rounded border border-gray-200">{input}</span>
                          <span className="col-span-2 text-gray-400 font-bold uppercase">Output</span>
                          <span className="col-span-10 text-emerald-700 font-bold">{problem.outputsJson[idx]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {problem?.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold uppercase tracking-tight">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeTab === "submissions" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-lg font-bold text-gray-900">Recent Submissions</h3>
                <div className="space-y-3">
                  {submissions.filter(s => s.problemId === id).length > 0 ? (
                    submissions
                      .filter(s => s.problemId === id)
                      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                      .map((sub) => {
                        const isAccepted = Number(sub.status) === 1;
                        return (
                          <div key={sub.submissionId} className="group bg-white border border-gray-100 rounded-xl p-4 hover:border-emerald-200 transition-all shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-lg ${isAccepted ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                  {isAccepted ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`font-bold text-sm ${isAccepted ? 'text-emerald-600' : 'text-red-600'}`}>
                                      {isAccepted ? "Accepted" : "Wrong Answer"}
                                    </span>
                                    <span className="text-gray-300 text-xs">•</span>
                                    <span className="text-gray-500 text-[11px] flex items-center">
                                      <Clock className="w-3 h-3 mr-1" /> {new Date(sub.submittedAt).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-0.5 italic">{sub.message}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  setFiles([{ id: "main", name: "main.c", content: sub.content }]);
                                  setActiveFileId("main");
                                }}
                                className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold uppercase rounded-lg transition-all"
                              >
                                Restore
                              </button>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-20 text-gray-400 italic">No submissions yet.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
                <CheckCircle2 className="w-12 h-12 mb-4 opacity-20" />
                Solutions are currently hidden.
              </div>
            )}
          </div>
        </section>

        <section className="w-1/2 flex flex-col bg-[#1e1e1e]">
          <div className="h-12 bg-[#252526] border-b border-black/20 flex items-center justify-between px-4">
            <div className="flex items-center space-x-2 bg-[#333333] px-3 py-1 rounded border border-[#444] text-emerald-400 text-xs font-bold">
              <FileCode className="w-3.5 h-3.5" />
              <span>C Language</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleAction('runCode')}
                disabled={isRunning}
                className="group flex items-center space-x-2 px-3 py-1.5 bg-[#333] hover:bg-[#444] text-gray-300 rounded-md transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 group-hover:text-emerald-400" />
                <span className="text-xs font-bold uppercase">Run</span>
              </button>
              <button 
                onClick={() => handleAction('addSubmission')}
                disabled={isRunning}
                className="flex items-center space-x-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-wide">Submit</span>
              </button>
            </div>
          </div>

          <div className="flex bg-[#252526] overflow-x-auto no-scrollbar border-b border-black/20">
            {files.map((file) => (
              <div 
                key={file.id} 
                onClick={() => setActiveFileId(file.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 cursor-pointer border-r border-black/10 transition-all ${
                  file.id === activeFileId ? "bg-[#1e1e1e] border-t-2 border-t-emerald-500" : "bg-[#2d2d2d] opacity-60 hover:opacity-100"
                }`}
              >
                <span className="text-xs font-mono text-gray-300">{file.name}</span>
                {files.length > 1 && (
                  <X 
                    className="w-3 h-3 text-gray-500 hover:text-red-400" 
                    onClick={(e) => {
                      e.stopPropagation();
                      const filtered = files.filter(f => f.id !== file.id);
                      setFiles(filtered);
                      if(activeFileId === file.id) setActiveFileId(filtered[0].id);
                    }}
                  />
                )}
              </div>
            ))}
            <button 
               onClick={() => {
                 const newId = crypto.randomUUID();
                 setFiles([...files, { id: newId, name: `module_${files.length}.c`, content: "" }]);
                 setActiveFileId(newId);
               }}
               className="p-3 text-gray-500 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 relative group">
            <textarea
              value={activeFile.content}
              onChange={(e) => setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: e.target.value } : f))}
              className="w-full h-full p-6 bg-[#1e1e1e] text-emerald-50/90 font-mono text-sm resize-none focus:outline-none leading-relaxed custom-scrollbar"
              spellCheck={false}
              placeholder="// Type your code here..."
            />
            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Settings2 className="w-5 h-5 text-gray-700 cursor-pointer hover:text-emerald-500" />
            </div>
          </div>

          <div className="h-48 bg-[#1a1a1a] border-t border-[#333]">
            <div className="flex items-center px-4 py-2 bg-[#252526] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#333]">
              <Terminal className="w-3 h-3 mr-2" />
              Output Console
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-32px)] custom-scrollbar">
              {consoleOutput.map((line, i) => (
                <div key={i} className="font-mono text-[11px] text-gray-400 mb-1 flex animate-in fade-in slide-in-from-left-2">
                  <span className="text-emerald-900 mr-3 select-none">$</span>
                  <span className={line.includes("Error") || line.includes("failed") ? "text-red-400" : ""}>{line}</span>
                </div>
              ))}
              {consoleOutput.length === 0 && <div className="text-gray-600 font-mono text-[11px] italic">Waiting for execution...</div>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}