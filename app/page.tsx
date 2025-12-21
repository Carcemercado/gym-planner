"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db, Workout, SetEntry, Exercise, WorkoutPlan } from "@/lib/db";

export default function HomePage() {
  const [lastWorkout, setLastWorkout] = useState<Workout | null>(null);
  const [recentSets, setRecentSets] = useState<SetEntry[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalSets: 0, thisWeek: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const load = async () => {
      const [ws, ss, ex, pl] = await Promise.all([
        db.workouts.orderBy("date_utc").reverse().toArray(),
        db.sets.orderBy("created_at").reverse().limit(5).toArray(),
        db.exercises.toArray(),
        db.workoutPlans.orderBy("updated_at").reverse().limit(3).toArray(),
      ]);
      
      setLastWorkout(ws[0] ?? null);
      setRecentSets(ss);
      setExercises(Object.fromEntries(ex.map((e) => [e.id, e])));
      setPlans(pl);

      // Calculate stats
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const thisWeekWorkouts = ws.filter(w => new Date(w.date_utc).getTime() > weekAgo);
      const allSets = await db.sets.count();
      
      setStats({
        totalWorkouts: ws.length,
        totalSets: allSets,
        thisWeek: thisWeekWorkouts.length,
      });
    };
    load();
  }, []);

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gym Planner</h1>
        <p className="text-gray-600">Track your workouts, build strength, achieve goals</p>
      </div>

      {/* Quick Actions */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/workouts/new" className="p-4 rounded-lg border border-sky-500/50 bg-sky-600 text-white shadow-md shadow-sky-900/40 transition">
            <div className="text-sm font-medium mb-1">Start Workout</div>
            <div className="text-xs opacity-90">Begin session</div>
          </Link>
          <Link href="/plans" className="p-4 rounded-lg border border-emerald-500/50 bg-emerald-600 text-white shadow-md shadow-emerald-900/40 transition">
            <div className="text-sm font-medium mb-1">My Plans</div>
            <div className="text-xs opacity-90">{mounted && plans.length > 0 ? `${plans.length} saved` : "Create plans"}</div>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Link href="/exercises" className="p-4 rounded-lg border border-amber-500/60 bg-amber-900 text-white shadow-md shadow-amber-900/50 transition duration-200">
            <div className="text-sm font-medium mb-1">Exercises</div>
            <div className="text-xs opacity-90">Browse library</div>
          </Link>
          <Link href="/workouts" className="p-4 rounded-lg border border-violet-500/60 bg-violet-700 text-white shadow-md shadow-violet-900/50 transition duration-200">
            <div className="text-sm font-medium mb-1">History</div>
            <div className="text-xs opacity-90">View workouts</div>
          </Link>
        </div>
      </section>

      {/* Stats */}
      {mounted && stats.totalWorkouts > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Your Progress</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-gray-700 rounded-lg p-3 bg-gray-800">
              <div className="text-2xl font-bold text-sky-400">{stats.totalWorkouts}</div>
              <div className="text-xs text-gray-400">Total Workouts</div>
            </div>
            <div className="border border-gray-700 rounded-lg p-3 bg-gray-800">
              <div className="text-2xl font-bold text-emerald-400">{stats.thisWeek}</div>
              <div className="text-xs text-gray-400">This Week</div>
            </div>
            <div className="border border-gray-700 rounded-lg p-3 bg-gray-800">
              <div className="text-2xl font-bold text-amber-400">{stats.totalSets}</div>
              <div className="text-xs text-gray-400">Total Sets</div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Start Plans */}
      {mounted && plans.length > 0 && (
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Recent Plans</h2>
            <Link href="/plans" className="text-sm text-sky-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {plans.map((p) => (
              <Link key={p.id} href={`/workouts/new?planId=${p.id}`} className="block border border-gray-700 rounded-lg p-3 bg-gray-800 hover:bg-gray-700 transition">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.exercise_ids.length} exercises</div>
                  </div>
                  <div className="text-sky-600 text-sm">Start →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Last Workout */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Last Workout</h2>
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
          {!mounted ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : lastWorkout ? (
            <div>
              <div className="text-sm text-gray-300 mb-2">{new Date(lastWorkout.date_utc).toLocaleDateString()} at {new Date(lastWorkout.date_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              {recentSets.length > 0 && (
                <div className="text-xs text-gray-400">{recentSets.filter(s => s.workout_id === lastWorkout.id).length} sets completed</div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-sm text-gray-400 mb-3">No workouts yet</div>
              <Link href="/workouts/new" className="inline-block px-4 py-2 rounded border border-sky-500/50 bg-sky-700 text-white text-sm shadow-md shadow-sky-900/40">Start Your First Workout</Link>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      {mounted && recentSets.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
            <ul className="space-y-2">
              {recentSets.slice(0, 3).map((s) => (
                <li key={s.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-sm">{exercises[s.exercise_id]?.name || "Exercise"}</span>
                    <span className="text-xs text-gray-400 ml-2">{s.reps} reps {s.weight != null ? `× ${s.weight}${s.unit}` : ""}</span>
                  </div>
                  <div className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
