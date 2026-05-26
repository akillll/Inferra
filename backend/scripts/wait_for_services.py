import os
import time

from redis import Redis
from sqlalchemy import create_engine, text


DATABASE_URL = os.environ["DATABASE_URL"]
REDIS_URL = os.environ["REDIS_URL"]
MAX_ATTEMPTS = int(os.getenv("STARTUP_MAX_ATTEMPTS", "60"))
WAIT_SECONDS = float(os.getenv("STARTUP_WAIT_SECONDS", "1"))


def wait_for_postgres() -> None:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            with engine.connect() as connection:
                connection.execute(text("select 1"))
            return
        except Exception as exc:
            if attempt == MAX_ATTEMPTS:
                raise RuntimeError("PostgreSQL did not become ready") from exc
            time.sleep(WAIT_SECONDS)


def wait_for_redis() -> None:
    client = Redis.from_url(REDIS_URL)

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            client.ping()
            return
        except Exception as exc:
            if attempt == MAX_ATTEMPTS:
                raise RuntimeError("Redis did not become ready") from exc
            time.sleep(WAIT_SECONDS)


if __name__ == "__main__":
    wait_for_postgres()
    wait_for_redis()
