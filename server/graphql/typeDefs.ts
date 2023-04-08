import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { print } from "graphql";
import fs from "fs";

const typesArray = loadFilesSync(path.join(__dirname, "types/**/*.graphql"), {
  recursive: true,
});

const typeDefs = mergeTypeDefs(typesArray);
const printedTypeDefs = print(typeDefs);
fs.writeFileSync("joined.graphql", printedTypeDefs);

export { typeDefs };
