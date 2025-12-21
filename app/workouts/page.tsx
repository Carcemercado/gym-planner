"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db, Workout, SetEntry, Exercise } from "@/lib/db";

const DISPLAY_LIMIT = 10;

export default function WorkoutsPage() {
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const toLocalIsoDate = (date: Date) => date.toLocaleDateString("en-CA");

  useEffect(() => {
    const load = async () => {
      // Load all workouts
      const ws = await db.workouts.orderBy("date_utc").reverse().toArray();
      setAllWorkouts(ws);
      
      // Load all sets
      const ss = await db.sets.toArray();
      setSets(ss);
      
      // Load exercises
      const ex = await db.exercises.toArray();
      setExercises(Object.fromEntries(ex.map((e) => [e.id, e])));
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      // Filter workouts by selected date
      const filtered = allWorkouts.filter((w) => {
        const workoutDate = toLocalIsoDate(new Date(w.date_utc));
        return workoutDate === selectedDate;
      });
      setFilteredWorkouts(filtered);
    } else {
      // Show most recent 10 workouts
      setFilteredWorkouts(allWorkouts.slice(0, DISPLAY_LIMIT));
    }
  }, [selectedDate, allWorkouts]);

  const setsByWorkout = (workoutId: string) => sets.filter((s) => s.workout_id === workoutId);

  // Dates with workouts and bounds
  const datesWithWorkouts = new Set(
    allWorkouts.map((w) => toLocalIsoDate(new Date(w.date_utc)))
  );
  const today = toLocalIsoDate(new Date());
  const minDate = allWorkouts.length > 0
    ? toLocalIsoDate(new Date(allWorkouts[allWorkouts.length - 1].date_utc))
    : today;
  const sortedWorkoutDates = Array.from(datesWithWorkouts).sort().reverse();

  return (
    <main>
      <div className="mb-4">
        <Link href="/" className="inline-block px-4 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white shadow-md shadow-black/30 transition">← Back</Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Workout History</h1>
        <Link href="/workouts/new" className="px-4 py-2 rounded-lg border border-sky-500/50 bg-sky-700 text-white shadow-md shadow-sky-900/40 transition duration-200">Start Workout</Link>
      </div>

      {/* Date Filter (native date picker) */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filter by Date</label>
        <input
          type="date"
          value={selectedDate || ""}
          onChange={(e) => setSelectedDate(e.target.value || null)}
          min={minDate}
          max={today}
          className="px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-sky-500 transition"
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="ml-2 px-3 py-2 rounded border border-gray-600 bg-gray-900 text-white transition text-sm"
          >
            Clear Filter
          </button>
        )}

        {/* Quick access to dates with workouts */}
        {sortedWorkoutDates.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-gray-400 mb-2">Days with workouts:</div>
            <div className="flex flex-wrap gap-2">
              {sortedWorkoutDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-2 py-1 text-xs rounded border transition ${
                    selectedDate === date
                      ? "border-sky-400 bg-sky-700 text-white"
                      : "border-emerald-500/50 bg-emerald-800 text-emerald-100"
                  }`}
                >
                  {new Date(date + "T00:00").toLocaleDateString()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filteredWorkouts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {selectedDate ? "No workouts on this date" : "No workouts yet. Start tracking!"}
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-400 mb-3">
            Showing {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? "s" : ""}{selectedDate ? ` on ${new Date(selectedDate + "T00:00").toLocaleDateString()}` : " (most recent)"}
          </div>
          <ul className="space-y-3">
            {filteredWorkouts.map((w) => (
              <li key={w.id} className="border border-gray-700 rounded p-3 bg-gray-800">
                <div className="text-sm text-gray-400">{new Date(w.date_utc).toLocaleString()}</div>
                <div className="mt-2 space-y-1">
                  {setsByWorkout(w.id).map((s) => (
                    <div key={s.id} className="text-sm">
                      <span className="font-medium">{exercises[s.exercise_id]?.name || "Exercise"}</span> — {s.reps} reps {s.weight != null ? `@ ${s.weight} ${s.unit}` : ""}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
