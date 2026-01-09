import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Play, Upload, ChevronDown, 
  FileCode, Terminal, Info, CheckCircle2, 
  Plus, X, Settings2 
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import AddSubmissionDTO from "../types/compiler";
import { Problem, User } from "../data/problems";
import { GetUserDTO } from "../types/auth";

type CodeFile = { id: string; name: string; content: string; };

export default function ProblemDetail() {
  const { user, token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- State ---
  const [userData, setUser] = useState<User | null>(null);
  const [problem, setProblems] = useState<Problem>();
  const [activeTab, setActiveTab] = useState<"description" | "solutions" | "submissions">("description");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // File Management
  const [files, setFiles] = useState<CodeFile[]>([{ id: "main", name: "main.c", content: "" }]);
  const [activeFileId, setActiveFileId] = useState("main");

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // --- Helpers ---
  const normalizeArray = <T,>(obj?: { $values?: T[] } | T[]): T[] => {
    if (Array.isArray(obj)) return obj;
    return Array.isArray(obj?.$values) ? obj.$values : [];
  };

  const createSubmissionPayload = (): AddSubmissionDTO | null => {
    if (!userData || !problem) return null;
    const mergedSourceCode: Record<string, string> = {};
    files.forEach((file) => { mergedSourceCode[file.name] = file.content; });

    return {
      sourceCode: mergedSourceCode,
      namesOfFiles: files.map((f) => f.name),
      userId: userData.id,
      problemId: problem.problemId,
    };
  };

  // --- Effects ---
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
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
          }
        }
      } catch (error: any) {
        console.error("Initialization Error:", error.message);
      }
    };
    fetchData();
  }, [token, id, user?.name, user?.email]);

  // --- Handlers ---
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
    } catch (err: any) {
      setConsoleOutput(["Error", err.message]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F7F8FA]">
      {/* HEADER */}
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

      {/* MAIN CONTENT */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Problem Info */}
        <section className="w-1/2 flex flex-col bg-white border-r border-gray-200">
          <div className="flex border-b border-gray-100 px-4">
            {(["description", "solutions", "submissions"] as const).map((tab) => (
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
              <div className="max-w-3xl space-y-8">
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
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
                <CheckCircle2 className="w-12 h-12 mb-4 opacity-20" />
                Coming soon...
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL: Editor */}
        <section className="w-1/2 flex flex-col bg-[#1e1e1e]">
          {/* Toolbar */}
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
                className="flex items-center space-x-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-all shadow-lg shadow-emerald-900/20"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-wide">Submit</span>
              </button>
            </div>
          </div>

          {/* File Tabs */}
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
                 const id = crypto.randomUUID();
                 setFiles([...files, { id, name: `module_${files.length}.c`, content: "" }]);
                 setActiveFileId(id);
               }}
               className="p-3 text-gray-500 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Editor Area */}
          <div className="flex-1 relative group">
            <textarea
              value={activeFile.content}
              onChange={(e) => setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: e.target.value } : f))}
              className="w-full h-full p-6 bg-[#1e1e1e] text-emerald-50/90 font-mono text-sm resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
              placeholder="// Type your code here..."
            />
            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Settings2 className="w-5 h-5 text-gray-700 cursor-pointer hover:text-emerald-500" />
            </div>
          </div>

          {/* Console Section */}
          <div className="h-48 bg-[#1a1a1a] border-t border-[#333]">
            <div className="flex items-center px-4 py-2 bg-[#252526] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#333]">
              <Terminal className="w-3 h-3 mr-2" />
              Output Console
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-32px)] custom-scrollbar">
              {consoleOutput.map((line, i) => (
                <div key={i} className="font-mono text-xs text-gray-400 mb-1 flex animate-in fade-in slide-in-from-left-2">
                  <span className="text-emerald-900 mr-3 select-none">$</span>
                  <span className={line.includes("Error") ? "text-red-400" : ""}>{line}</span>
                </div>
              ))}
              {consoleOutput.length === 0 && <div className="text-gray-600 font-mono text-xs italic">Waiting for execution...</div>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}