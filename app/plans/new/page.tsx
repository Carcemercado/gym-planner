"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db, WorkoutPlan, Exercise } from "@/lib/db";
import { getBodyPartList } from "@/lib/exerciseApi";
import { v4 as uuidv4 } from "uuid";
import ExercisePicker from "@/components/ExercisePicker";

export default function NewPlanPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const [muscleFilter, setMuscleFilter] = useState<string>("all");

  // Body part grid drives filtering for ExercisePicker
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [loadingBodyParts, setLoadingBodyParts] = useState(false);

  useEffect(() => {
    db.exercises.toArray().then((ex) => {
      setExercises(Object.fromEntries(ex.map((e) => [e.id, e])));
    });
  }, []);

  // Load body parts automatically so grid appears under notes as requested
  useEffect(() => {
    const loadParts = async () => {
      if (bodyParts.length > 0) return;
      setLoadingBodyParts(true);
      try {
        const parts = await getBodyPartList();
        setBodyParts(parts);
      } catch (err) {
        console.warn("Failed to load body parts", err);
      } finally {
        setLoadingBodyParts(false);
      }
    };
    loadParts();
  }, [bodyParts.length]);

  const toggleExercise = (id: string) => {
    setSelectedExercises((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else {
        // Prevent duplicates
        return prev.includes(id) ? prev : [...prev, id];
      }
    });
  };

  const removeExercise = (id: string) => {
    setSelectedExercises((prev) => prev.filter((x) => x !== id));
  };

  const savePlan = async () => {
    if (!name.trim() || selectedExercises.length === 0) {
      alert("Please provide a name and select at least one exercise.");
      return;
    }
    const now = Date.now();
    const plan: WorkoutPlan = {
      id: uuidv4(),
      name: name.trim(),
      exercise_ids: selectedExercises,
      notes: notes.trim() || undefined,
      created_at: now,
      updated_at: now,
    };
    await db.workoutPlans.put(plan);
    router.push("/plans");
  };

  return (
    <main>
      <div className="mb-4">
        <Link href="/plans" className="inline-block px-4 py-2 rounded-lg border border-emerald-500/50 bg-emerald-800 text-white transition duration-200 shadow-md shadow-emerald-900/40">← Back</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Create Workout Plan</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Plan Name</label>
          <input className="border border-gray-700 bg-gray-900 rounded px-3 py-2 w-full text-white focus:outline-none focus:border-sky-500" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Push Day, Leg Day" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea className="border border-gray-700 bg-gray-900 rounded px-3 py-2 w-full text-white focus:outline-none focus:border-sky-500" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes" />
        </div>

        {/* Body Part Grid to filter ExercisePicker */}
        {loadingBodyParts && (
          <div className="text-sm text-gray-400">Loading body parts…</div>
        )}
        {!loadingBodyParts && bodyParts.length > 0 && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Browse by Body Part</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <button
                className={`p-3 rounded-lg border-2 transition capitalize text-center text-sm text-white ${muscleFilter === "all" ? "border-emerald-500 bg-emerald-900/50" : "border-gray-700 bg-gray-900"}`}
                onClick={() => setMuscleFilter("all")}
              >
                All Groups
              </button>
              {bodyParts.map((part) => (
                <button
                  key={part}
                  className={`p-3 rounded-lg border-2 transition capitalize text-center text-sm text-white ${muscleFilter === part ? "border-emerald-500 bg-emerald-900/50" : "border-gray-700 bg-gray-900"}`}
                  onClick={() => setMuscleFilter(part)}
                >
                  {part}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-2">Search & Add Exercises</label>
          <ExercisePicker
            selectedIds={selectedExercises}
            onToggle={toggleExercise}
            muscleFilter={muscleFilter}
            onMuscleFilterChange={setMuscleFilter}
            showMuscleFilter={false}
          />
        </div>
        {selectedExercises.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Selected Exercises ({selectedExercises.length})</label>
            <ul className="space-y-2">
              {selectedExercises.map((id) => (
                <li key={id} className="flex items-center justify-between border border-gray-700 rounded px-3 py-2 bg-gray-900">
                  <span className="font-medium text-white">{exercises[id]?.name || "Unknown"}</span>
                  <button className="px-2 py-1 rounded border border-rose-500/60 bg-rose-700 text-white text-sm transition" onClick={() => removeExercise(id)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded border border-sky-500/50 bg-sky-700 text-white transition shadow-md shadow-sky-900/40" onClick={savePlan}>Save Plan</button>
          <Link href="/plans" className="px-4 py-2 rounded border border-gray-600 bg-gray-900 text-white transition">Cancel</Link>
        </div>
      </div>
    </main>
  );
}
