import json, time
from db.redis_client import redis_client
from db.session import SessionLocal

from models.inference_log import InferenceLog

QUEUE_NAME = "inference_logs"

def start_worker():
    print("ingestion worker started..")

    while True:
        try:
            _, data = redis_client.blpop(QUEUE_NAME)

            payload = json.loads(data)

            db = SessionLocal()
            log = InferenceLog(**payload)

            db.add()
            db.commit()
            db.close()
        
        except Exception as e:
            print("worker error", e)

            time.sleep(1)

