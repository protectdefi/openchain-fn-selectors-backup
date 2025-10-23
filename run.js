
const fs = require('fs');
const path = require('path');

const inputFiles = [
  '/root/openchain-fn-selectors-backup/data/chunk_01.txt',
  '/root/openchain-fn-selectors-backup/data/chunk_02.txt',
  '/root/openchain-fn-selectors-backup/data/chunk_03.txt'
];

const outputFile = '/root/signature-database.json';

async function mergeFiles() {
  let combinedData = '';

  for (const filePath of inputFiles) {
    try {
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      combinedData += fileContent + '\n';  // Append content with a newline separator

    } catch (error) {
      console.error(`Error reading ${filePath}:`, error.message);
    }
  }

  try {
    fs.writeFileSync(outputFile, combinedData, 'utf8');
    console.log(`Successfully merged files into ${outputFile}`);
  } catch (error) {
    console.error('Error writing output file:', error.message);
  }
}

mergeFiles();
