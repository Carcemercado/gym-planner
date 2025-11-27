"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db, Exercise } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { getBodyPartList, getExercisesByBodyPart, mapToLocalExercise } from "@/lib/exerciseApi";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [filterMuscle, setFilterMuscle] = useState<string>("all");
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [apiExercises, setApiExercises] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loadingBodyParts, setLoadingBodyParts] = useState(false);

  const reload = async () => {
    const ex = await db.exercises.orderBy("updated_at").reverse().toArray();
    setExercises(ex);
  };

  useEffect(() => {
    setMounted(true);
    reload();
  }, []);

  const loadBodyParts = async () => {
    if (bodyParts.length > 0) return; // Already loaded
    setLoadingBodyParts(true);
    try {
      const parts = await getBodyPartList();
      setBodyParts(parts);
    } catch (error) {
      console.error("Failed to load body parts:", error);
      alert("Failed to load body parts. Check your API key in .env.local");
    } finally {
      setLoadingBodyParts(false);
    }
  };

  const addExercise = async () => {
    if (!name.trim()) return;
    const now = Date.now();
    const exercise: Exercise = {
      id: uuidv4(),
      name: name.trim(),
      muscle_group: muscle.trim() || undefined,
      is_custom: true,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    await db.exercises.put(exercise);
    setName("");
    setMuscle("");
    reload();
  };

  const loadExercisesForBodyPart = async (bodyPart: string) => {
    setSelectedBodyPart(bodyPart);
    setImporting(true);
    try {
      const exercises = await getExercisesByBodyPart(bodyPart);
      setApiExercises(exercises);
    } catch (error) {
      console.error("Failed to load exercises:", error);
      alert("Failed to load exercises. Check your API key in .env.local");
      setSelectedBodyPart(null);
    } finally {
      setImporting(false);
    }
  };

  const importExercise = async (apiEx: any) => {
    try {
      const mapped = mapToLocalExercise(apiEx);
      const now = Date.now();
      const exercise: Exercise = {
        id: uuidv4(),
        name: mapped.name,
        muscle_group: mapped.muscle_group,
        notes: mapped.notes,
        is_custom: false,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      
      // Check if exercise already exists by name
      const existing = await db.exercises.where("name").equals(exercise.name).first();
      if (!existing) {
        await db.exercises.put(exercise);
        await reload();
        alert(`Added "${exercise.name}" to library`);
      } else {
        alert(`"${exercise.name}" already exists in library`);
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import exercise");
    }
  };

  const filteredExercises = filterMuscle === "all" 
    ? exercises 
    : exercises.filter(e => e.muscle_group?.toLowerCase() === filterMuscle.toLowerCase());

  return (
    <main>
      <div className="mb-4">
        <Link href="/">← Back</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Exercise Library</h1>

      {/* Import from API */}
      {mounted && (
        <div className="mb-6 flex gap-2">
          <button 
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            onClick={loadBodyParts}
            disabled={loadingBodyParts || bodyParts.length > 0}
          >
            {loadingBodyParts ? "Loading..." : bodyParts.length > 0 ? "✓ Body Parts Loaded" : "Import from ExerciseDB"}
          </button>
          <button 
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
            onClick={async () => {
              if (confirm("Reset database? This will delete ALL data including workouts, exercises, and plans!")) {
                await db.delete();
                window.location.reload();
              }
            }}
          >
            Reset DB
          </button>
        </div>
      )}

      {/* Body Parts Grid */}
      {mounted && bodyParts.length > 0 && !selectedBodyPart && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Select Body Part</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {bodyParts.map((part) => (
              <button
                key={part}
                className="p-4 rounded-lg border-2 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition capitalize text-center"
                onClick={() => loadExercisesForBodyPart(part)}
              >
                <div className="font-medium">{part}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Exercise Selection from API */}
      {mounted && selectedBodyPart && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold capitalize">{selectedBodyPart} Exercises</h2>
            <button
              className="text-sm text-gray-600 hover:text-gray-800"
              onClick={() => {
                setSelectedBodyPart(null);
                setApiExercises([]);
              }}
            >
              ← Back to Body Parts
            </button>
          </div>
          {importing ? (
            <div className="text-center py-8 text-gray-600">Loading exercises...</div>
          ) : (
            <div className="grid gap-2 max-h-[500px] overflow-y-auto">
              {apiExercises.map((ex) => (
                <div key={ex.id} className="border rounded-lg p-3 bg-white hover:bg-gray-50">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="font-medium">{ex.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Target: {ex.target} | Equipment: {ex.equipment}
                      </div>
                    </div>
                    <button
                      className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-sm whitespace-nowrap"
                      onClick={() => importExercise(ex)}
                    >
                      Add to Library
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Filter by Muscle Group */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Filter by Muscle Group</label>
        <select 
          className="border rounded px-3 py-2 w-full"
          value={filterMuscle}
          onChange={(e) => setFilterMuscle(e.target.value)}
        >
          <option value="all">All Exercises ({exercises.length})</option>
          {Array.from(new Set(exercises.map(e => e.muscle_group).filter(Boolean))).sort().map((mg) => (
            <option key={mg} value={mg}>
              {mg} ({exercises.filter(e => e.muscle_group === mg).length})
            </option>
          ))}
        </select>
      </div>

      {/* Add Custom Exercise */}
      <div className="space-y-2 mb-6 border-t pt-4">
        <h2 className="text-lg font-semibold">Add Custom Exercise</h2>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm">Name</label>
            <input className="border rounded px-2 py-1 w-full" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="block text-sm">Muscle Group</label>
            <input className="border rounded px-2 py-1 w-full" value={muscle} onChange={(e) => setMuscle(e.target.value)} />
          </div>
          <button className="bg-sky-600 text-white px-3 py-2 rounded hover:bg-sky-700" onClick={addExercise}>Add</button>
        </div>
      </div>

      {/* Exercise List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          {filterMuscle === "all" ? "All Exercises" : `${filterMuscle} Exercises`} ({filteredExercises.length})
        </h2>
        <ul className="space-y-2">
          {filteredExercises.map((e) => (
            <li key={e.id} className="border rounded px-3 py-2 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{e.name}</div>
                  {e.muscle_group && <div className="text-xs text-gray-500">{e.muscle_group}</div>}
                  {e.notes && <div className="text-xs text-gray-400 mt-1 line-clamp-2">{e.notes}</div>}
                </div>
                {!e.is_custom && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">API</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
