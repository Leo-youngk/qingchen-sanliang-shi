-- ============================================================
-- 归位 (guiwei) — Supabase 数据库迁移
-- 在 Supabase Dashboard > SQL Editor 中运行
-- ============================================================

-- 创建 guiwei_daily_records 表
CREATE TABLE IF NOT EXISTS guiwei_daily_records (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               text NOT NULL DEFAULT 'default_user',
  date                  text NOT NULL,
  top_three_tasks       jsonb DEFAULT '["", "", ""]',
  pauses                jsonb DEFAULT '[]',
  actions               jsonb DEFAULT '[]',
  preview_for_tomorrow  jsonb DEFAULT NULL,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),

  UNIQUE(user_id, date)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_guiwei_daily_records_user_date
  ON guiwei_daily_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_guiwei_daily_records_date
  ON guiwei_daily_records(date);

-- 开启 RLS（行级安全）
ALTER TABLE guiwei_daily_records ENABLE ROW LEVEL SECURITY;

-- RLS 策略：仅允许 default_user 访问（个人使用模式）
CREATE POLICY "guiwei_allow_read" ON guiwei_daily_records
  FOR SELECT USING (user_id = 'default_user');

CREATE POLICY "guiwei_allow_insert" ON guiwei_daily_records
  FOR INSERT WITH CHECK (user_id = 'default_user');

CREATE POLICY "guiwei_allow_update" ON guiwei_daily_records
  FOR UPDATE USING (user_id = 'default_user');
