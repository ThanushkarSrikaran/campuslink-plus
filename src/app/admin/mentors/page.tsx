"use client";
import { useEffect, useState } from "react";

interface Mentor {
  _id: string;
  userId: { name: string; email: string };
  bio: string;
  modules: string[];
  status: string;
  availability: string;
  isProfileComplete: boolean;
  createdAt: string;
}

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/mentors")
      .then((r) => r.json())
      .then((d) => setMentors(d.mentors || []))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/mentors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMentors(mentors.map((m) => (m._id === id ? { ...m, status } : m)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this mentor profile?")) return;
    await fetch(`/api/admin/mentors/${id}`, { method: "DELETE" });
    setMentors(mentors.filter((m) => m._id !== id));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">👨‍🏫 Mentors</h1>
        <p className="text-gray-500 mt-1">Manage mentor profiles</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : mentors.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No mentors yet</p>
      ) : (
        <div className="space-y-4">
          {mentors.map((mentor) => (
            <div
              key={mentor._id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {mentor.userId?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold">{mentor.userId?.name}</p>
                    <p className="text-gray-400 text-sm">{mentor.userId?.email}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mentor.modules?.map((mod) => (
                        <span
                          key={mod}
                          className="text-xs bg-purple-900/50 text-purple-400 px-2 py-1 rounded-lg"
                        >
                          {mod}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs mt-2 max-w-md line-clamp-2">
                      {mentor.bio || "No bio yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    mentor.status === "approved"
                      ? "bg-green-900/50 text-green-400"
                      : mentor.status === "rejected"
                      ? "bg-red-900/50 text-red-400"
                      : "bg-yellow-900/50 text-yellow-400"
                  }`}>
                    {mentor.status}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    mentor.availability === "available"
                      ? "bg-green-900/30 text-green-500"
                      : mentor.availability === "in-session"
                      ? "bg-yellow-900/30 text-yellow-500"
                      : "bg-red-900/30 text-red-500"
                  }`}>
                    {mentor.availability}
                  </span>
                  {mentor.status !== "approved" && (
                    <button
                      onClick={() => handleStatus(mentor._id, "approved")}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-bold"
                    >
                      Approve
                    </button>
                  )}
                  {mentor.status !== "rejected" && (
                    <button
                      onClick={() => handleStatus(mentor._id, "rejected")}
                      className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1 rounded-lg text-xs font-bold"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(mentor._id)}
                    className="text-red-400 hover:text-red-300 text-sm font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}