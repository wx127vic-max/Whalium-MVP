/**
 * ═══════════════════════════════════════════════════════
 *  Whalium · Supabase 全局配置 & 工具库
 *  supabase.js  —  所有页面共用，放在同一目录下
 * ═══════════════════════════════════════════════════════
 *
 *  ⚠️  接入前必填：
 *      1. 登录 https://supabase.com → 进入你的项目
 *      2. Settings → API → 复制 Project URL 和 anon public key
 *      3. 填入下方两个变量，保存即可
 */

// ─── 【必填】你的 Supabase 项目信息 ──────────────────────
const SUPABASE_URL  = 'https://cenmhxewrmjpibkokuls.supabase.co';   // ← 替换
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbm1oeGV3cm1qcGlia29rdWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjE5MDYsImV4cCI6MjA4NzQ5NzkwNn0.StDZuUGKoD09kcHyN4-8nQlMcUNcqp2rBHN7fkpZdf8'; // ← 替换
// ──────────────────────────────────────────────────────────

// ─── 初始化客户端（自动从 CDN 加载 SDK）────────────────────
let _sb = null;

async function getSB() {
    if (_sb) return _sb;
    if (!window.supabase) {
        await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
    }
    _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    return _sb;
}

function loadScript(src) {
    return new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = src; s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
    });
}

// ═══════════════════════════════════════════════════════
//  AUTH  用户认证
// ═══════════════════════════════════════════════════════

const Auth = {

    /** 邮箱注册 */
    async signUp(email, password, meta = {}) {
        const sb = await getSB();
        const { data, error } = await sb.auth.signUp({
            email, password,
            options: { data: meta }   // 存 full_name / role 等
        });
        if (error) throw error;
        return data;
    },

    /** 邮箱登录 */
    async signIn(email, password) {
        const sb = await getSB();
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    /** 退出登录 */
    async signOut() {
        const sb = await getSB();
        await sb.auth.signOut();
        window.location.href = 'login.html';
    },

    /** 获取当前登录用户（null 表示未登录）*/
    async current() {
        const sb = await getSB();
        const { data } = await sb.auth.getUser();
        return data?.user ?? null;
    },

    /** 需要登录才能访问的页面调用此方法 */
    async requireLogin(redirectTo = 'login.html') {
        const user = await this.current();
        if (!user) { window.location.href = redirectTo; return null; }
        return user;
    },

    /** 已登录则跳走（用于登录/注册页防止重复登录）*/
    async redirectIfLoggedIn(to = 'index.html') {
        const user = await this.current();
        if (user) window.location.href = to;
    },

    /** 忘记密码 → 发重置邮件 */
    async resetPassword(email) {
        const sb = await getSB();
        const { error } = await sb.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });
        if (error) throw error;
    }
};

// ═══════════════════════════════════════════════════════
//  FIRMS  律所相关操作
// ═══════════════════════════════════════════════════════

