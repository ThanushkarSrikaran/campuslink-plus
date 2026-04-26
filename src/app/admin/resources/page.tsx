"use client";
import { useEffect, useState } from "react";

interface Resource {
  _id: string;
  title: string;
  moduleCode: string;
  type: string;
  status: string;
  uploadedBy: { name: string };
  createdAt: string;
  fileUrl: string;
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/resources")
      .then((r) => r.json())
      .then((d) => setResources(d.resources || []))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setResources(resources.map((r) => (r._id === id ? { ...r, status } : r)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
    setResources(resources.filter((r) => r._id !== id));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">📚 Resources</h1>
        <p className="text-gray-500 mt-1">
          Approve or reject uploaded resources
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : resources.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No resources yet</p>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <div
              key={resource._id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">
                    {resource.title}
                  </p>
                  <p className="text-blue-400 text-sm font-mono">
                    {resource.moduleCode}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {resource.type} • by{" "}
                    {resource.uploadedBy?.name || "Unknown"} •{" "}
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                      resource.status === "approved"
                        ? "bg-green-900/50 text-green-400"
                        : resource.status === "rejected"
                        ? "bg-red-900/50 text-red-400"
                        : "bg-yellow-900/50 text-yellow-400"
                    }`}
                  >
                    {resource.status}
                  </span>
                  
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm font-bold whitespace-nowrap"
                  >
                    View
                  </a>
                  {resource.status !== "approved" && (
                    <button
                      onClick={() => handleStatus(resource._id, "approved")}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
                    >
                      Approve
                    </button>
                  )}
                  {resource.status !== "rejected" && (
                    <button
                      onClick={() =>
                        handleStatus(resource._id, "rejected")
                      }
                      className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(resource._id)}
                    className="text-red-400 hover:text-red-300 text-sm font-bold whitespace-nowrap"
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