import React from "react";
import { LogIn, LogOut, Calendar } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { User } from "lucide-react";

export const AuthButton: React.FC = () => {
  const { authState, login, logout } = useAuth();

  if (authState.isAuthenticated && authState.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <Calendar className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700">Calendar Connected</span>
        </div>

        <div className="flex items-center gap-2">
          {authState.user.picture ? (
            <img
              src={authState.user.picture}
              alt={authState.user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {authState.user.name}
            </p>
            <p className="text-xs text-gray-500">{authState.user.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
    >
      <LogIn className="w-4 h-4" />
      <span className="font-medium">Connect Google Calendar</span>
    </button>
  );
};
