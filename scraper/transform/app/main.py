import argparse
import json
import time
from pathlib import Path

from app import constants as const
from app.pipeline.extract_hearing import HearingTextExtractorStep
from app.pipeline.extract_license_text import LicenseTextExtractorStep
from app.pipeline.extract_pdf_text import PDFTextExtractorStep
from app.pipeline.extract_text_json import TextJsonExtractorStep
from app.pipeline.invariant_plugins import InvariantPluginStep
from app.pipeline.pipeline import Pipeline
from app.state.kv_store import KVStore
from app.utils.logger import setup_logging


def run_pipeline(pdf_file_path: str, kv_store: KVStore | None = None):
    logger = setup_logging(__name__)
    if not pdf_file_path:
        raise ValueError("PDF file path is required")

    store = kv_store or KVStore()
    store.set(const.PDF_FILE_PATH, pdf_file_path)

    pipeline = Pipeline(
        store,
        [
            PDFTextExtractorStep(store),
            InvariantPluginStep(store, "POST_TEXT"),
            HearingTextExtractorStep(store),
            InvariantPluginStep(store, "POST_HEARING"),
            LicenseTextExtractorStep(store),
            InvariantPluginStep(store, "POST_LICENSE"),
            TextJsonExtractorStep(store),
        ],
    )

    result = pipeline.run()

    if result.proceed:
        return store.get(const.LICENSE_JSON_DATA, [])
    else:
        logger.error(f"Pipeline failed for {pdf_file_path}: {result.reason}")
        return []


def main():
    parser = argparse.ArgumentParser(
        description="Boston Licensing Board PDF to JSON Pipeline"
    )
    parser.add_argument(
        "--input_dir", required=True, help="Directory containing PDF files to process"
    )
    parser.add_argument(
        "--output_dir", required=True, help="Directory to save output JSON files"
    )

    args = parser.parse_args()
    logger = setup_logging(__name__)

    logger.info("Starting Licensing Board Transform Pipeline")
    start_time = time.perf_counter()

    try:
        input_path = Path(args.input_dir)
        output_path = Path(args.output_dir)

        if not input_path.exists():
            logger.error(f"Input directory not found: {args.input_dir}")
            return

        output_path.mkdir(parents=True, exist_ok=True)

        pdf_files = list(input_path.glob("*.pdf"))
        logger.info(f"Found {len(pdf_files)} PDF files in {args.input_dir}")

        for index, pdf_file in enumerate(pdf_files, 1):
            logger.info(f"[{index}/{len(pdf_files)}] Processing: {pdf_file.name}")
            try:
                results = run_pipeline(str(pdf_file))
                output_file = output_path / f"{pdf_file.stem}.json"
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(results, f, indent=2, ensure_ascii=False)
                logger.info(f"Saved results to {output_file.name}")
            except Exception as e:
                logger.error(f"Failed to process {pdf_file.name}: {e}")

        logger.info("Application finished successfully.")
    finally:
        elapsed = time.perf_counter() - start_time
        minutes, seconds = divmod(elapsed, 60)
        logger.info("Total runtime: %d minutes %.2f seconds", int(minutes), seconds)


if __name__ == "__main__":
    main()
