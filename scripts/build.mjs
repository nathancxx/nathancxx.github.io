import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const regenerateArgs = args.includes("--regenerate") ? ["--regenerate"] : [];

await run("node", ["scripts/import-magic-directory.mjs"]);
await run("npm", ["run", "social-copy", "--", ...regenerateArgs]);
await run("npm", ["run", "validate"]);
await run("npm", ["exec", "astro", "--", "build"], {
  ASTRO_TELEMETRY_DISABLED: "1"
});

function run(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: {
        ...process.env,
        ...env
      }
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}
