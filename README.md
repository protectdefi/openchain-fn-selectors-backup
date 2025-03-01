# Openchain fn selectors DB backup

Sourced from: https://api.openchain.xyz/signature-database/v1/export

Docs: https://docs.openchain.xyz/

## File Splitting

The database file (`db/db.txt`) exceeds GitHub's file size limit of 100MB. To work around this limitation, this repository includes a TypeScript script that splits the file into smaller chunks of 95MB each.

### Usage

1. Install dependencies:

   ```
   pnpm install
   ```

2. Download the db from openchain's API into `db/db.txt`.

3. Run the script to split the file:
   ```
   pnpm start
   ```

The script will create multiple chunk files in the `data` directory with the naming pattern `chunk_01.txt`, `chunk_02.txt`, etc.

### Note

The original `db/db.txt` file is excluded from version control via `.gitignore`. If you need the complete file, you can either:

- Download it directly from the source URL
- Concatenate all the chunk files using a tool like `cat` (Unix) or `copy` (Windows)
