import json, time
from db.redis_client import redis_client
from db.session import SessionLocal

from models.inference_log import InferenceLog

QUEUE_NAME = "inference_logs"

def start_worker():
    print("ingestion worker started..")

    while True:
        db = None
        data = None
        should_requeue = False

        try:
            _, data = redis_client.blpop(QUEUE_NAME)

            payload = json.loads(data)
            should_requeue = True

            db = SessionLocal()
            log = InferenceLog(**payload)

            db.add(log)
            db.commit()
            should_requeue = False
        
        except Exception as e:
            if db:
                db.rollback()

            if data and should_requeue:
                redis_client.rpush(QUEUE_NAME, data)

            print("worker error", e)

            time.sleep(1)

        finally:
            if db:
                db.close()
