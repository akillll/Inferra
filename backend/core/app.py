from fastapi import FastAPI

from core.config import get_settings
from routes.health import router as health_router
from routes.chat import router as chat_router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.project_name,
        version=settings.api_version,
        debug=settings.debug,
    )

    app.include_router(health_router)
    app.include_router(chat_router)

    return app
