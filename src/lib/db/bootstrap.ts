import { getDatabase } from "./client";
import { createWorkspace } from "./repositories/workspace.repo";
import { createUser, getUserByEmail } from "./repositories/user.repo";
import { hashPassword } from "../auth/password";

export async function ensureDefaultAccount(): Promise<{
  workspaceId: string;
  userId: string;
  email: string;
}> {
  const db = getDatabase();
  const existingUser = getUserByEmail("pemilik@usaha.id");
  if (existingUser) {
    return {
      workspaceId: existingUser.workspace_id,
      userId: existingUser.id,
      email: existingUser.email,
    };
  }

  // Create initial workspace
  const workspace = createWorkspace("Usaha Saya");

  // Create default owner account
  const passwordHash = await hashPassword("relasy123");
  const user = createUser({
    workspaceId: workspace.id,
    name: "Pemilik Usaha",
    email: "pemilik@usaha.id",
    passwordHash,
  });

  // Link workspace owner_id
  db.prepare("UPDATE workspaces SET owner_id = ? WHERE id = ?").run(user.id, workspace.id);

  return {
    workspaceId: workspace.id,
    userId: user.id,
    email: user.email,
  };
}
