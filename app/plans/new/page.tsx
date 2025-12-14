"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db, WorkoutPlan, Exercise } from "@/lib/db";
import { getBodyPartList, getExercisesByBodyPart, mapToLocalExercise } from "@/lib/exerciseApi";
import { v4 as uuidv4 } from "uuid";
import ExercisePicker from "@/components/ExercisePicker";

export default function NewPlanPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});

  // Body part & API exercise integration (mirrors Exercise Library capability)
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [loadingBodyParts, setLoadingBodyParts] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [apiExercises, setApiExercises] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

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

  const loadExercisesForBodyPart = async (part: string) => {
    setSelectedBodyPart(part);
    setImporting(true);
    try {
      const list = await getExercisesByBodyPart(part);
      setApiExercises(list);
    } catch (err) {
      console.warn("Failed to load exercises for", part, err);
      setSelectedBodyPart(null);
      setApiExercises([]);
    } finally {
      setImporting(false);
    }
  };

  const addApiExerciseToPlan = async (apiEx: any) => {
    try {
      const mapped = mapToLocalExercise(apiEx);
      const now = Date.now();
      // Check if already exists locally by name
      const existing = await db.exercises.where("name").equals(mapped.name).first();
      let exerciseId: string;
      if (existing) {
        exerciseId = existing.id;
      } else {
        const newEx: Exercise = {
          id: uuidv4(),
          name: mapped.name,
          muscle_group: mapped.muscle_group,
          notes: mapped.notes,
          is_custom: false,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        };
        await db.exercises.put(newEx);
        exerciseId = newEx.id;
        // refresh local exercises cache
        const ex = await db.exercises.toArray();
        setExercises(Object.fromEntries(ex.map((e) => [e.id, e])));
      }
      setSelectedExercises((prev) => (prev.includes(exerciseId) ? prev : [...prev, exerciseId]));
    } catch (err) {
      console.error("Failed to add API exercise", err);
      alert("Failed to add exercise");
    }
  };

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
        <Link href="/plans" className="text-sky-400 hover:text-sky-300">← Back</Link>
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

        {/* Body Part Grid (from Exercise Library) */}
        {loadingBodyParts && (
          <div className="text-sm text-gray-400">Loading body parts…</div>
        )}
        {!loadingBodyParts && bodyParts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Browse by Body Part</label>
              {selectedBodyPart && (
                <button
                  className="text-xs text-gray-400 hover:text-gray-200"
                  onClick={() => {
                    setSelectedBodyPart(null);
                    setApiExercises([]);
                  }}
                >
                  Clear Selection
                </button>
              )}
            </div>
            {!selectedBodyPart && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {bodyParts.map((part) => (
                  <button
                    key={part}
                    className="p-3 rounded-lg border-2 border-gray-700 bg-gray-800 hover:border-emerald-500 hover:bg-emerald-900/30 transition capitalize text-center text-sm"
                    onClick={() => loadExercisesForBodyPart(part)}
                  >
                    {part}
                  </button>
                ))}
              </div>
            )}
            {selectedBodyPart && (
              <div className="space-y-2">
                <div className="text-sm font-semibold capitalize">{selectedBodyPart} Exercises</div>
                {importing ? (
                  <div className="text-xs text-gray-400">Loading…</div>
                ) : (
                  <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                    {apiExercises.map((ex) => (
                      <div key={ex.id} className="border border-gray-700 rounded p-2 bg-gray-800 flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{ex.name}</div>
                          <div className="text-[10px] text-gray-400 mt-1">Target: {ex.target} • Equip: {ex.equipment}</div>
                        </div>
                        <button
                          className="px-2 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-700"
                          onClick={() => addApiExerciseToPlan(ex)}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                    {apiExercises.length === 0 && (
                      <div className="text-xs text-gray-500">No exercises found.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-2">Search & Add Exercises</label>
          <ExercisePicker selectedIds={selectedExercises} onToggle={toggleExercise} />
        </div>
        {selectedExercises.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Selected Exercises ({selectedExercises.length})</label>
            <ul className="space-y-2">
              {selectedExercises.map((id) => (
                <li key={id} className="flex items-center justify-between border border-gray-700 rounded px-3 py-2 bg-gray-800">
                  <span className="font-medium">{exercises[id]?.name || "Unknown"}</span>
                  <button className="px-2 py-1 rounded bg-red-100 text-red-700 text-sm" onClick={() => removeExercise(id)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 transition" onClick={savePlan}>Save Plan</button>
          <Link href="/plans" className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition">Cancel</Link>
        </div>
      </div>
    </main>
  );
}
