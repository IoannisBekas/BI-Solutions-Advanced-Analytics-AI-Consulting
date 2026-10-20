import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import {
  aiLearningProducts,
  learningLanguages,
} from "../shared/aiLearningProducts";

const sourceArgument = process.argv[2];
if (!sourceArgument) {
  throw new Error('Usage: npm run ai-learning:prepare -- "path/to/output/pdf"');
}

const sourceDirectory = path.resolve(sourceArgument);
const destinationDirectory = path.resolve(
  process.env.AI_LEARNING_PDF_DIR ||
    path.join(process.env.DATA_DIR || "data", "ai-learning-pdfs"),
);
if (sourceDirectory === destinationDirectory) {
  throw new Error(
    "Choose a private destination different from the source directory.",
  );
}

const files = aiLearningProducts.flatMap((product) =>
  learningLanguages.map((language) => {
    const directory = language === "el" ? "Greek" : "English";
    return {
      source: path.join(
        sourceDirectory,
        directory,
        product.filenames[language],
      ),
      destination: path.join(
        destinationDirectory,
        directory,
        product.filenames[language],
      ),
    };
  }),
);

// Check the complete curated collection before copying any files.
for (const file of files) {
  const info = await stat(file.source);
  if (!info.isFile() || info.size === 0) {
    throw new Error(`Missing or empty product: ${path.basename(file.source)}`);
  }
}
for (const file of files) {
  await mkdir(path.dirname(file.destination), { recursive: true });
  await copyFile(file.source, file.destination);
}
console.log(`Prepared ${files.length} product PDFs in ${destinationDirectory}`);
