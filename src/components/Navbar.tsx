import { useContext } from "react";
import { Code2, User } from 'lucide-react';
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Code2 className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">CodeMaster</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              Problems
            </Link>
            <Link to="/contests" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              Contest
            </Link>
            <Link to="discussions" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              Discuss
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            {user ? (
              <>
                <span className="mr-4">{user.name}</span>
                <button onClick={logout} className="bg-red-600 px-2 py-1 rounded">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mr-4">Login</Link>
                <Link to="/register">Register</Link>
              </>
          )}
      </div>
          <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
