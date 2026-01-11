import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Tag as TagIcon,
  Beaker,
  MessageSquare,
  ListTodo,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function CreateProblem() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    lab: "",
    content: "",
    points: 0,
    tags: [] as string[],
    requests: [] as string[],
    inputsJson: [""] as string[],
    outputsJson: [""] as string[],
  });

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
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
        } else {
          console.error("Acces refuzat de server");
          navigate("/");
        }
      } catch (error) {
        console.error("Eroare la verificarea accesului:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, [token, navigate]);

  const isValidJson = (str: string) => {
    if (!str.trim()) return true;
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleAddItem = (
    field: "tags" | "requests" | "inputsJson" | "outputsJson"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: ["", ...prev[field]],
    }));
  };

  const handleUpdateItem = (
    field: "tags" | "requests" | "inputsJson" | "outputsJson",
    index: number,
    value: string
  ) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData((prev) => ({ ...prev, [field]: newList }));
  };

  const handleRemoveItem = (
    field: "tags" | "requests" | "inputsJson" | "outputsJson",
    index: number
  ) => {
    const newList = formData[field].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [field]: newList }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allInputsPresent = formData.inputsJson.every((i) => i.trim() !== "");
    const allOutputsPresent = formData.outputsJson.every(
      (o) => o.trim() !== ""
    );

    if (!allInputsPresent || !allOutputsPresent) {
      alert("Te rog completează toate cazurile de test.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://localhost:7148/api/problem/addProblem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        navigate("/admin");
      } else {
        alert("Eroare la salvarea problemei pe server.");
      }
    } catch (error) {
      console.error("Eroare la crearea problemei:", error);
      alert("Eroare de conexiune la server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Verificăm permisiunile...</p>
        </div>
      </div>
    );
  }

  if (!isAdminVerified) return null;

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-20">
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            Creare Problemă Nouă
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "Se salvează..." : "Salvează Problema"}</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 mr-2" /> Informații Generale
            </h2>
            <input
              type="text"
              placeholder="Numele Problemei (ex: Suma a două întregi)"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <textarea
              placeholder="Descrierea problemei și cerințe..."
              className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none font-sans"
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                <Beaker className="w-4 h-4 mr-2" /> Cazuri de Test (JSON)
              </h2>
              <button
                onClick={() => {
                  handleAddItem("inputsJson");
                  handleAddItem("outputsJson");
                }}
                className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100 transition-colors flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" /> Adaugă Caz Nou
              </button>
            </div>

            <div className="space-y-4">
              {formData.inputsJson.map((_, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 relative group transition-all"
                >
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                      Intrare {formData.inputsJson.length - idx}
                    </label>
                    <input
                      className={`w-full p-2 bg-white border rounded-lg font-mono text-xs transition-all ${
                        isValidJson(formData.inputsJson[idx])
                          ? "border-gray-200 focus:ring-2 focus:ring-emerald-500/20"
                          : "border-red-500 bg-red-50"
                      }`}
                      value={formData.inputsJson[idx]}
                      onChange={(e) =>
                        handleUpdateItem("inputsJson", idx, e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                      Ieșire {formData.outputsJson.length - idx}
                    </label>
                    <input
                      className={`w-full p-2 bg-white border rounded-lg font-mono text-xs transition-all ${
                        isValidJson(formData.outputsJson[idx])
                          ? "border-gray-200 focus:ring-2 focus:ring-emerald-500/20"
                          : "border-red-500 bg-red-50"
                      }`}
                      value={formData.outputsJson[idx]}
                      onChange={(e) =>
                        handleUpdateItem("outputsJson", idx, e.target.value)
                      }
                    />
                  </div>
                  <button
                    onClick={() => {
                      handleRemoveItem("inputsJson", idx);
                      handleRemoveItem("outputsJson", idx);
                    }}
                    className="absolute -right-2 -top-2 bg-white text-red-500 p-1.5 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-wider">
              <Award className="w-4 h-4 mr-2" /> Punctaj & Lab
            </h2>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Nume Laborator
              </label>
              <input
                type="text"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                placeholder="Ex: Lab 01"
                onChange={(e) =>
                  setFormData({ ...formData, lab: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Puncte</label>
              <input
                type="number"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-wider">
              <TagIcon className="w-4 h-4 mr-2" /> Tag-uri (Etichete)
            </h2>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold flex items-center"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveItem("tags", i)}
                    className="ml-2 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              placeholder="Tag nou + Enter..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = e.currentTarget.value.trim();
                  if (val) {
                    setFormData((prev) => ({
                      ...prev,
                      tags: [val, ...prev.tags],
                    }));
                    e.currentTarget.value = "";
                  }
                }
              }}
            />
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-wider">
              <ListTodo className="w-4 h-4 mr-2" /> Cerințe (Requests)
            </h2>
            <div className="space-y-2">
              {formData.requests.map((req, i) => (
                <div key={i} className="flex space-x-2">
                  <input
                    className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    value={req}
                    onChange={(e) =>
                      handleUpdateItem("requests", i, e.target.value)
                    }
                  />
                  <button
                    onClick={() => handleRemoveItem("requests", i)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleAddItem("requests")}
              className="text-xs text-emerald-600 font-bold hover:underline flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" /> Adaugă Cerință
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
