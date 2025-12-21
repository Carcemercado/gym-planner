"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { db, WorkoutPlan, Exercise } from "@/lib/db";

function PlanDetails() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const p = await db.workoutPlans.get(id);
      const ex = await db.exercises.toArray();
      setExercises(Object.fromEntries(ex.map((e) => [e.id, e])));
      setPlan(p || null);
      setLoading(false);
    };
    load();
  }, [id]);

  if (!id) {
    return <div className="text-center py-8 text-gray-400">Plan not found.</div>;
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading...</div>;
  }

  if (!plan) {
    return <div className="text-center py-8 text-gray-400">Plan not found.</div>;
  }

  const muscleGroups = Array.from(
    new Set(
      plan.exercise_ids
        .map((eid) => exercises[eid]?.muscle_group)
        .filter(Boolean)
    )
  ).sort();

  return (
    <main className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/plans" className="inline-block px-3 py-1.5 rounded border border-emerald-500/50 bg-emerald-800 text-white shadow-sm shadow-emerald-900/30">← Back</Link>
        <h1 className="text-2xl font-bold">{plan.name}</h1>
      </div>
      {plan.notes && <div className="text-sm text-gray-300 border border-gray-700 rounded px-3 py-2 bg-gray-900">{plan.notes}</div>}

      {muscleGroups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {muscleGroups.map((mg) => (
            <span key={mg} className="px-2 py-0.5 rounded bg-gray-700 text-xs text-gray-200 capitalize">
              {mg}
            </span>
          ))}
        </div>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Exercises</h2>
        {plan.exercise_ids.length === 0 ? (
          <div className="text-sm text-gray-400">No exercises in this plan.</div>
        ) : (
          <ul className="space-y-2">
            {plan.exercise_ids.map((eid) => {
              const ex = exercises[eid];
              return (
                <li key={eid} className="border border-gray-700 rounded px-3 py-2 bg-gray-900">
                  <div className="font-medium text-white">{ex?.name || "Unknown exercise"}</div>
                  {ex?.muscle_group && (
                    <div className="text-xs text-gray-400 capitalize">{ex.muscle_group}</div>
                  )}
                  {ex?.notes && (
                    <div className="text-xs text-gray-400 mt-1">{ex.notes}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-gray-400">Loading...</div>}>
      <PlanDetails />
    </Suspense>
  );
}
