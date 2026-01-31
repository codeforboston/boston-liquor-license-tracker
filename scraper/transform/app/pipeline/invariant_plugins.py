import importlib
import inspect
import logging
import pkgutil

from app import constants as const
from app.pipeline.run_result import RunResult
from app.state.kv_store import KVStore
from app.violation_plugins.base import Plugin

logger = logging.getLogger(__name__)


class InvariantPluginStep:
    """Runs invariant plugins."""

    def __init__(self, kv_store: KVStore, stage: str):
        self.plugins = self._load_plugins(stage)
        self.kv_store = kv_store
        self.file_path = self.kv_store.get(const.PDF_FILE_PATH)
        if not self.file_path:
            raise ValueError("PDF file path not provided")

    def run(self):
        # logger.info("Starting text extraction process...")
        self._run_plugins()
        # logger.info("Text extraction process completed.")
        return RunResult()

    def _load_plugins(self, stage: str):
        plugin_instances = []

        stage_pkg = f"app.violation_plugins.{stage.lower()}"
        stage_module = importlib.import_module(stage_pkg)

        # iterate over modules inside the stage subpackage
        for _, module_name, _ in pkgutil.iter_modules(stage_module.__path__):
            module = importlib.import_module(f"{stage_pkg}.{module_name}")

            for _, obj in inspect.getmembers(module, inspect.isclass):
                if (
                    issubclass(obj, Plugin)
                    and obj is not Plugin
                    and not inspect.isabstract(obj)
                ):
                    plugin_instances.append(obj())

        # deterministic order by priority
        plugin_instances.sort(key=lambda p: getattr(p, "priority", 100))

        return plugin_instances

    def _run_plugins(self):
        for plugin in self.plugins:
            try:
                if plugin.query(self.kv_store):
                    # logger.info(f"→ Executing {plugin.__class__.__name__}")
                    plugin.run(self.kv_store)
                else:
                    pass
                    # logger.info(f"→ Skipping {plugin.__class__.__name__}")
            except Exception as e:
                # logger.error(f"✗ Plugin {plugin.__class__.__name__} failed: {e}")
                raise e
