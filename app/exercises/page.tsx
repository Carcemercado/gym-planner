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
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const [autoImportStarted, setAutoImportStarted] = useState(false);

  const reload = async () => {
    const ex = await db.exercises.orderBy("updated_at").reverse().toArray();
    setExercises(ex);
    return ex;
  };

  const importAllExercises = async () => {
    setIsImporting(true);
    setImportProgress("Loading body parts...");
    try {
      const bodyParts = await getBodyPartList();
      let imported = 0;
      let total = 0;

      for (const bodyPart of bodyParts) {
        try {
          setImportProgress(`Loading exercises for ${bodyPart}...`);
          const bodyPartExercises = await getExercisesByBodyPart(bodyPart);
          
          for (const apiEx of bodyPartExercises) {
            total++;
            try {
              const mapped = mapToLocalExercise(apiEx);
              
              // Check if exercise already exists by name
              const existing = await db.exercises.where("name").equals(mapped.name).first();
              if (!existing) {
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
                await db.exercises.put(exercise);
                imported++;
              }
            } catch (error) {
              console.error(`Failed to import exercise:`, error);
            }
          }
        } catch (error) {
          console.error(`Failed to load exercises for ${bodyPart}:`, error);
        }
      }

      setImportProgress(`Completed! Imported ${imported} exercises.`);
      await reload();
      setTimeout(() => setImportProgress(""), 3000);
    } catch (error) {
      console.error("Failed to import exercises:", error);
      setImportProgress("Failed to import. Check your API key in .env.local");
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    const loadAndMaybeImport = async () => {
      const ex = await reload();
      if (ex.length === 0 && !autoImportStarted) {
        setAutoImportStarted(true);
        await importAllExercises();
      }
    };
    loadAndMaybeImport();
  }, [autoImportStarted]);

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

  const filteredExercises = filterMuscle === "all" 
    ? exercises 
    : exercises.filter(e => e.muscle_group?.toLowerCase() === filterMuscle.toLowerCase());

  return (
    <main>
      <div className="mb-4">
        <Link href="/" className="inline-block px-4 py-2 rounded-lg border border-amber-500/50 bg-amber-800 text-white shadow-md shadow-amber-900/40 transition duration-200">← Back</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Exercise Library</h1>

      {/* Import Exercises from API */}
      {exercises.length === 0 && (
        <div className="mb-6 p-4 border-2 border-emerald-600 rounded-lg bg-emerald-900/20">
          <h2 className="font-semibold mb-2">Get Started</h2>
          <p className="text-sm text-gray-300 mb-4">Import all exercises from ExerciseDB to populate your exercise library. This will only run once.</p>
          <button 
            className="px-4 py-2 rounded border border-emerald-500/50 bg-emerald-700 text-white disabled:opacity-50 transition shadow-md shadow-emerald-900/40"
            onClick={importAllExercises}
            disabled={isImporting}
          >
            {isImporting ? "Importing..." : "Import All Exercises"}
          </button>
          {importProgress && <div className="mt-3 text-sm text-gray-300">{importProgress}</div>}
        </div>
      )}

      {exercises.length > 0 && (
        <div className="mb-4 flex gap-2">
          <button 
            className="px-4 py-2 rounded border border-rose-500/60 bg-rose-700 text-white text-sm transition shadow-md shadow-rose-900/40"
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

      {/* Filter by Muscle Group */}
      {exercises.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Filter by Muscle Group</label>
          <select 
            className="border rounded px-3 py-2 w-full bg-gray-800 border-gray-700 text-white"
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
      )}

      {/* Add Custom Exercise */}
      {exercises.length > 0 && (
        <div className="space-y-2 mb-6 border-t border-gray-700 pt-4">
          <h2 className="text-lg font-semibold">Add Custom Exercise</h2>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm">Name</label>
              <input 
                className="border rounded px-2 py-1 w-full bg-gray-800 border-gray-700 text-white" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm">Muscle Group</label>
              <input 
                className="border rounded px-2 py-1 w-full bg-gray-800 border-gray-700 text-white" 
                value={muscle} 
                onChange={(e) => setMuscle(e.target.value)} 
              />
            </div>
            <button className="px-3 py-2 rounded border border-sky-500/50 bg-sky-700 text-white transition shadow-md shadow-sky-900/40" onClick={addExercise}>Add</button>
          </div>
        </div>
      )}

      {/* Exercise List */}
      {exercises.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            {filterMuscle === "all" ? "All Exercises" : `${filterMuscle} Exercises`} ({filteredExercises.length})
          </h2>
          <ul className="space-y-2">
            {filteredExercises.map((e) => (
              <li key={e.id} className="border border-gray-700 rounded px-3 py-2 bg-gray-800">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{e.name}</div>
                    {e.muscle_group && <div className="text-xs text-gray-400">{e.muscle_group}</div>}
                    {e.notes && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{e.notes}</div>}
                  </div>
                  {!e.is_custom && <span className="text-xs px-2 py-1 rounded border border-emerald-500/60 bg-emerald-900 text-emerald-100">API</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
