#!/bin/sh
set -e

python scripts/wait_for_services.py

exec python run_worker.py
