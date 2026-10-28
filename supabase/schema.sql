-- ============================================
-- AI 场景生存测试 - 数据库表结构
-- 在 Supabase 控制台的 SQL Editor 中执行以下代码
-- ============================================

-- 1. 测试结果表
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worldview_id TEXT NOT NULL,
  worldview_name TEXT NOT NULL,
  episodes_survived INTEGER NOT NULL,
  primary_trait TEXT NOT NULL,
  secondary_trait TEXT NOT NULL,
  trait_scores JSONB NOT NULL DEFAULT '{}',
  role TEXT,
  ending TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 开启行级安全（RLS）
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- 3. 允许任何人插入测试结果（匿名用户也能提交）
CREATE POLICY "允许匿名插入测试结果"
  ON public.test_results
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4. 允许任何人读取测试结果（用于排行榜和统计）
CREATE POLICY "允许公开读取测试结果"
  ON public.test_results
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 5. 不允许删除和修改（数据只能追加，保证统计准确）
-- （默认 RLS 开启后，没有策略就不允许，所以无需额外设置）

-- 6. 创建索引，提升排行榜查询性能
CREATE INDEX IF NOT EXISTS idx_test_results_worldview
  ON public.test_results (worldview_id);

CREATE INDEX IF NOT EXISTS idx_test_results_episodes
  ON public.test_results (episodes_survived DESC);

-- ============================================
-- 执行完毕后，可以用以下 SQL 测试：
-- SELECT * FROM public.test_results LIMIT 10;
-- SELECT worldview_name, count(*), avg(episodes_survived)
-- FROM public.test_results GROUP BY worldview_name;
-- ============================================
