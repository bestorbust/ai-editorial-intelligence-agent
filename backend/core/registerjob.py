from backend.core.scheduler import scheduler
from backend.core.jobs import refresh_pipeline

scheduler.add_job(
    refresh_pipeline,
    "interval",
    minutes=30,
    id="pipeline_refresh",
    replace_existing=True,
)