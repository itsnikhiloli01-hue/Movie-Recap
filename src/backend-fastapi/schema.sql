-- LEGEND AI PostgreSQL Production Database Schema
-- Tracks movie projects, automatic ML annotations, timeline sequences, and rendering pipelines.

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    video_url TEXT,
    duration INTEGER DEFAULT 0, -- in seconds
    status VARCHAR(50) NOT NULL DEFAULT 'created', -- created, analyzed, scripted, voiced, rendered
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scenes (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    start_time NUMERIC(10, 2) NOT NULL, -- in seconds
    end_time NUMERIC(10, 2) NOT NULL,
    description TEXT,
    visual_summary TEXT,
    detected_objects TEXT[], -- array of visual object labels
    emotion VARCHAR(100),
    thumbnail_url TEXT
);

CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    role TEXT,
    confidence NUMERIC(4, 3), -- confidence score (e.g. 0.985)
    appearances_count INTEGER DEFAULT 0,
    avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS script_lines (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    scene_id VARCHAR(50) REFERENCES scenes(id) ON DELETE SET NULL,
    timestamp NUMERIC(10, 2) NOT NULL,
    duration NUMERIC(10, 2) NOT NULL,
    text TEXT NOT NULL,
    audio_url TEXT -- Base64 WAV or hosted URL
);

CREATE TABLE IF NOT EXISTS audio_settings (
    project_id VARCHAR(50) PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    bg_music_genre VARCHAR(50) DEFAULT 'suspense',
    bg_music_volume NUMERIC(3, 2) DEFAULT 0.25,
    voice_volume NUMERIC(3, 2) DEFAULT 0.85,
    auto_ducking BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS timeline_settings (
    project_id VARCHAR(50) PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    caption_style VARCHAR(50) DEFAULT 'neon',
    word_highlight BOOLEAN DEFAULT TRUE,
    zoom_effects_enabled BOOLEAN DEFAULT TRUE,
    transitions_enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS exports (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    format VARCHAR(10) DEFAULT 'mp4',
    aspect_ratio VARCHAR(20) DEFAULT 'landscape',
    resolution VARCHAR(10) DEFAULT '1080p',
    status VARCHAR(50) DEFAULT 'queued', -- queued, rendering, completed, failed
    download_url TEXT,
    render_logs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_modtime
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
