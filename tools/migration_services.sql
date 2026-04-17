-- =====================================================
-- Whalium 服务项目字段迁移
-- 在 Supabase SQL Editor 中运行
-- https://supabase.com/dashboard/project/cenmhxewrmjpibkokuls/sql/new
-- =====================================================

-- 1. 给 firms 表添加 services JSONB 字段
-- 格式: [{"name":"商标注册","name_en":"TM Reg.","desc":"...","desc_en":"...","price":"$800–$1,200/类","price_en":"$800–$1,200/class"}]
ALTER TABLE public.firms
  ADD COLUMN IF NOT EXISTS services jsonb DEFAULT '[]';

-- 2. 给 Morrison IP Law 写入示例服务数据
UPDATE public.firms SET services = '[
  {"name":"🏷️ 美国商标注册","name_en":"🏷️ US Trademark Reg.","desc":"全程代理 USPTO 商标注册，包括申请、审查回复、公告异议应对至最终注册。","desc_en":"Full USPTO trademark registration: filing, examination replies, and opposition responses.","price":"$800–$1,200/类","price_en":"$800–$1,200/class"},
  {"name":"📋 驳回答辩","name_en":"📋 Office Action Response","desc":"针对审查官驳回通知进行专业答辩，成功率高达 78%，含复审程序。","desc_en":"Professional office action responses with 78% success rate, including TTAB appeals.","price":"$1,500–$2,500","price_en":"$1,500–$2,500"},
  {"name":"💡 发明专利申请","name_en":"💡 Patent Filing","desc":"发明专利、实用新型全类别申请代理，技术背景评估 + 权利要求撰写。","desc_en":"Utility and design patent filing: technical assessment + claim drafting.","price":"$3,000–$6,000","price_en":"$3,000–$6,000"},
  {"name":"⚔️ 商标侵权维权","name_en":"⚔️ TM Enforcement","desc":"电商平台侵权投诉（亚马逊/eBay/Walmart）、C&D 律师函、法院诉讼代理。","desc_en":"E-commerce infringement (Amazon/eBay/Walmart), C&D letters, court litigation.","price":"按案件报价","price_en":"Case-by-Case"},
  {"name":"©️ 版权登记","name_en":"©️ Copyright Reg.","desc":"软件、美术作品、文字作品美国版权局登记，快速通道 5 个工作日出证。","desc_en":"US Copyright registration for software, art & literary works. 5-day expedited.","price":"$300–$500","price_en":"$300–$500"},
  {"name":"🌐 国际商标延伸","name_en":"🌐 International TM","desc":"马德里协议国际商标注册，单次申请覆盖欧盟、英国、澳大利亚等多国。","desc_en":"Madrid Protocol TM: EU, UK, Australia & more in one application.","price":"$500–$900/国","price_en":"$500–$900/country"}
]'::jsonb
WHERE slug = 'usa-morrison-ip-law';

-- 3. 验证
SELECT name, jsonb_array_length(services) AS service_count
FROM firms
WHERE services IS NOT NULL AND services != '[]'::jsonb;
