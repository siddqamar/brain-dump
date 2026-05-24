# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added Gemma summary provider config via Google AI Studio API.
- Added optional Gemini embeddings provider with configurable model.
- Added Whisper-based audio and video transcription ingestion support.
- Added `search_min_score` backend setting to filter low-confidence results.
- Added configurable `BRAIN_TESSERACT_CMD` setting for image OCR runtime path resolution.
- Added root `CHANGELOG.md` for standardized release notes.

### Changed
- Switched summary generation path to Gemma API using `google.generativeai`.
- Expanded file ingestion support for project/code files, audio, and video formats.
- Updated frontend upload accept list and copy to reflect broader file support.
- Updated backend and root documentation for `backend/app/.env` configuration.
- Installed Tesseract OCR engine on Windows host (`tesseract v5.4.0.20240606`) and aligned backend docs/env examples.

### Fixed
- Improved semantic search quality by separating query/document embedding tasks when Gemini embeddings are enabled (`retrieval_query` vs `retrieval_document`).
- Fixed chunk overlap logic so chunk boundaries preserve context instead of skipping overlap.
- Reduced noisy search results by enforcing a configurable minimum match score threshold.
- Fixed image OCR discovery when `tesseract.exe` is not on PATH by using explicit configured executable path.
