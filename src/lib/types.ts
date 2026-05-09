// ============================================================
// 归位 — 数据类型定义
// ============================================================

export type ActionType = "reading" | "exercise" | "walking" | "cleaning" | "english";

export const ACTION_CONFIG: Record<
  ActionType,
  { label: string; description: string; icon: string }
> = {
  reading: {
    label: "读书",
    description: "读一页就行",
    icon: "BookOpen",
  },
  exercise: {
    label: "运动",
    description: "做一组就行",
    icon: "Dumbbell",
  },
  walking: {
    label: "散步",
    description: "出门走一圈",
    icon: "Footprints",
  },
  cleaning: {
    label: "整理房间",
    description: "清出一小块地方",
    icon: "Home",
  },
  english: {
    label: "学英语",
    description: "读一句，或者背一个词",
    icon: "Languages",
  },
};

export interface PauseRecord {
  id: string;
  time: string; // ISO string
  choice: "continue" | "switch";
}

export interface ActionRecord {
  id: string;
  type: ActionType;
  label: string;
  completedAt?: string; // ISO string
  completed: boolean;
  createdAt?: string; // ISO string
}

export interface TomorrowPreview {
  targetDate: string; // "YYYY-MM-DD"
  tomorrowTasks: string[];
  possibleFailures: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface DailyRecord {
  date: string; // "YYYY-MM-DD"
  topThreeTasks: string[];
  pauses: PauseRecord[];
  actions: ActionRecord[];
  previewForTomorrow?: TomorrowPreview;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface AppData {
  version: number;
  records: DailyRecord[];
}
