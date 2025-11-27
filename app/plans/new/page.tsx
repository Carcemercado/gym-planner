"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db, WorkoutPlan, Exercise } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import ExercisePicker from "@/components/ExercisePicker";

export default function NewPlanPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});

  useEffect(() => {
    db.exercises.toArray().then((ex) => {
      setExercises(Object.fromEntries(ex.map((e) => [e.id, e])));
    });
  }, []);

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
        <Link href="/plans">← Back</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Create Workout Plan</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Plan Name</label>
          <input className="border rounded px-3 py-2 w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Push Day, Leg Day" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea className="border rounded px-3 py-2 w-full" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Search & Add Exercises</label>
          <ExercisePicker selectedIds={selectedExercises} onToggle={toggleExercise} />
        </div>
        {selectedExercises.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Selected Exercises ({selectedExercises.length})</label>
            <ul className="space-y-2">
              {selectedExercises.map((id) => (
                <li key={id} className="flex items-center justify-between border rounded px-3 py-2 bg-white">
                  <span className="font-medium">{exercises[id]?.name || "Unknown"}</span>
                  <button className="px-2 py-1 rounded bg-red-100 text-red-700 text-sm" onClick={() => removeExercise(id)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-sky-600 text-white" onClick={savePlan}>Save Plan</button>
          <Link href="/plans" className="px-4 py-2 rounded bg-gray-200">Cancel</Link>
        </div>
      </div>
    </main>
  );
}
