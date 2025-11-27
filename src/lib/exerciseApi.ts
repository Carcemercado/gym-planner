// ExerciseDB API integration
// Docs: https://exercisedb.p.rapidapi.com/

const API_BASE = "https://exercisedb.p.rapidapi.com";
const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "";

interface ExerciseDbExercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

const headers = {
  "X-RapidAPI-Key": API_KEY,
  "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
};

export async function checkApiStatus(): Promise<string> {
  const res = await fetch(`${API_BASE}/status`, { headers });
  return res.text();
}

export async function getExercisesByBodyPart(bodyPart: string): Promise<ExerciseDbExercise[]> {
  const res = await fetch(`${API_BASE}/exercises/bodyPart/${bodyPart}`, { headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getExercisesByTarget(target: string): Promise<ExerciseDbExercise[]> {
  const res = await fetch(`${API_BASE}/exercises/target/${target}`, { headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function searchExercises(name: string): Promise<ExerciseDbExercise[]> {
  const res = await fetch(`${API_BASE}/exercises/name/${name}`, { headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getBodyPartList(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/exercises/bodyPartList`, { headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getTargetMuscleList(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/exercises/targetList`, { headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getEquipmentList(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/exercises/equipmentList`, { headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Map ExerciseDB data to our local Exercise format
export function mapToLocalExercise(apiExercise: ExerciseDbExercise) {
  return {
    name: apiExercise.name,
    muscle_group: apiExercise.bodyPart,
    notes: `Target: ${apiExercise.target}\nEquipment: ${apiExercise.equipment}\n${apiExercise.instructions.join("\n")}`,
    metadata: {
      apiId: apiExercise.id,
      gifUrl: apiExercise.gifUrl,
      target: apiExercise.target,
      secondaryMuscles: apiExercise.secondaryMuscles,
      equipment: apiExercise.equipment,
    },
  };
}
