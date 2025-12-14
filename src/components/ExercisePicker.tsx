"use client";

import { useEffect, useState } from "react";
import { db, Exercise } from "@/lib/db";

export default function ExercisePicker({ selectedIds, onToggle }: { selectedIds: string[]; onToggle: (id: string) => void }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<string>("all");
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);

  useEffect(() => {
    db.exercises.orderBy("updated_at").reverse().toArray().then((ex) => {
      setExercises(ex);
      // Extract unique muscle groups (these are bodyPart values from the API)
      const groups = Array.from(new Set(ex.map(e => e.muscle_group).filter(Boolean) as string[])).sort();
      setMuscleGroups(groups);
    });
  }, []);

  const list = exercises.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(query.toLowerCase());
    const matchesMuscle = muscleFilter === "all" || e.muscle_group === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-2">
      <input 
        className="border rounded px-2 py-1 w-full" 
        placeholder="Search exercises" 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
      />
      
      {muscleGroups.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Filter by Muscle Group</label>
          <select
            className="border rounded px-2 py-1 w-full text-sm"
            value={muscleFilter}
            onChange={(e) => setMuscleFilter(e.target.value)}
          >
            <option value="all">All Muscle Groups</option>
            {muscleGroups.map((mg) => (
              <option key={mg} value={mg}>{mg}</option>
            ))}
          </select>
        </div>
      )}

      <div className="text-xs text-gray-400 px-1">
        {list.length} exercise{list.length !== 1 ? 's' : ''} found
      </div>

      <ul className="space-y-1 max-h-[400px] overflow-y-auto">
        {list.map((e) => {
          const checked = selectedIds.includes(e.id);
          return (
            <li key={e.id} className="flex items-center justify-between border border-gray-700 rounded px-3 py-2 bg-gray-800 hover:bg-gray-700">
              <div>
                <div className="font-medium">{e.name}</div>
                {e.muscle_group && <div className="text-xs text-gray-400">{e.muscle_group}</div>}
              </div>
              <button className={checked ? "px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition" : "px-3 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition"} onClick={() => onToggle(e.id)}>
                {checked ? "Selected" : "Select"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
