import { getDatabase } from "../client";
import { DEFAULT_FOLLOWUP_TEMPLATE, FOLLOWUP_TEMPLATE_PRESETS } from "@/lib/followup-template";

export interface FollowupTemplateConfig {
  workspace_id: string;
  is_enabled: boolean;
  active_preset: string;
  template_text: string;
  updated_at: string;
}

function ensureTableExists() {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS followup_templates (
      workspace_id TEXT PRIMARY KEY,
      is_enabled INTEGER NOT NULL DEFAULT 1,
      active_preset TEXT NOT NULL DEFAULT 'eksekutif_ramah',
      template_text TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );
  `);
}

export function getFollowupTemplateConfig(workspaceId: string): FollowupTemplateConfig {
  ensureTableExists();
  const db = getDatabase();
  const row = db
    .prepare("SELECT * FROM followup_templates WHERE workspace_id = ?")
    .get(workspaceId) as any;

  if (!row) {
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO followup_templates (workspace_id, is_enabled, active_preset, template_text, updated_at)
       VALUES (?, 1, 'eksekutif_ramah', ?, ?)`
    ).run(workspaceId, DEFAULT_FOLLOWUP_TEMPLATE, now);

    return {
      workspace_id: workspaceId,
      is_enabled: true,
      active_preset: "eksekutif_ramah",
      template_text: DEFAULT_FOLLOWUP_TEMPLATE,
      updated_at: now,
    };
  }

  return {
    workspace_id: row.workspace_id,
    is_enabled: Boolean(row.is_enabled),
    active_preset: row.active_preset || "eksekutif_ramah",
    template_text: row.template_text || DEFAULT_FOLLOWUP_TEMPLATE,
    updated_at: row.updated_at,
  };
}

export function updateFollowupTemplateConfig(
  workspaceId: string,
  input: {
    isEnabled?: boolean;
    activePreset?: string;
    templateText?: string;
  }
): FollowupTemplateConfig {
  const current = getFollowupTemplateConfig(workspaceId);
  const db = getDatabase();
  const now = new Date().toISOString();

  const isEnabled = input.isEnabled !== undefined ? input.isEnabled : current.is_enabled;
  const activePreset = input.activePreset !== undefined ? input.activePreset : current.active_preset;

  let templateText =
    input.templateText !== undefined ? input.templateText.trim() : current.template_text;

  if (!templateText) {
    const matchedPreset = FOLLOWUP_TEMPLATE_PRESETS.find((p) => p.id === activePreset);
    templateText = matchedPreset ? matchedPreset.template : DEFAULT_FOLLOWUP_TEMPLATE;
  }

  db.prepare(
    `UPDATE followup_templates
     SET is_enabled = ?, active_preset = ?, template_text = ?, updated_at = ?
     WHERE workspace_id = ?`
  ).run(isEnabled ? 1 : 0, activePreset, templateText, now, workspaceId);

  return getFollowupTemplateConfig(workspaceId);
}
