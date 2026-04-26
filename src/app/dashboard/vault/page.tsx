"use client";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

interface Resource {
  _id: string;
  title: string;
  moduleCode: string;
  year: string;
  type: "paper" | "notes";
  fileUrl: string;
  fileType: "pdf" | "jpeg";
  tags: string[];
  description?: string;
  uploadedBy: { name: string };
  status: string;
  createdAt: string;
}

export default function VaultPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    moduleCode: "",
    year: "",
    type: "notes",
    description: "",
    tags: "",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await fetch("/api/resources");
      const data = await res.json();
      setResources(data.resources || []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a file"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", form.title);
      formData.append("moduleCode", form.moduleCode);
      formData.append("year", form.year);
      formData.append("type", form.type);
      formData.append("description", form.description);
      formData.append("tags", form.tags);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Resource uploaded successfully!");
        setShowUpload(false);
        setForm({
          title: "",
          moduleCode: "",
          year: "",
          type: "notes",
          description: "",
          tags: "",
        });
        setFile(null);
        fetchResources();
      } else {
       toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const filtered = resources.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.moduleCode.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || r.type === filterType;
    return matchSearch && matchType;
  });

 return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">📚 Resource Vault</h1>
          <p className="text-gray-500 mt-2">Browse and share study materials with your peers</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <span>+</span> Upload Resource
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Resources", value: resources.length },
          { label: "Past Papers", value: resources.filter(r => r.type === "paper").length },
          { label: "Notes", value: resources.filter(r => r.type === "notes").length },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title or module code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="paper">Past Papers</option>
          <option value="notes">Notes</option>
        </select>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading resources...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No resources found</p>
          <p className="text-gray-600 text-sm mt-2">Be the first to upload!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((resource) => (
            <div
              key={resource._id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    resource.type === "paper"
                      ? "bg-purple-900/50 text-purple-400"
                      : "bg-blue-900/50 text-blue-400"
                  }`}
                >
                  {resource.type === "paper" ? "Past Paper" : "Notes"}
                </span>
                <span className="text-xs text-gray-500">{resource.year}</span>
              </div>
              <h3 className="text-white font-bold mb-1">{resource.title}</h3>
              <p className="text-blue-400 text-sm font-mono mb-2">
                {resource.moduleCode}
              </p>
              {resource.description && (
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                  {resource.description}
                </p>
              )}
              <div className="flex flex-wrap gap-1 mb-4">
                {resource.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  by {resource.uploadedBy?.name || "Unknown"}
                </span>
                <a
                  href={resource.fileUrl.replace("/image/upload/", "/raw/upload/")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm font-bold"
                >
                     View file
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Upload Resource</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-500 hover:text-white text-2xl"
              >
                x
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Module Code (e.g. CS101)"
                  required
                  value={form.moduleCode}
                  onChange={(e) =>
                    setForm({ ...form, moduleCode: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Year (e.g. 2023)"
                  required
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="notes">Notes</option>
                <option value="paper">Past Paper</option>
              </select>
              <input
                type="text"
                placeholder="Tags (comma separated: math, calculus)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <p className="text-gray-400 text-sm">
                    {file ? file.name : "Click to upload PDF or JPEG"}
                  </p>
                </label>
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm"
              >
                {uploading ? "Uploading..." : "Upload Resource"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}