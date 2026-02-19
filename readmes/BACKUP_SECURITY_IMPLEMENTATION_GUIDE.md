# Backup Security Implementation Guide

## What backup security is

Backup security means your backups are:
1. Created regularly.
2. Encrypted.
3. Stored offsite (separate failure domain).
4. Restorable (tested with drill restores).

For your rubric row:
- `Encrypted` = backup exists and is encrypted.
- `Encrypted + offsite` = encrypted backup + copied to offsite storage + restore test evidence.

## What to implement in your current system

Your stack is Django + MongoDB Atlas. Use two layers:
1. Atlas backup controls (platform snapshots / point-in-time where available).
2. App-run encrypted exports for offsite copies and restore drills.

## Implemented artifacts in this repo

- Encrypted backup script: `backend/scripts/create_encrypted_backup.py`
- Restore drill script: `backend/scripts/restore_encrypted_backup.py`
- Env vars template: `backend/.env.example`

## Required setup

In `backend/.env` set:

```env
MONGODB_URI=<your-atlas-uri>
MONGODB_NAME=capstone_db
BACKUP_ENCRYPTION_PASSPHRASE=<strong-random-passphrase>
BACKUP_OUTPUT_DIR=./backups
BACKUP_RETENTION_DAYS=14
BACKUP_OFFSITE_RCLONE_REMOTE=<optional, e.g. gdrive:msme-pathways-backups>
BACKUP_RESTORE_DB_NAME=capstone_db_restore_test
```

Notes:
- `BACKUP_OFFSITE_RCLONE_REMOTE` is optional but required for `Encrypted + offsite`.
- If using offsite copy, configure `rclone` remote first.
- Scripts auto-load `backend/.env` (no manual `export` required).

### Generate a backup passphrase

```bash
openssl rand -base64 48
```

## Tool prerequisites

Your machine must have these binaries:
- `mongodump` (MongoDB Database Tools)
- `mongorestore` (MongoDB Database Tools)
- `openssl`
- `rclone` (only if using offsite copy)

### Install on macOS (Homebrew)

```bash
brew tap mongodb/brew
 ```

Verify:

```bash
which mongodump
which mongorestore
mongodump --version
mongorestore --version
```

If `which mongodump` is empty, add Homebrew to PATH:

```bash
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Run backup

From `backend/`:

```bash
python scripts/create_encrypted_backup.py
```

This script:
- runs `mongodump --archive --gzip`,
- encrypts output using OpenSSL AES-256 + PBKDF2,
- optionally copies encrypted file offsite via `rclone`,
- applies retention cleanup.

Common failure:
- `Required binary not found in PATH: mongodump`
  - Install `mongodb-database-tools` and verify PATH using commands above.

## Run restore drill (proof your backups work)

From `backend/`:

```bash
python scripts/restore_encrypted_backup.py /absolute/path/to/backup.archive.gz.enc
```

This restores into `BACKUP_RESTORE_DB_NAME` (default `capstone_db_restore_test`) so production DB is not overwritten.

If you get:
- `Backup file not found: /absolute/path/to/backup.archive.gz.enc`

Use a real file path:

```bash
ls -lah backups
python scripts/restore_encrypted_backup.py "$(pwd)/backups/<real-file>.archive.gz.enc"
```

Example (your file):

```bash
python scripts/restore_encrypted_backup.py "$(pwd)/backups/capstone_db_20260219T234747Z.archive.gz.enc"
```

## Testing methods and evidence

### 1) Backup creation test
- Run backup script.
- Expected: `.archive.gz.enc` file created in `BACKUP_OUTPUT_DIR`.
- Evidence: terminal output + file listing.

### 2) Encryption evidence test
- Ensure backup file extension is `.enc`.
- Attempt to open file as plaintext should fail (binary/ciphertext).
- Evidence: command output showing encrypted archive.

### 3) Offsite replication test
- Configure `BACKUP_OFFSITE_RCLONE_REMOTE`.
- Run backup script.
- Expected: offsite copy success message from script.
- Evidence: remote object listing / screenshot from offsite provider.

### 4) Restore drill test
- Run restore script into restore DB.
- Validate sample counts from restore DB match expected records.
- Evidence: restore logs + query counts.

### 5) Recovery objective test (recommended)
- Measure restore time (RTO) and data point freshness (RPO).
- Evidence: runbook log with timestamp, duration, and findings.

## Suggested cadence

- Backup: daily (or every 6-12 hours for stricter RPO).
- Offsite copy: every backup run.
- Restore drill: monthly minimum.
- Retention: 14-30 days minimum depending on policy.

## When to update your Category 3 rating

Use:
- `☑ Encrypted` when encrypted backups run and are verified locally.
- `☑ Encrypted + offsite` only after offsite copy and successful restore drill evidence are documented.
