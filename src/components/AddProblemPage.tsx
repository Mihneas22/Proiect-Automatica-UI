import React, { useState } from "react";
import { 
  ArrowLeft, Save, Plus, Trash2, Tag as TagIcon, 
  Beaker, MessageSquare, ListTodo, Award 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function CreateProblem() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Starea bazată pe AddProblemDTO
  const [formData, setFormData] = useState({
    name: "",
    lab: "",
    content: "",
    points: 0,
    tags: [] as string[],
    requests: [] as string[],
    inputsJson: [""] as string[],
    outputsJson: [""] as string[]
  });

  // Handlers pentru liste dinamice
  const handleAddItem = (field: 'tags' | 'requests' | 'inputsJson' | 'outputsJson') => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const handleUpdateItem = (field: 'tags' | 'requests' | 'inputsJson' | 'outputsJson', index: number, value: string) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData({ ...formData, [field]: newList });
  };

  const handleRemoveItem = (field: 'tags' | 'requests' | 'inputsJson' | 'outputsJson', index: number) => {
    const newList = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newList });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5052/api/problem/addProblem", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Error creating problem:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-20">
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Create New Problem</h1>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "Saving..." : "Save Problem"}</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Secțiunea Principală */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 mr-2" /> General Information
            </h2>
            <input
              type="text"
              placeholder="Problem Name (ex: Sum of Two Integers)"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <textarea
              placeholder="Problem description and requirements..."
              className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none font-sans"
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-wider">
              <Beaker className="w-4 h-4 mr-2" /> Test Cases (JSON Inputs/Outputs)
            </h2>
            {formData.inputsJson.map((_, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Input {idx + 1}</label>
                  <input
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg font-mono text-sm"
                    value={formData.inputsJson[idx]}
                    onChange={(e) => handleUpdateItem('inputsJson', idx, e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Expected Output {idx + 1}</label>
                  <input
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg font-mono text-sm"
                    value={formData.outputsJson[idx]}
                    onChange={(e) => handleUpdateItem('outputsJson', idx, e.target.value)}
                  />
                </div>
                {formData.inputsJson.length > 1 && (
                  <button 
                    onClick={() => { handleRemoveItem('inputsJson', idx); handleRemoveItem('outputsJson', idx); }}
                    className="absolute -right-2 -top-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={() => { handleAddItem('inputsJson'); handleAddItem('outputsJson'); }}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex items-center justify-center space-x-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Test Case</span>
            </button>
          </section>
        </div>

        {/* Sidebar Configurări */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-wider">
              <Award className="w-4 h-4 mr-2" /> Scoring & Lab
            </h2>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Lab Name</label>
              <input 
                type="text" 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" 
                placeholder="Ex: Lab 01"
                onChange={(e) => setFormData({...formData, lab: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Points</label>
              <input 
                type="number" 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold" 
                onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
              />
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-wider">
              <TagIcon className="w-4 h-4 mr-2" /> Tags
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold flex items-center">
                  {tag}
                  <button onClick={() => handleRemoveItem('tags', i)} className="ml-2 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input 
                id="tagInput"
                type="text" 
                className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" 
                placeholder="New tag..."
                onKeyDown={(e) => {
                  if(e.key === 'Enter') {
                    handleAddItem('tags');
                    handleUpdateItem('tags', formData.tags.length, (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-wider">
              <ListTodo className="w-4 h-4 mr-2" /> Requests
            </h2>
            {formData.requests.map((req, i) => (
              <div key={i} className="flex space-x-2">
                <input 
                  className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  value={req}
                  onChange={(e) => handleUpdateItem('requests', i, e.target.value)}
                />
                <button onClick={() => handleRemoveItem('requests', i)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
            <button onClick={() => handleAddItem('requests')} className="text-xs text-emerald-600 font-bold hover:underline flex items-center">
              <Plus className="w-3 h-3 mr-1" /> Add Request
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}