import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/components/AdminDashboard";
import UserDashboard from "@/components/UserDashboard";

const Dashboard = () => {
  const { isAdmin } = useAuth(); // ProtectedRoute sudah jamin user ada
  return (
    <div className="min-h-screen bg-background">
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
};

export default Dashboard;
