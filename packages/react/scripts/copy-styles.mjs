import { copyFile, mkdir } from "node:fs/promises";
for (const name of ["styles", "thread", "disclosure", "cards"])
  await copyFile(
    new URL(`../src/${name}.css`, import.meta.url),
    new URL(`../dist/${name}.css`, import.meta.url),
  );
await mkdir(new URL("../dist/app/", import.meta.url), { recursive: true });
for (const name of ["app", "tokens", "components"])
  await copyFile(
    new URL(`../src/app/${name}.css`, import.meta.url),
    new URL(`../dist/app/${name}.css`, import.meta.url),
  );
