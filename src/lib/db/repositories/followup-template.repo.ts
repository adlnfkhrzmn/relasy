import { getDriver, ensureSchema } from "../client";
import { DEFAULT_FOLLOWUP_TEMPLATE, FOLLOWUP_TEMPLATE_PRESETS } from "@/lib/followup-template";

export interface FollowupTemplateConfig {
  workspace_id: string;
  is_enabled: boolean;
  active_preset: string;
  template_text: string;
  updated_at: string;
}

interface FollowupTemplateRow {
  workspace_id: string;
  is_enabled: boolean;
  active_preset: string;
  template_text: string;
  updated_at: string;
}

export async function getFollowupTemplateConfig(
  workspaceId: string
): Promise<FollowupTemplateConfig> {
  await ensureSchema();
  const db = getDriver();

  const rows = await db.query<FollowupTemplateRow>(
    "SELECT * FROM followup_templates WHERE workspace_id = $1",
    [workspaceId]
  );
  const row = rows[0];

  if (!row) {
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO followup_templates (workspace_id, is_enabled, active_preset, template_text, updated_at)
       VALUES ($1, TRUE, 'eksekutif_ramah', $2, $3)
       ON CONFLICT (workspace_id) DO NOTHING`,
      [workspaceId, DEFAULT_FOLLOWUP_TEMPLATE, now]
    );

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

export async function updateFollowupTemplateConfig(
  workspaceId: string,
  input: {
    isEnabled?: boolean;
    activePreset?: string;
    templateText?: string;
  }
): Promise<FollowupTemplateConfig> {
  const current = await getFollowupTemplateConfig(workspaceId);
  const db = getDriver();
  const now = new Date().toISOString();

  const isEnabled = input.isEnabled !== undefined ? input.isEnabled : current.is_enabled;
  const activePreset = input.activePreset !== undefined ? input.activePreset : current.active_preset;

  let templateText =
    input.templateText !== undefined ? input.templateText.trim() : current.template_text;

  if (!templateText) {
    const matchedPreset = FOLLOWUP_TEMPLATE_PRESETS.find((p) => p.id === activePreset);
    templateText = matchedPreset ? matchedPreset.template : DEFAULT_FOLLOWUP_TEMPLATE;
  }

  await db.execute(
    `UPDATE followup_templates
     SET is_enabled = $1, active_preset = $2, template_text = $3, updated_at = $4
     WHERE workspace_id = $5`,
    [isEnabled, activePreset, templateText, now, workspaceId]
  );

  return getFollowupTemplateConfig(workspaceId);
}
