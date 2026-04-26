"use client";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const DAYS = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
];

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "✅ Available", color: "bg-green-600" },
  { value: "busy", label: "🔴 Busy", color: "bg-red-600" },
  { value: "in-session", label: "🟡 In Session", color: "bg-yellow-600" },
];

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export default function MentorProfilePage() {
  const { data: session } = useSession();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ bio: "", modules: "" });
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newSlot, setNewSlot] = useState<TimeSlot>({
    day: "Monday",
    startTime: "09:00",
    endTime: "11:00",
  });

  useEffect(() => {
    if ((session?.user as any)?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(
        `/api/mentors/me?userId=${(session?.user as any)?.id}`
      );
      const data = await res.json();
      if (data.mentor) {
        setMentor(data.mentor);
        setForm({
          bio: data.mentor.bio || "",
          modules: data.mentor.modules?.join(", ") || "",
        });
        setTimeSlots(data.mentor.timeSlots || []);
        // If profile is incomplete show edit mode automatically
        if (!data.mentor.isProfileComplete) {
          setEditMode(true);
        }
      } else {
        // No profile yet — show edit mode
        setEditMode(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (value: string) => {
    await fetch("/api/mentors/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: (session?.user as any)?.id,
        availability: value,
      }),
    });
    setMentor((prev: any) => ({ ...prev, availability: value }));
  };

  const addTimeSlot = () => {
    if (newSlot.startTime >= newSlot.endTime) {
      toast.error("End time must be after start time");
      return;
    }
    const exists = timeSlots.find(
      (s) => s.day === newSlot.day && s.startTime === newSlot.startTime
    );
    if (exists) {
      toast.error("This slot already exists");
      return;
    }
    setTimeSlots([...timeSlots, { ...newSlot }]);
  };

  const removeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeSlots.length === 0) {
      toast.error("Please add at least one time slot");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: (session?.user as any)?.id,
          bio: form.bio,
          modules: form.modules
            .split(",")
            .map((m) => m.trim().toUpperCase())
            .filter(Boolean),
          timeSlots,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setEditMode(false);
        fetchProfile();
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-500 text-center">Loading profile...</div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">👤 My Profile</h1>
          <p className="text-gray-500 mt-1">
            {mentor?.isProfileComplete
              ? "Your mentor profile"
              : "Set up your profile so students can find you"}
          </p>
        </div>
        {mentor?.isProfileComplete && !editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Availability Toggle — always show if profile exists */}
      {mentor?.isProfileComplete && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">
            Current Availability
          </h2>
          <div className="flex gap-3">
            {AVAILABILITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAvailabilityChange(opt.value)}
                className={`flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all ${
                  mentor?.availability === opt.value
                    ? opt.color
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-3">
            Update this when you start or finish a session
          </p>
        </div>
      )}

      {/* Profile View Mode */}
      {mentor?.isProfileComplete && !editMode && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">
            Profile Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Bio</p>
              <p className="text-gray-300 text-sm">{mentor.bio}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Modules</p>
              <div className="flex flex-wrap gap-2">
                {mentor.modules?.map((mod: string) => (
                  <span
                    key={mod}
                    className="text-xs bg-purple-900/50 text-purple-400 px-3 py-1 rounded-lg"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                Available Time Slots
              </p>
              <div className="space-y-2">
                {DAYS.filter((d) =>
                  mentor.timeSlots?.some((s: TimeSlot) => s.day === d)
                ).map((day) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-24 font-medium">
                      {day}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {mentor.timeSlots
                        ?.filter((s: TimeSlot) => s.day === day)
                        .map((slot: TimeSlot, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-lg"
                          >
                            {slot.startTime} – {slot.endTime}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode Form */}
      {editMode && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              {mentor?.isProfileComplete ? "Edit Profile" : "Setup Profile"}
            </h2>
            {mentor?.isProfileComplete && (
              <button
                onClick={() => {
                  setEditMode(false);
                  setForm({
                    bio: mentor.bio || "",
                    modules: mentor.modules?.join(", ") || "",
                  });
                  setTimeSlots(mentor.timeSlots || []);
                }}
                className="text-gray-500 hover:text-white text-sm"
              >
                Cancel
              </button>
            )}
          </div>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Bio
              </label>
              <textarea
                placeholder="Tell students about yourself..."
                required
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Modules You Can Teach
              </label>
              <input
                type="text"
                placeholder="e.g. CS101, IT2030 (comma separated)"
                required
                value={form.modules}
                onChange={(e) => setForm({ ...form, modules: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Available Time Slots
              </label>
              <div className="bg-gray-800 rounded-xl p-4 mb-3">
                <p className="text-xs text-gray-500 mb-3">Add a time slot</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <select
                    value={newSlot.day}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, day: e.target.value })
                    }
                    className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm focus:outline-none"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, startTime: e.target.value })
                    }
                    className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm focus:outline-none"
                  />
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, endTime: e.target.value })
                    }
                    className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-bold"
                >
                  + Add Slot
                </button>
              </div>

              {timeSlots.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-2">
                  No time slots added yet
                </p>
              ) : (
                <div className="space-y-2">
                  {DAYS.filter((d) =>
                    timeSlots.some((s) => s.day === d)
                  ).map((day) => (
                    <div key={day}>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                        {day}
                      </p>
                      {timeSlots
                        .filter((s) => s.day === day)
                        .map((slot, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2 mb-1"
                          >
                            <span className="text-white text-sm">
                              {slot.startTime} – {slot.endTime}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                removeSlot(
                                  timeSlots.findIndex(
                                    (s) =>
                                      s.day === slot.day &&
                                      s.startTime === slot.startTime
                                  )
                                )
                              }
                              className="text-red-400 hover:text-red-300 text-sm ml-4"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-all"
            >
              {saving ? "Saving..." : saved ? "✅ Saved!"  : "Save Profile"}
              
            </button>
          </form>
        </div>
      )}
    </div>
  );
}