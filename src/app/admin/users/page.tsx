"use client";
import { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setUsers(users.filter((u) => u._id !== id));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">👥 Users</h1>
        <p className="text-gray-500 mt-1">Manage all registered users</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Joined</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 text-white text-sm font-medium">{user.name}</td>
                  <td className="p-4 text-gray-400 text-sm">{user.email}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${
                      user.role === "admin"
                        ? "bg-red-900/50 text-red-400"
                        : user.role === "alumni"
                        ? "bg-purple-900/50 text-purple-400"
                        : "bg-blue-900/50 text-blue-400"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-400 hover:text-red-300 text-sm font-bold"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}