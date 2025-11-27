import Dexie, { Table } from "dexie";

export type UUID = string;

export interface Exercise {
  id: UUID;
  name: string;
  muscle_group?: string;
  notes?: string;
  is_custom?: boolean;
  created_at: number; // epoch ms
  updated_at: number;
  deleted_at?: number | null;
}

export interface Workout {
  id: UUID;
  date_utc: string; // ISO date
  timezone: string;
  notes?: string;
  created_at: number;
  updated_at: number;
  deleted_at?: number | null;
}

export interface SetEntry {
  id: UUID;
  workout_id: UUID;
  exercise_id: UUID;
  reps: number;
  weight?: number;
  unit?: "kg" | "lb";
  rpe?: number;
  rest_seconds?: number;
  created_at: number;
  updated_at: number;
  deleted_at?: number | null;
}

export interface Template {
  id: UUID;
  name: string;
  items: Array<{ exercise_id: UUID; target_sets?: number; target_reps?: number; }>;
  updated_at: number;
}

export interface WorkoutPlan {
  id: UUID;
  name: string;
  exercise_ids: UUID[];
  notes?: string;
  created_at: number;
  updated_at: number;
}

export interface Profile {
  id: UUID; // singleton id
  units_pref?: "kg" | "lb";
  theme?: "light" | "dark";
  updated_at: number;
}

export interface OutboxItem {
  id: UUID;
  table: string;
  op: "upsert" | "delete";
  payload: any;
  client_id: string;
  ts: number; // epoch ms
  retry_count: number;
}

export class GymDB extends Dexie {
  exercises!: Table<Exercise, string>;
  workouts!: Table<Workout, string>;
  sets!: Table<SetEntry, string>;
  templates!: Table<Template, string>;
  profile!: Table<Profile, string>;
  outbox!: Table<OutboxItem, string>;
  workoutPlans!: Table<WorkoutPlan, string>;

  constructor() {
    super("gym-db");
    this.version(1).stores({
      exercises: "id, updated_at, deleted_at",
      workouts: "id, date_utc, updated_at, deleted_at",
      sets: "id, workout_id, exercise_id, created_at, updated_at, deleted_at",
      templates: "id, updated_at",
      profile: "id",
      outbox: "id, table, ts",
    });
    this.version(2).stores({
      workoutPlans: "id, name, updated_at",
    }).upgrade((tx) => {
      // Migration for version 2: add workoutPlans table
      console.log("Upgraded to DB version 2: added workoutPlans");
    });
    this.version(3).stores({
      exercises: "id, name, updated_at, deleted_at",
    }).upgrade((tx) => {
      // Migration for version 3: add name index to exercises
      console.log("Upgraded to DB version 3: added name index to exercises");
    });
  }
}

export const db = new GymDB();
