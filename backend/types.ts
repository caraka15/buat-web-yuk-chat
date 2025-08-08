export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string; // atau password_hash
  is_admin: number;
  created_at: Date;
  updated_at: Date;
}
