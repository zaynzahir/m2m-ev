import { rmSync } from "node:fs";

for (const name of ["node_modules", ".next"]) {
  try {
    rmSync(name, { recursive: true, force: true });
  } catch {
    // ignore missing paths / race with sync clients
  }
}
