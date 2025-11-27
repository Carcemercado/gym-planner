"use client";

import { useState } from "react";

export type Unit = "kg" | "lb";

export default function SetEditor({ onAdd }: { onAdd: (reps: number, weight: number | undefined, unit: Unit) => void }) {
  const [reps, setReps] = useState<number>(8);
  const [weight, setWeight] = useState<number>(60);
  const [unit, setUnit] = useState<Unit>("kg");

  return (
    <div className="flex gap-2 items-end">
      <div>
        <label className="block text-sm">Reps</label>
        <input type="number" className="border rounded px-2 py-1 w-24" value={reps} onChange={(e) => setReps(Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm">Weight</label>
        <input type="number" className="border rounded px-2 py-1 w-28" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm">Unit</label>
        <select className="border rounded px-2 py-1" value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
      </div>
      <button className="bg-sky-600 text-white px-3 py-2 rounded" onClick={() => onAdd(reps, weight, unit)}>Add Set</button>
    </div>
  );
}
