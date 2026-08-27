-- 0005_ci_kaizen.sql: Database tables for CN-CI (Cải tiến liên tục / Kaizen / Gemba)

-- 1. BẢNG QUẢN LÝ ĐỀ XUẤT CẢI TIẾN KAIZEN (ci_kaizen_proposals)
CREATE TABLE IF NOT EXISTS ci_kaizen_proposals (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- PRODUCTIVITY, COST_SAVING, SAFETY, AUTOMATION, 5S, MATERIAL_SAVING, EQUIPMENT, OTHER
    category_label TEXT NOT NULL, -- 3.Tăng Năng suất, 1.Tiết kiệm Vật tư, 4.An toàn lao động, etc.
    registration_type TEXT DEFAULT 'THI_DUA', -- THI_DUA, LUU_TRU
    sub_status TEXT DEFAULT 'CHO_DANH_GIA', -- DA_DANH_GIA, CHO_DANH_GIA
    region TEXT NOT NULL, -- LONG XUYÊN, ĐẾ, ĐÀ NẴNG, HỘI AN, ĐỒNG XOÀI...
    department TEXT NOT NULL,
    factory TEXT,
    proposer_name TEXT NOT NULL,
    proposer_emp_code TEXT NOT NULL,
    dept_code TEXT DEFAULT 'SK', -- DP, SK, RB, WR, Khác
    before_description TEXT,
    after_solution TEXT,
    saved_seconds INTEGER DEFAULT 0,
    before_image_url TEXT,
    after_image_url TEXT,
    attachments_json TEXT,
    status TEXT DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, IMPLEMENTED
    award_title TEXT, -- Giải Nhất, Giải Nhì, Giải Ba, Giải Khuyến Khích
    score_points REAL DEFAULT 0.0,
    avg_rating REAL DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    vote_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    rejection_reason TEXT,
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG ĐÁNH GIÁ & SAO RATING (ci_kaizen_evaluations)
CREATE TABLE IF NOT EXISTS ci_kaizen_evaluations (
    id TEXT PRIMARY KEY,
    proposal_id TEXT NOT NULL,
    evaluator_emp_code TEXT NOT NULL,
    evaluator_name TEXT NOT NULL,
    rating_stars INTEGER CHECK (rating_stars BETWEEN 1 AND 5),
    score_given REAL,
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES ci_kaizen_proposals(id) ON DELETE CASCADE
);

-- 3. BẢNG LOG VOTE & LƯỢT XEM (ci_kaizen_votes)
CREATE TABLE IF NOT EXISTS ci_kaizen_votes (
    id TEXT PRIMARY KEY,
    proposal_id TEXT NOT NULL,
    user_emp_code TEXT NOT NULL,
    voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proposal_id, user_emp_code)
);
