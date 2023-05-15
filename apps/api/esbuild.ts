import esbuild from "esbuild";
import fs from "fs-extra";
fs.copy("../../node_modules/swagger-ui-dist", "dist", err => {
  if (err) {
    console.error("Une erreur est survenue lors de la copie des fichiers :", err);
  } else {
    console.log("Les fichiers ont été copiés avec succès !");
  }
});
esbuild
  .build({
    entryPoints: ["src/server.ts"],
    bundle: true,
    sourcemap: true,
    minify: true,
    platform: "node",
    target: "node16",
    outfile: "dist/server.js",
  })
  .catch(() => process.exit(1));
