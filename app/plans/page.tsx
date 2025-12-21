"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db, WorkoutPlan, Exercise } from "@/lib/db";

export default function PlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});

  const reload = async () => {
    const p = await db.workoutPlans.orderBy("updated_at").reverse().toArray();
    setPlans(p);
    const ex = await db.exercises.toArray();
    setExercises(Object.fromEntries(ex.map((e) => [e.id, e])));
  };

  useEffect(() => {
    reload();
  }, []);

  const deletePlan = async (id: string) => {
    await db.workoutPlans.delete(id);
    reload();
  };

  return (
    <main>
      <div className="mb-4">
        <Link href="/" className="inline-block px-4 py-2 rounded-lg border border-emerald-500/50 bg-emerald-800 text-white transition duration-200 shadow-md shadow-emerald-900/40">← Back</Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Workout Plans</h1>
        <Link href="/plans/new" className="px-3 py-2 rounded border border-sky-500/50 bg-sky-700 text-white transition shadow-md shadow-sky-900/40">Create Plan</Link>
      </div>
      <ul className="space-y-3">
        {plans.map((p) => (
          <li key={p.id} className="border border-gray-700 rounded p-3 bg-gray-800">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-semibold">{p.name}</div>
                {p.notes && <div className="text-sm text-gray-400 mt-1">{p.notes}</div>}
                <div className="mt-2 text-sm">
                  <span className="text-gray-400">Exercises: </span>
                  {p.exercise_ids.map((eid) => exercises[eid]?.name || "?").join(", ")}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/workouts/new?planId=${p.id}`} className="px-2 py-1 rounded border border-emerald-500/50 bg-emerald-700 text-white text-sm transition shadow-sm shadow-emerald-900/30">Start</Link>
                <button className="px-2 py-1 rounded border border-rose-500/60 bg-rose-700 text-white text-sm transition shadow-sm shadow-rose-900/30" onClick={() => deletePlan(p.id)}>Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
