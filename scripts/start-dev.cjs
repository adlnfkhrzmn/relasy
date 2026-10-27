/**
 * Menjalankan server Next.js beserta server PostgreSQL lokal secara otomatis.
 *
 * Bila port 55432 belum aktif, skrip ini akan menyalakan `local-pg-server.cjs`
 * terlebih dahulu sehingga pengembang lokal tidak perlu membuka 2 terminal.
 */

const net = require("node:net");
const { spawn } = require("node:child_process");
const path = require("node:path");

function isPortOpen(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function main() {
  const isPgOpen = await isPortOpen(55432);
  let pgProcess = null;

  if (!isPgOpen) {
    console.log("[Relasy dev] Menjalankan server PostgreSQL lokal (port 55432)...");
    pgProcess = spawn(process.execPath, [path.join(__dirname, "local-pg-server.cjs")], {
      stdio: "inherit",
    });

    let retries = 20;
    while (retries-- > 0) {
      await new Promise((r) => setTimeout(r, 250));
      if (await isPortOpen(55432)) break;
    }
  }

  const nextCmd = process.platform === "win32" ? "npx.cmd" : "npx";
  const nextProcess = spawn(nextCmd, ["next", "dev", "-p", "3005"], {
    stdio: "inherit",
    shell: true,
  });

  const cleanup = () => {
    if (nextProcess && !nextProcess.killed) nextProcess.kill();
    if (pgProcess && !pgProcess.killed) pgProcess.kill();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  nextProcess.on("exit", (code) => {
    if (pgProcess && !pgProcess.killed) pgProcess.kill();
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error("[Relasy dev] Gagal memulai:", err);
  process.exit(1);
});
