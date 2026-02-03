import argparse
import json
import logging
import os
import sys

from app.pipeline.pipeline import run_pipeline
from app.utils.logger import setup_logging


def main():
    logger = setup_logging(__name__)
    parser = argparse.ArgumentParser(
        description="Boston Licensing Board PDF to JSON Pipeline"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--file", help="Path to a single PDF file to process")
    group.add_argument(
        "--dir", help="Path to a directory containing PDF files to process"
    )

    parser.add_argument(
        "--output",
        default="all_licenses.json",
        help="Path to the output JSON file (default: all_licenses.json)",
    )

    args = parser.parse_args()

    all_results = []

    if args.file:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.info(f"Processing single file: {args.file}")
        from app.state.kv_store import KVStore

        store = KVStore()
        results = run_pipeline(args.file, kv_store=store)
        all_results.extend(results)
        logger.debug(f"Results: {results}")
        logger.debug(f"All results: {store.dump()}")

    elif args.dir:
        if not os.path.exists(args.dir):
            logger.error(f"Directory not found: {args.dir}")
            sys.exit(1)

        files = [f for f in os.listdir(args.dir) if f.endswith(".pdf")]
        logger.info(f"Found {len(files)} PDF files in {args.dir}")

        for index, filename in enumerate(files, 1):
            pdf_path = os.path.join(args.dir, filename)
            logger.info(f"[{index}/{len(files)}] Processing: {pdf_path}")
            try:
                results = run_pipeline(pdf_path)
                all_results.extend(results)
            except Exception as e:
                logger.error(f"Failed to process {pdf_path}: {e}")

    # Output results
    try:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(all_results, f, indent=2, ensure_ascii=False)
        logger.info(f"Successfully wrote {len(all_results)} licenses to {args.output}")

        # Generate stats report for directory runs
        if args.dir:
            from app.utils.licenses_to_excel import json_excel
            from app.utils.stats_report import process_data

            report_path = process_data(all_results)
            logger.info(f"Stats report generated at: {report_path}")
            json_excel(args.output, args.output.replace(".json", ".xlsx"))

    except Exception as e:
        logger.error(f"Failed to write output or generate report: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
