import esbuild from "esbuild";
import fs from "fs-extra";

// swagger-ui-express est mal foutu du coup le bundler arrive pas à trouver les fichiers
// donc on les copie dans le dossier dist


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
