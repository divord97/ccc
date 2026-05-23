-- Advanced AI: Communication Agents
CREATE TABLE IF NOT EXISTS comm_agents (
    id BIGINT NOT NULL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    digital_employee_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'inbound',
    system_prompt TEXT NOT NULL,
    max_turns INT NOT NULL DEFAULT 20,
    transfer_skill_group_id BIGINT,
    llm_model_id BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    INDEX idx_comm_agents_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comm_agent_sessions (
    id BIGINT NOT NULL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    comm_agent_id BIGINT NOT NULL,
    call_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    turn_count INT NOT NULL DEFAULT 0,
    transcript LONGTEXT,
    summary TEXT,
    transferred_to BIGINT,
    started_at DATETIME(3) NOT NULL,
    ended_at DATETIME(3),
    INDEX idx_cas_tenant (tenant_id),
    INDEX idx_cas_agent (comm_agent_id),
    INDEX idx_cas_call (call_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Advanced AI: Voice Cloning
CREATE TABLE IF NOT EXISTS voice_profiles (
    id BIGINT NOT NULL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    sample_audio_url VARCHAR(1024) NOT NULL,
    provider_voice_id VARCHAR(255) NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    language VARCHAR(10) NOT NULL DEFAULT 'zh-CN',
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    INDEX idx_vp_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Advanced AI: Conversation Analytics
CREATE TABLE IF NOT EXISTS conversation_analysis_tasks (
    id BIGINT NOT NULL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL,
    date_from VARCHAR(20) NOT NULL,
    date_to VARCHAR(20) NOT NULL,
    total_calls INT NOT NULL DEFAULT 0,
    processed_calls INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    result_json LONGTEXT,
    created_at DATETIME(3) NOT NULL,
    completed_at DATETIME(3),
    INDEX idx_cat_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Advanced AI: Training
CREATE TABLE IF NOT EXISTS training_courses (
    id BIGINT NOT NULL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_json LONGTEXT,
    pass_score INT NOT NULL DEFAULT 80,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    INDEX idx_tc_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS training_exams (
    id BIGINT NOT NULL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    agent_id BIGINT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    max_score INT NOT NULL DEFAULT 100,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    answers_json LONGTEXT,
    created_at DATETIME(3) NOT NULL,
    INDEX idx_te_tenant (tenant_id),
    INDEX idx_te_agent (agent_id),
    INDEX idx_te_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS simulated_calls (
    id BIGINT NOT NULL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    agent_id BIGINT NOT NULL,
    scenario_id BIGINT NOT NULL,
    transcript LONGTEXT,
    ai_feedback TEXT,
    score INT NOT NULL DEFAULT 0,
    duration_sec INT NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL,
    INDEX idx_sc_tenant (tenant_id),
    INDEX idx_sc_agent (agent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Advanced AI: Ring Analysis
CREATE TABLE IF NOT EXISTS ring_analysis_configs (
    id BIGINT NOT NULL PRIMARY KEY,
    tenant_id BIGINT NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    detection_timeout_ms INT NOT NULL DEFAULT 5000,
    hangup_on_voicemail BOOLEAN NOT NULL DEFAULT FALSE,
    hangup_on_fax BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ring_analysis_logs (
    id BIGINT NOT NULL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    call_id BIGINT NOT NULL,
    result VARCHAR(20) NOT NULL,
    confidence DOUBLE NOT NULL DEFAULT 0,
    duration_ms INT NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL,
    INDEX idx_ral_tenant (tenant_id),
    INDEX idx_ral_call (call_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Advanced AI: Full-Duplex
CREATE TABLE IF NOT EXISTS full_duplex_configs (
    id BIGINT NOT NULL PRIMARY KEY,
    tenant_id BIGINT NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    interruption_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    silence_threshold_ms INT NOT NULL DEFAULT 500,
    interruption_sensitivity DOUBLE NOT NULL DEFAULT 0.5,
    voice_continuity BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
