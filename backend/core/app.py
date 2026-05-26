from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import get_settings
from routes.health import router as health_router
from routes.chat import router as chat_router
from routes.ingestion import router as ingestion_router
from routes.metrics import router as metrics_router
from utils.rate_limit import rate_limit_middleware

def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.project_name,
        version=settings.api_version,
        debug=settings.debug,
    )

    app.middleware("http") (
        rate_limit_middleware
    )
    
    app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    )


    app.include_router(health_router)
    app.include_router(chat_router)
    app.include_router(ingestion_router)
    app.include_router(metrics_router)

    return app
