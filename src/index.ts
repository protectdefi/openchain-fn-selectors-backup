import * as fs from "fs-extra";
import * as path from "path";

// Configuration
const SOURCE_FILE = path.join(__dirname, "../db/db.txt");
const OUTPUT_DIR = path.join(__dirname, "../data");
const MAX_CHUNK_SIZE = 95 * 1024 * 1024; // 95MB in bytes
const OUTPUT_PREFIX = "chunk_";

async function splitFile() {
  try {
    // Check if source file exists
    if (!(await fs.pathExists(SOURCE_FILE))) {
      console.error(`Source file not found: ${SOURCE_FILE}`);
      process.exit(1);
    }

    // Ensure output directory exists
    await fs.ensureDir(OUTPUT_DIR);

    // Get file stats
    const stats = await fs.stat(SOURCE_FILE);
    console.log(
      `Source file size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`
    );

    // Calculate number of chunks needed
    const numChunks = Math.ceil(stats.size / MAX_CHUNK_SIZE);
    console.log(
      `Splitting into ${numChunks} chunks of max ${
        MAX_CHUNK_SIZE / (1024 * 1024)
      } MB each`
    );

    // Open source file for reading
    const sourceStream = fs.createReadStream(SOURCE_FILE);

    // Buffer for reading data
    let buffer = Buffer.alloc(0);
    let chunkIndex = 0;
    let bytesWritten = 0;
    let outputStream: fs.WriteStream | null = null;

    // Process the file in chunks
    sourceStream.on("data", (chunk: string | Buffer) => {
      // Convert chunk to Buffer if it's a string
      const chunkBuffer =
        typeof chunk === "string" ? Buffer.from(chunk) : chunk;
      // Append new data to buffer
      buffer = Buffer.concat([buffer, chunkBuffer]);

      // Process buffer while it has enough data for a chunk
      while (buffer.length > 0) {
        // If no output stream is open, create one
        if (!outputStream) {
          // Format chunk number with leading zeros (01, 02, etc.)
          const chunkNumber = String(chunkIndex + 1).padStart(2, "0");
          const outputPath = path.join(
            OUTPUT_DIR,
            `${OUTPUT_PREFIX}${chunkNumber}.txt`
          );
          outputStream = fs.createWriteStream(outputPath);
          bytesWritten = 0;
          console.log(`Creating chunk file: ${outputPath}`);
        }

        // Calculate how much data to write
        const bytesToWrite = Math.min(
          buffer.length,
          MAX_CHUNK_SIZE - bytesWritten
        );

        // If we can't write any more data to this chunk, close it and continue
        if (bytesToWrite <= 0) {
          outputStream.end();
          outputStream = null;
          chunkIndex++;
          continue;
        }

        // Write data to output stream
        const dataToWrite = buffer.slice(0, bytesToWrite);
        outputStream.write(dataToWrite);

        // Update buffer and bytesWritten
        buffer = buffer.slice(bytesToWrite);
        bytesWritten += bytesToWrite;

        // If this chunk is full, close it and prepare for next chunk
        if (bytesWritten >= MAX_CHUNK_SIZE) {
          outputStream.end();
          outputStream = null;
          chunkIndex++;
        }
      }
    });

    // Handle end of source file
    sourceStream.on("end", () => {
      if (outputStream) {
        outputStream.end();
      }
      console.log(`Splitting complete. Created ${chunkIndex + 1} chunks.`);
    });

    // Handle errors
    sourceStream.on("error", (err: Error) => {
      console.error("Error reading source file:", err);
      if (outputStream) {
        outputStream.end();
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Run the script
splitFile();