const Firms = {

    /**
     * 查询律所列表（带筛选 + 分页）
     * filters: { country, area, rating_min, feature, keyword }
     */
    async list({ country, area, rating_min, feature, keyword, page = 1, pageSize = 10 } = {}) {
        const sb = await getSB();
        let q = sb
            .from('firms')
            .select(`
                id, name_en, name_cn, country, city, address,
                email, phone, website, areas, features,
                rating, review_count, price_min, price_max,
                badges, is_verified, logo_url, created_at
            `, { count: 'exact' })
            .eq('status', 'approved')          // 只显示已审核
            .order('rating', { ascending: false });

        if (country)    q = q.eq('country', country);
        if (area)       q = q.contains('areas', [area]);
        if (rating_min) q = q.gte('rating', parseFloat(rating_min));
        if (feature)    q = q.contains('features', [feature]);
        if (keyword)    q = q.or(`name_en.ilike.%${keyword}%,name_cn.ilike.%${keyword}%,city.ilike.%${keyword}%`);

        // 分页
        const from = (page - 1) * pageSize;
        q = q.range(from, from + pageSize - 1);

        const { data, error, count } = await q;
        if (error) throw error;
        return { firms: data, total: count, page, pageSize };
    },

    /** 获取单个律所详情（含评价） */
    async get(id) {
        const sb = await getSB();
        const { data, error } = await sb
            .from('firms')
            .select(`
                *,
                reviews ( id, rating, content, created_at,
                          profiles ( full_name, avatar_url ) )
            `)
            .eq('id', id)
            .eq('status', 'approved')
            .single();
        if (error) throw error;
        return data;
    },

    /** 律所入驻申请（写入 firm_applications 表，待审核）*/
    async apply(formData) {
        const sb  = await getSB();
        const user = await Auth.current();
        const { data, error } = await sb
            .from('firm_applications')
            .insert({
                ...formData,
                applicant_id: user?.id ?? null,
                status: 'pending',
                submitted_at: new Date().toISOString()
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /** 收藏 / 取消收藏 */
    async toggleFavorite(firmId) {
        const sb   = await getSB();
        const user = await Auth.requireLogin();
        if (!user) return;

        // 查是否已收藏
        const { data: existing } = await sb
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('firm_id', firmId)
            .single();

        if (existing) {
            await sb.from('favorites').delete().eq('id', existing.id);
            return false; // 取消收藏
        } else {
            await sb.from('favorites').insert({ user_id: user.id, firm_id: firmId });
            return true;  // 已收藏
        }
    },

    /** 获取用户收藏列表 */
    async myFavorites() {
        const sb   = await getSB();
        const user = await Auth.requireLogin();
        if (!user) return [];
        const { data, error } = await sb
            .from('favorites')
            .select('firm_id, firms ( id, name_en, name_cn, country, city, rating )')
            .eq('user_id', user.id);
        if (error) throw error;
        return data.map(d => d.firms);
    }
};

// ═══════════════════════════════════════════════════════
//  REVIEWS  评价操作
// ═══════════════════════════════════════════════════════

const Reviews = {

    /** 提交评价 */
    async submit(firmId, { rating, content }) {
        const sb   = await getSB();
        const user = await Auth.requireLogin();
        if (!user) return;

        const { data, error } = await sb
            .from('reviews')
            .insert({
                firm_id: firmId,
                user_id: user.id,
                rating: parseInt(rating),
                content
            })
            .select()
            .single();
        if (error) throw error;

        // 更新律所平均分（由 Supabase DB 触发器自动完成，这里仅返回）
        return data;
    }
};

// ═══════════════════════════════════════════════════════
//  MEMBERS  会员 & 支付记录
// ═══════════════════════════════════════════════════════

const Members = {

    /** 获取当前用户会员状态 */
    async status() {
        const sb   = await getSB();
        const user = await Auth.current();
        if (!user) return null;
        const { data } = await sb
            .from('memberships')
            .select('*')
            .eq('user_id', user.id)
            .order('expires_at', { ascending: false })
            .limit(1)
            .single();
        return data;
    },

    /** 记录支付（真实支付回调后由后端写入，这里是前端 demo 占位）*/
    async recordPayment(method, amount = 365) {
        const sb   = await getSB();
        const user = await Auth.requireLogin();
        if (!user) return;

        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        const { data, error } = await sb
            .from('memberships')
            .insert({
                user_id:    user.id,
                plan:       'annual',
                amount,
                currency:   'CNY',
                method,
                expires_at: expiresAt.toISOString(),
                status:     'active'
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /** 用户是否是有效会员 */
    async isActive() {
        const m = await this.status();
        if (!m) return false;
        return m.status === 'active' && new Date(m.expires_at) > new Date();
    }
};

// ═══════════════════════════════════════════════════════
//  PROFILES  用户资料
// ═══════════════════════════════════════════════════════

const Profiles = {

    /** 获取当前用户 profile */
    async get() {
        const sb   = await getSB();
        const user = await Auth.current();
        if (!user) return null;
        const { data } = await sb
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        return data;
    },

    /** 更新用户资料 */
    async update(fields) {
        const sb   = await getSB();
        const user = await Auth.requireLogin();
        if (!user) return;
        const { error } = await sb
            .from('profiles')
            .upsert({ id: user.id, ...fields, updated_at: new Date().toISOString() });
        if (error) throw error;
    }
};

// ═══════════════════════════════════════════════════════
//  工具函数
// ═══════════════════════════════════════════════════════

/** 统一错误提示（可替换为 toast 组件）*/
function showError(msg, elId = null) {
    console.error('[Whalium]', msg);
    if (elId) {
        const el = document.getElementById(elId);
        if (el) {
            el.style.cssText = 'display:block;padding:.7rem .9rem;border-radius:6px;font-size:.83rem;margin-bottom:1rem;text-align:center;background:rgba(204,34,51,.08);color:#cc2233;border:1px solid rgba(204,34,51,.2)';
            el.textContent = msg;
        }
    }
}

function showSuccess(msg, elId) {
    if (!elId) return;
    const el = document.getElementById(elId);
    if (el) {
        el.style.cssText = 'display:block;padding:.7rem .9rem;border-radius:6px;font-size:.83rem;margin-bottom:1rem;text-align:center;background:rgba(0,153,170,.08);color:#006e8a;border:1px solid rgba(0,153,170,.2)';
        el.textContent = msg;
    }
}

/** 获取 URL 参数 */
function getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
}

/** 格式化星级 */
function stars(rating) {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

console.log('[Whalium] supabase.js loaded ✓');
