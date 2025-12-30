import { useEffect } from "react"
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProblemsList from "./components/ProblemsList";
import ProblemDetail from "./components/ProblemDetail";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { useAuth } from "./hooks/useAuth"
import { GetUserDTO } from "./types/auth";

function App() {
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user)
      return;

    const userDto: GetUserDTO = {
      Username: user?.name || "",
      Email: user?.email || ""
    };

    const userData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5052/api/user/getUser",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userDto)
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch user");
        }

        const result = await response.json();
        if(result.flag == false)
        {
          console.log("Error: " + result.message);
          return;
        }
      } catch (error: any) {
        console.error("Error fetching user:", error.message);
      }
    };

    userData();

  }, [user]);
  return (

    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* Authentication routes */}
        <Route path="/login" element={<LoginForm onSwitchToRegister={() => {}} />} />
        <Route path="/register" element={<RegisterForm onSwitchToLogin={() => {}} />} />

        {/* Problems list and detail */}
        <Route path="/" element={<ProblemsList/>} />
        <Route path="/problems/:id" element={<ProblemDetail />}/>

        {/* Fallback 404 */}
        <Route path="*" element={<p className="p-4">Page not found</p>} />
      </Routes>
    </div>
  );
}

export default App;
