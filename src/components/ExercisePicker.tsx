"use client";

import { useEffect, useState } from "react";
import { db, Exercise } from "@/lib/db";

export default function ExercisePicker({ selectedIds, onToggle }: { selectedIds: string[]; onToggle: (id: string) => void }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    db.exercises.orderBy("updated_at").reverse().toArray().then(setExercises);
  }, []);

  const list = exercises.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-2">
      <input className="border rounded px-2 py-1 w-full" placeholder="Search exercises" value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul className="space-y-1">
        {list.map((e) => {
          const checked = selectedIds.includes(e.id);
          return (
            <li key={e.id} className="flex items-center justify-between border rounded px-3 py-2 bg-white">
              <div>
                <div className="font-medium">{e.name}</div>
                {e.muscle_group && <div className="text-xs text-gray-500">{e.muscle_group}</div>}
              </div>
              <button className={checked ? "px-3 py-1 bg-emerald-600 text-white rounded" : "px-3 py-1 bg-gray-200 rounded"} onClick={() => onToggle(e.id)}>
                {checked ? "Selected" : "Select"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
