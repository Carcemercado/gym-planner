"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db, Exercise, Workout, SetEntry, WorkoutPlan } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import ExercisePicker from "@/components/ExercisePicker";
import SetEditor, { Unit } from "@/components/SetEditor";
import RestTimer from "@/components/RestTimer";

export default function NewWorkoutPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  
  const [selected, setSelected] = useState<string[]>([]);
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    // ensure a workout entity exists when entering the page
    const createWorkout = async () => {
      const now = Date.now();
      const w: Workout = {
        id: uuidv4(),
        date_utc: new Date(now).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: "",
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      await db.workouts.put(w);
      setWorkoutId(w.id);
      setStartedAt(new Date(now));

      // If planId is provided, load the plan and pre-select exercises
      if (planId) {
        const plan = await db.workoutPlans.get(planId);
        if (plan) {
          setSelected(plan.exercise_ids);
          if (plan.exercise_ids.length > 0) {
            setCurrentExerciseId(plan.exercise_ids[0]);
          }
          setPlanName(plan.name);
        }
      }
    };
    createWorkout();
  }, [planId]);

  const toggleExercise = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const setCurrent = (id: string) => setCurrentExerciseId(id);

  const addSet = async (reps: number, weight: number | undefined, unit: Unit) => {
    if (!workoutId || !currentExerciseId) return;
    const now = Date.now();
    const s: SetEntry = {
      id: uuidv4(),
      workout_id: workoutId,
      exercise_id: currentExerciseId,
      reps,
      weight,
      unit,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    await db.sets.put(s);
  };

  const finishWorkout = async () => {
    if (!workoutId) return;
    await db.workouts.update(workoutId, { updated_at: Date.now() });
  };

  return (
    <main>
      <div className="mb-4">
        <Link href="/workouts">← Back</Link>
      </div>
      <h1 className="text-2xl font-bold mb-2">New Workout{planName ? `: ${planName}` : ""}</h1>
      {startedAt && <div className="text-sm text-gray-600 mb-4">Started {startedAt.toLocaleString()}</div>}

      <div className="grid gap-4">
        <section className="space-y-2">
          <h2 className="font-semibold">Pick exercises</h2>
          <ExercisePicker selectedIds={selected} onToggle={toggleExercise} />
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => (
              <button key={id} className={id === currentExerciseId ? "px-2 py-1 rounded bg-sky-600 text-white" : "px-2 py-1 rounded bg-gray-200"} onClick={() => setCurrent(id)}>
                {id.slice(0, 6)}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">Log set</h2>
          <SetEditor onAdd={addSet} />
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">Rest timer</h2>
          <RestTimer initialSeconds={90} />
        </section>

        <section>
          <button className="px-3 py-2 rounded bg-emerald-600 text-white" onClick={finishWorkout}>Finish Workout</button>
        </section>
      </div>
    </main>
  );
}
