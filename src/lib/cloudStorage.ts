// ============================================================
// 归位 — Supabase 云端存储工具函数
// ============================================================

import { supabase } from "./supabase";
import type { DailyRecord, PauseRecord, ActionRecord, TomorrowPreview } from "./types";
import type { Json } from "./database.types";

const USER_ID = "default_user";

export function getTodayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getTomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseRecord(row: any): DailyRecord {
  return {
    date: row.date,
    topThreeTasks: Array.isArray(row.top_three_tasks) ? row.top_three_tasks as string[] : ["", "", ""],
    pauses: Array.isArray(row.pauses) ? row.pauses as PauseRecord[] : [],
    actions: Array.isArray(row.actions) ? row.actions as ActionRecord[] : [],
    previewForTomorrow: row.preview_for_tomorrow as TomorrowPreview | undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getRecord(dateKey: string): Promise<DailyRecord | null> {
  const { data, error } = await supabase
    .from("daily_records")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("date", dateKey)
    .single();

  if (error || !data) return null;
  return parseRecord(data);
}

export async function getOrCreateTodayRecord(): Promise<DailyRecord> {
  const todayKey = getTodayKey();
  const existing = await getRecord(todayKey);
  if (existing) return existing;

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("daily_records")
    .insert({
      user_id: USER_ID,
      date: todayKey,
      top_three_tasks: ["", "", ""],
      pauses: [],
      actions: [],
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error("Failed to create today record: " + error?.message);
  }
  return parseRecord(data);
}

export async function saveTodayTasks(tasks: string[]): Promise<DailyRecord> {
  const todayKey = getTodayKey();
  const now = new Date().toISOString();

  const existing = await getRecord(todayKey);

  if (existing) {
    const { data, error } = await supabase
      .from("daily_records")
      .update({
        top_three_tasks: tasks as unknown as Json,
        updated_at: now,
      })
      .eq("user_id", USER_ID)
      .eq("date", todayKey)
      .select()
      .single();

    if (error || !data) throw new Error("Failed to save tasks: " + error?.message);
    return parseRecord(data);
  } else {
    const { data, error } = await supabase
      .from("daily_records")
      .insert({
        user_id: USER_ID,
        date: todayKey,
        top_three_tasks: tasks as unknown as Json,
        pauses: [],
        actions: [],
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error || !data) throw new Error("Failed to create record: " + error?.message);
    return parseRecord(data);
  }
}

export async function addPauseRecord(choice: "continue" | "switch"): Promise<DailyRecord> {
  const todayKey = getTodayKey();
  const now = new Date().toISOString();
  const pause: PauseRecord = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    time: now,
    choice,
  };

  const existing = await getRecord(todayKey);

  if (existing) {
    const updatedPauses = [...existing.pauses, pause] as unknown as Json;
    const { data, error } = await supabase
      .from("daily_records")
      .update({ pauses: updatedPauses, updated_at: now })
      .eq("user_id", USER_ID)
      .eq("date", todayKey)
      .select()
      .single();

    if (error || !data) throw new Error("Failed to add pause: " + error?.message);
    return parseRecord(data);
  } else {
    const { data, error } = await supabase
      .from("daily_records")
      .insert({
        user_id: USER_ID,
        date: todayKey,
        top_three_tasks: ["", "", ""],
        pauses: [pause] as unknown as Json,
        actions: [],
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error || !data) throw new Error("Failed to create record with pause: " + error?.message);
    return parseRecord(data);
  }
}

export async function addActionRecord(
  action: Omit<ActionRecord, "id" | "createdAt">
): Promise<DailyRecord> {
  const todayKey = getTodayKey();
  const now = new Date().toISOString();
  const actionRecord: ActionRecord = {
    ...action,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: now,
  };

  const existing = await getRecord(todayKey);

  if (existing) {
    const updatedActions = [...existing.actions, actionRecord] as unknown as Json;
    const { data, error } = await supabase
      .from("daily_records")
      .update({ actions: updatedActions, updated_at: now })
      .eq("user_id", USER_ID)
      .eq("date", todayKey)
      .select()
      .single();

    if (error || !data) throw new Error("Failed to add action: " + error?.message);
    return parseRecord(data);
  } else {
    const { data, error } = await supabase
      .from("daily_records")
      .insert({
        user_id: USER_ID,
        date: todayKey,
        top_three_tasks: ["", "", ""],
        pauses: [],
        actions: [actionRecord] as unknown as Json,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error || !data) throw new Error("Failed to create record with action: " + error?.message);
    return parseRecord(data);
  }
}

export async function saveTomorrowPreview(preview: TomorrowPreview): Promise<void> {
  const todayKey = getTodayKey();
  const now = new Date().toISOString();
  const fullPreview: TomorrowPreview = {
    ...preview,
    createdAt: preview.createdAt || now,
    updatedAt: now,
  };

  const existing = await getRecord(todayKey);

  if (existing) {
    await supabase
      .from("daily_records")
      .update({ preview_for_tomorrow: fullPreview as unknown as Json, updated_at: now })
      .eq("user_id", USER_ID)
      .eq("date", todayKey);
  } else {
    await supabase
      .from("daily_records")
      .insert({
        user_id: USER_ID,
        date: todayKey,
        top_three_tasks: ["", "", ""],
        pauses: [],
        actions: [],
        preview_for_tomorrow: fullPreview as unknown as Json,
        created_at: now,
        updated_at: now,
      });
  }
}

export async function getPreviewForDate(targetDate: string): Promise<TomorrowPreview | null> {
  const { data, error } = await supabase
    .from("daily_records")
    .select("preview_for_tomorrow, date")
    .eq("user_id", USER_ID)
    .not("preview_for_tomorrow", "is", null);

  if (error || !data) return null;

  for (const row of data) {
    const preview = row.preview_for_tomorrow as TomorrowPreview | null;
    if (preview && preview.targetDate === targetDate) {
      return preview;
    }
  }
  return null;
}

export async function getAllRecords(): Promise<DailyRecord[]> {
  const { data, error } = await supabase
    .from("daily_records")
    .select("*")
    .eq("user_id", USER_ID)
    .order("date", { ascending: false });

  if (error) return [];
  return data.map(parseRecord);
}

export function exportData(): string {
  return JSON.stringify({ user_id: USER_ID, exported_at: new Date().toISOString() }, null, 2);
}

export function importData(_jsonString: string): boolean {
  return false;
}

export function clearAllData(): void {
  console.warn("Clear all data is not supported in Supabase mode.");
}
