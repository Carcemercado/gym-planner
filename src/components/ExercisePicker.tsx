"use client";

import { useEffect, useState } from "react";
import { db, Exercise } from "@/lib/db";

type Props = {
  selectedIds: string[];
  onToggle: (id: string) => void;
  muscleFilter?: string;
  onMuscleFilterChange?: (muscle: string) => void;
  showMuscleFilter?: boolean;
};

export default function ExercisePicker({ selectedIds, onToggle, muscleFilter, onMuscleFilterChange, showMuscleFilter = true }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");
  const [internalMuscleFilter, setInternalMuscleFilter] = useState<string>("all");
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);

  useEffect(() => {
    db.exercises.orderBy("updated_at").reverse().toArray().then((ex) => {
      setExercises(ex);
      // Extract unique muscle groups (these are bodyPart values from the API)
      const groups = Array.from(new Set(ex.map(e => e.muscle_group).filter(Boolean) as string[])).sort();
      setMuscleGroups(groups);
    });
  }, []);

  const activeMuscleFilter = (muscleFilter ?? internalMuscleFilter).toLowerCase();

  const list = exercises.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(query.toLowerCase());
    const exerciseGroup = (e.muscle_group || "").toLowerCase();
    const matchesMuscle = activeMuscleFilter === "all" || exerciseGroup === activeMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  const handleMuscleChange = (value: string) => {
    const normalized = value.toLowerCase();
    if (onMuscleFilterChange) {
      onMuscleFilterChange(normalized);
    } else {
      setInternalMuscleFilter(normalized);
    }
  };

  return (
    <div className="space-y-2">
      <input 
        className="border border-gray-700 bg-gray-900 text-white rounded px-2 py-1 w-full focus:outline-none focus:border-sky-500" 
        placeholder="Search exercises" 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
      />
      
      {showMuscleFilter && muscleGroups.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Filter by Muscle Group</label>
          <select
            className="border border-gray-700 bg-gray-900 text-white rounded px-2 py-1 w-full text-sm focus:outline-none focus:border-sky-500"
            value={activeMuscleFilter}
            onChange={(e) => handleMuscleChange(e.target.value)}
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

      <ul className="space-y-1 max-h-[400px] overflow-y-auto no-scrollbar">
        {list.map((e) => {
          const checked = selectedIds.includes(e.id);
          return (
            <li key={e.id} className="flex items-center justify-between border border-gray-700 rounded px-3 py-2 bg-gray-900">
              <div>
                <div className="font-medium">{e.name}</div>
                {e.muscle_group && <div className="text-xs text-gray-400">{e.muscle_group}</div>}
              </div>
              <button
                className={checked
                  ? "px-3 py-1 rounded border border-emerald-500/50 bg-emerald-700 text-white transition shadow-sm shadow-emerald-900/30"
                  : "px-3 py-1 rounded border border-gray-600 bg-gray-900 text-white transition"}
                onClick={() => onToggle(e.id)}
              >
                {checked ? "Selected" : "Select"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
