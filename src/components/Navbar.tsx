import { useContext } from "react";
import { Code2, User, LogOut, ChevronDown } from 'lucide-react';
import AuthContext from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        
        <div className="flex items-center space-x-12">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="bg-emerald-600 p-1.5 rounded-lg group-hover:bg-emerald-700 transition-colors">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              Code<span className="text-emerald-600">Master</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {[
              { name: "Problems", path: "/" },
              { name: "Contests", path: "/contests" },
              { name: "Discuss", path: "/discussions" }
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
                </div>
                
                <div className="relative group">
                  <button className="flex items-center space-x-1 p-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                    <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white shadow-md shadow-emerald-200">
                      <User className="w-5 h-5" />
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right group-hover:translate-y-0 translate-y-2 z-50">
                    <div className="p-2">
                      <button 
                        onClick={logout}
                        className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link 
                to="/login" 
                className="px-5 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2 text-sm font-bold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95"
              >
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}