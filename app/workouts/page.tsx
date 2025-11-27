"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db, Workout, SetEntry, Exercise } from "@/lib/db";

const PAGE_SIZE = 20;

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadWorkouts = async (pageNum: number) => {
    const ws = await db.workouts.orderBy("date_utc").reverse().offset((pageNum - 1) * PAGE_SIZE).limit(PAGE_SIZE + 1).toArray();
    const hasMoreResults = ws.length > PAGE_SIZE;
    const pageWorkouts = hasMoreResults ? ws.slice(0, PAGE_SIZE) : ws;
    
    if (pageNum === 1) {
      setWorkouts(pageWorkouts);
    } else {
      setWorkouts((prev) => [...prev, ...pageWorkouts]);
    }
    setHasMore(hasMoreResults);
    
    // Load sets for these workouts
    const workoutIds = pageWorkouts.map(w => w.id);
    const ss = await db.sets.where("workout_id").anyOf(workoutIds).toArray();
    setSets((prev) => {
      const existing = pageNum === 1 ? [] : prev;
      const combined = [...existing, ...ss];
      // Deduplicate by id
      return Array.from(new Map(combined.map(s => [s.id, s])).values());
    });
  };

  useEffect(() => {
    const load = async () => {
      await loadWorkouts(1);
      const ex = await db.exercises.toArray();
      setExercises(Object.fromEntries(ex.map((e) => [e.id, e])));
    };
    load();
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadWorkouts(nextPage);
  };

  const setsByWorkout = (workoutId: string) => sets.filter((s) => s.workout_id === workoutId);

  return (
    <main>
      <div className="mb-4">
        <Link href="/">← Back</Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Workout History</h1>
        <Link href="/workouts/new" className="px-3 py-2 rounded bg-sky-600 text-white">Start Workout</Link>
      </div>
      <ul className="space-y-3">
        {workouts.map((w) => (
          <li key={w.id} className="border rounded p-3 bg-white">
            <div className="text-sm text-gray-600">{new Date(w.date_utc).toLocaleString()}</div>
            <div className="mt-2 space-y-1">
              {setsByWorkout(w.id).map((s) => (
                <div key={s.id} className="text-sm">
                  <span className="font-medium">{exercises[s.exercise_id]?.name || "Exercise"}</span> — {s.reps} reps {s.weight != null ? `@ ${s.weight} ${s.unit}` : ""}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className="mt-4 text-center">
          <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={loadMore}>Load More</button>
        </div>
      )}
    </main>
  );
}
