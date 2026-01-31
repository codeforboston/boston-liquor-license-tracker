import logging
from typing import Any

from app.pipeline.run_result import RunResult
from app.state.kv_store import KVStore

logger = logging.getLogger(__name__)


class Pipeline:
    """
    Manages a sequence of processing steps.
    Each step is expected to have a 'run' method that returns a RunResult.
    If a step's RunResult.proceed is False, the pipeline stops.
    """

    def __init__(self, kv_store: KVStore, steps: list[Any]):
        self.kv_store = kv_store
        self.steps = steps

    def run(self) -> RunResult:
        """Runs all steps in sequence."""
        for step in self.steps:
            step_name = step.__class__.__name__
            # logger.info(f"Running pipeline step: {step_name}...")

            try:
                result = step.run()
                if not result.proceed:
                    logger.warning(
                        f"Pipeline stopped after {step_name}: {result.reason}"
                    )
                    return result
            except Exception as e:
                logger.error(f"Pipeline failed at step {step_name}: {e}")
                return RunResult(proceed=False, reason=str(e))

        return RunResult()
