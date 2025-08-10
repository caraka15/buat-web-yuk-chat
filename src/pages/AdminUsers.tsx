import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AppUser {
  id: string;
  name: string;
  email: string;
  is_admin: number;
  created_at: string;
}

const AdminUsers: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function fetchUsers() {
    try {
      if (!user?.token) return;
      setLoading(true);
      const data = await api.get<AppUser[]>("/admin/users", user.token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat user";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAdmin(target: AppUser) {
    try {
      await api.put(
        `/admin/users/${target.id}/role`,
        { is_admin: target.is_admin ? 0 : 1 },
        user?.token,
      );
      toast({
        title: "Berhasil",
        description: "Role user diperbarui",
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === target.id ? { ...u, is_admin: target.is_admin ? 0 : 1 } : u,
        ),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memperbarui user";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  }

  if (!isAdmin) {
    return <div className="p-6 text-center">Akses ditolak</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Kelola User</h1>
          <p className="text-muted-foreground">Atur hak akses pengguna</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Kembali</Button>
          <Button variant="outline" onClick={logout}>Keluar</Button>
        </div>
      </div>

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <Card key={u.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{u.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant={u.is_admin ? "default" : "secondary"}>
                  {u.is_admin ? "Admin" : "User"}
                </Badge>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleAdmin(u)}
                  disabled={u.id === user?.userId}
                >
                  {u.is_admin ? "Jadikan User" : "Jadikan Admin"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
