"use client";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface Mentor {
  _id: string;
  userId: { _id: string; name: string; email: string };
  bio: string;
  modules: string[];
  timeSlots: TimeSlot[];
  availability: string;
}

interface Appointment {
  date: string;
  time: string;
  status: string;
}

const DAYS = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
];

function generateBookingTimes(startTime: string, endTime: string) {
  const times: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  const lastStart = endTotal - 45;

  for (let t = startTotal; t <= lastStart; t += 15) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    const sessionEnd = t + 45;
    const endHour = Math.floor(sessionEnd / 60);
    const endMin = sessionEnd % 60;
    times.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} – ${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`
    );
  }
  return times;
}

export default function MentorsPage() {
  const { data: session } = useSession();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptModule, setApptModule] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<Appointment[]>([]);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const res = await fetch("/api/mentors");
      const data = await res.json();
      setMentors(data.mentors || []);
    } catch {
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedSlots = async (mentorId: string) => {
    try {
      const res = await fetch(`/api/appointments?mentorId=${mentorId}`);
      const data = await res.json();
      setBookedSlots(
        data.appointments?.filter((a: Appointment) =>
          ["booked", "in-progress"].includes(a.status)
        ) || []
      );
    } catch {
      setBookedSlots([]);
    }
  };

  const isSlotBooked = (date: string, time: string) => {
    return bookedSlots.some((a) => a.date === date && a.time === time);
  };

  const availabilityBadge = (status: string) => {
    if (status === "available") return "bg-green-900/50 text-green-400";
    if (status === "in-session") return "bg-yellow-900/50 text-yellow-400";
    return "bg-red-900/50 text-red-400";
  };

  const availabilityLabel = (status: string) => {
    if (status === "available") return "✅ Available";
    if (status === "in-session") return "🟡 In Session";
    return "🔴 Busy";
  };

  const getNextDateForDay = (dayName: string) => {
    const today = new Date();
    const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const targetIndex = DAYS.indexOf(dayName);
    let diff = targetIndex - todayIndex;
    if (diff <= 0) diff += 7;
    const next = new Date(today);
    next.setDate(today.getDate() + diff);
    return next.toISOString().slice(0, 10);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !selectedSlot || !apptDate || !apptModule || !selectedTime) return;
    setSubmitting(true);
    try {
      const startTime = selectedTime.split(" – ")[0];
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: selectedMentor._id,
          studentId: (session?.user as any)?.id,
          moduleCode: apptModule,
          date: apptDate,
          time: startTime,
        }),
      });

      if (res.status === 409) {
       toast.error("This slot was just booked! Please choose another.");
        fetchBookedSlots(selectedMentor._id);
        setSelectedTime("");
        setSubmitting(false);
        return;
      }

      if (res.ok) {
        setSelectedMentor(null);
        setSelectedSlot(null);
        setSelectedTime("");
        setApptDate("");
        setApptModule("");
        toast.success("Appointment booked successfully! 🎉");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">👨‍🏫 Mentors</h1>
        <p className="text-gray-500 mt-1">Find an alumni mentor and book a session</p>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading mentors...</div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No mentors available yet</p>
          <p className="text-gray-600 text-sm mt-2">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <div
              key={mentor._id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {mentor.userId?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold">{mentor.userId?.name}</p>
                    <p className="text-gray-500 text-xs">Alumni Mentor</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${availabilityBadge(mentor.availability)}`}>
                  {availabilityLabel(mentor.availability)}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-3">{mentor.bio}</p>

              <div className="mb-3">
                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Modules</p>
                <div className="flex flex-wrap gap-1">
                  {mentor.modules?.map((mod) => (
                    <span key={mod} className="text-xs bg-purple-900/50 text-purple-400 px-2 py-1 rounded-lg">
                      {mod}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Available Slots</p>
                <div className="space-y-1">
                  {DAYS.filter((d) => mentor.timeSlots?.some((s) => s.day === d)).map((day) => (
                    <div key={day} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8">{day.slice(0, 3)}</span>
                      <div className="flex flex-wrap gap-1">
                        {mentor.timeSlots?.filter((s) => s.day === day).map((slot, i) => (
                          <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-lg">
                            {slot.startTime}–{slot.endTime}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedMentor(mentor);
                  setSelectedSlot(null);
                  setSelectedTime("");
                  setApptDate("");
                  setApptModule("");
                  fetchBookedSlots(mentor._id);
                }}
                disabled={mentor.availability !== "available"}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-xl text-sm font-bold transition-all"
              >
                {mentor.availability === "available" ? "Book Appointment" : "Currently Unavailable"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Book Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Book with {selectedMentor.userId?.name}
              </h2>
              <button
                onClick={() => setSelectedMentor(null)}
                className="text-gray-500 hover:text-white text-2xl"
              >
                x
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-5">
              {/* Module */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Select Module
                </label>
                <select
                  required
                  value={apptModule}
                  onChange={(e) => setApptModule(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Choose a module...</option>
                  {selectedMentor.modules?.map((mod) => (
                    <option key={mod} value={mod}>{mod}</option>
                  ))}
                </select>
              </div>

              {/* Day Slot */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Select Day
                </label>
                <div className="space-y-2">
                  {DAYS.filter((d) =>
                    selectedMentor.timeSlots?.some((s) => s.day === d)
                  ).map((day) => (
                    <div key={day}>
                      <p className="text-xs text-gray-500 font-bold mb-1">{day}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMentor.timeSlots
                          ?.filter((s) => s.day === day)
                          .map((slot, i) => (
                            <button
                              type="button"
                              key={i}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setSelectedTime("");
                                setApptDate(getNextDateForDay(slot.day));
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedSlot?.day === slot.day &&
                                selectedSlot?.startTime === slot.startTime
                                  ? "bg-purple-600 text-white"
                                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                              }`}
                            >
                              {slot.startTime} – {slot.endTime}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date picker - shown when slot selected */}
              {selectedSlot && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Date ({selectedSlot.day})
                  </label>
                  <input
                    type="date"
                    required
                    value={apptDate}
                    onChange={(e) => {
                      setApptDate(e.target.value);
                      setSelectedTime("");
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Auto-set to next {selectedSlot.day} — adjust if needed
                  </p>
                </div>
              )}

              {/* 45-min booking times */}
              {selectedSlot && apptDate && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Select Session Time (45 min)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {generateBookingTimes(
                      selectedSlot.startTime,
                      selectedSlot.endTime
                    ).length === 0 ? (
                      <p className="text-red-400 text-sm">
                        Slot is less than 45 minutes — contact the mentor.
                      </p>
                    ) : (
                      generateBookingTimes(
                        selectedSlot.startTime,
                        selectedSlot.endTime
                      ).map((time) => {
                        const startTime = time.split(" – ")[0];
                        const booked = isSlotBooked(apptDate, startTime);
                        return (
                          <button
                            type="button"
                            key={time}
                            disabled={booked}
                            onClick={() => !booked && setSelectedTime(time)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              booked
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed line-through"
                                : selectedTime === time
                                ? "bg-purple-600 text-white"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            }`}
                          >
                            {time} {booked ? "(Booked)" : ""}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    Each session is 45 minutes. Greyed slots are already booked.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedSlot || !apptModule || !selectedTime}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm"
              >
                {submitting ? "Booking..." : "Confirm Booking (45 min)"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}