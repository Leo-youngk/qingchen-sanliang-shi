// ============================================================
// 归位 — 本地存储工具函数（仅客户端使用）
// ============================================================

import { DailyRecord, AppData, PauseRecord, ActionRecord, TomorrowPreview } from "./types";

const STORAGE_KEY = "guiwei.records.v1";
const CURRENT_VERSION = 1;

// 获取本地 TZ 格式的 YYYY-MM-DD
export function getTodayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// 获取明天的 YYYY-MM-DD
export function getTomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// 获取前一天的 YYYY-MM-DD
export function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function readAll(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: CURRENT_VERSION, records: [] };
    const data = JSON.parse(raw) as AppData;
    // 基础验证
    if (!data || typeof data.version !== "number" || !Array.isArray(data.records)) {
      return { version: CURRENT_VERSION, records: [] };
    }
    return data;
  } catch {
    return { version: CURRENT_VERSION, records: [] };
  }
}

function writeAll(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 静默失败，避免白屏
  }
}

// 获取某一天的记录
export function getRecord(dateKey: string): DailyRecord | null {
  const data = readAll();
  return data.records.find((r) => r.date === dateKey) ?? null;
}

// 获取或创建今日记录
export function getOrCreateTodayRecord(): DailyRecord {
  const todayKey = getTodayKey();
  const existing = getRecord(todayKey);
  if (existing) return existing;
  const now = new Date().toISOString();
  const record: DailyRecord = {
    date: todayKey,
    topThreeTasks: ["", "", ""],
    pauses: [],
    actions: [],
    createdAt: now,
    updatedAt: now,
  };
  const data = readAll();
  data.records.push(record);
  writeAll(data);
  return record;
}

// 保存今日三件事
export function saveTodayTasks(tasks: string[]): DailyRecord {
  const todayKey = getTodayKey();
  const data = readAll();
  const now = new Date().toISOString();
  const idx = data.records.findIndex((r) => r.date === todayKey);
  if (idx >= 0) {
    data.records[idx].topThreeTasks = tasks;
    data.records[idx].updatedAt = now;
  } else {
    const record: DailyRecord = {
      date: todayKey,
      topThreeTasks: tasks,
      pauses: [],
      actions: [],
      createdAt: now,
      updatedAt: now,
    };
    data.records.push(record);
  }
  writeAll(data);
  return data.records.find((r) => r.date === todayKey)!;
}

// 添加一次暂停记录
export function addPauseRecord(choice: "continue" | "switch"): DailyRecord {
  const todayKey = getTodayKey();
  const data = readAll();
  const now = new Date().toISOString();
  const pauseRecord: PauseRecord = {
    id: generateId(),
    time: now,
    choice,
  };
  const idx = data.records.findIndex((r) => r.date === todayKey);
  if (idx >= 0) {
    data.records[idx].pauses.push(pauseRecord);
    data.records[idx].updatedAt = now;
  } else {
    const record: DailyRecord = {
      date: todayKey,
      topThreeTasks: ["", "", ""],
      pauses: [pauseRecord],
      actions: [],
      createdAt: now,
      updatedAt: now,
    };
    data.records.push(record);
  }
  writeAll(data);
  return data.records.find((r) => r.date === todayKey)!;
}

// 添加一个行动记录
export function addActionRecord(
  action: Omit<ActionRecord, "id" | "createdAt">
): DailyRecord {
  const todayKey = getTodayKey();
  const data = readAll();
  const now = new Date().toISOString();
  const actionRecord: ActionRecord = {
    ...action,
    id: generateId(),
    createdAt: now,
  };
  const idx = data.records.findIndex((r) => r.date === todayKey);
  if (idx >= 0) {
    data.records[idx].actions.push(actionRecord);
    data.records[idx].updatedAt = now;
  } else {
    const record: DailyRecord = {
      date: todayKey,
      topThreeTasks: ["", "", ""],
      pauses: [],
      actions: [actionRecord],
      createdAt: now,
      updatedAt: now,
    };
    data.records.push(record);
  }
  writeAll(data);
  return data.records.find((r) => r.date === todayKey)!;
}

// 更新行动记录（目前仅保留接口兼容）
export function updateActionRecord(
  actionId: string,
  update: Partial<Pick<ActionRecord, "completed" | "completedAt">>
): void {
  const todayKey = getTodayKey();
  const data = readAll();
  const idx = data.records.findIndex((r) => r.date === todayKey);
  if (idx >= 0) {
    const actionIdx = data.records[idx].actions.findIndex((a) => a.id === actionId);
    if (actionIdx >= 0) {
      Object.assign(data.records[idx].actions[actionIdx], update);
      data.records[idx].updatedAt = new Date().toISOString();
      writeAll(data);
    }
  }
}

// 保存明日预演
export function saveTomorrowPreview(preview: TomorrowPreview): void {
  const todayKey = getTodayKey();
  const data = readAll();
  const now = new Date().toISOString();

  // 更新或创建今日记录的 previewForTomorrow
  const todayIdx = data.records.findIndex((r) => r.date === todayKey);
  const fullPreview: TomorrowPreview = {
    ...preview,
    createdAt: preview.createdAt || now,
    updatedAt: now,
  };

  if (todayIdx >= 0) {
    data.records[todayIdx].previewForTomorrow = fullPreview;
    data.records[todayIdx].updatedAt = now;
  } else {
    const record: DailyRecord = {
      date: todayKey,
      topThreeTasks: ["", "", ""],
      pauses: [],
      actions: [],
      previewForTomorrow: fullPreview,
      createdAt: now,
      updatedAt: now,
    };
    data.records.push(record);
  }
  writeAll(data);
}

// 获取针对某个日期（targetDate）的预演内容
export function getPreviewForDate(targetDate: string): TomorrowPreview | null {
  const data = readAll();
  for (const record of data.records) {
    if (record.previewForTomorrow?.targetDate === targetDate) {
      return record.previewForTomorrow;
    }
  }
  return null;
}

// 获取所有记录，按日期倒序
export function getAllRecords(): DailyRecord[] {
  const data = readAll();
  return [...data.records].sort((a, b) => (a.date > b.date ? -1 : 1));
}

// 导出所有数据
export function exportData(): string {
  const data = readAll();
  return JSON.stringify(data, null, 2);
}

// 导入数据
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data.version !== "number" || !Array.isArray(data.records)) {
      return false;
    }
    writeAll(data as AppData);
    return true;
  } catch {
    return false;
  }
}

// 清空数据
export function clearAllData(): void {
  writeAll({ version: CURRENT_VERSION, records: [] });
}
