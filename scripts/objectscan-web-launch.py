"""Dedicated process group for ObjectScan local web; no service secrets printed."""

import os
from pathlib import Path

root = Path(__file__).resolve().parents[1]
os.chdir(root / "apps/web")
os.environ["NEXT_PUBLIC_APP_URL"] = "http://127.0.0.1:3000"
os.execvp(
    "node",
    [
        "node",
        str(root / "node_modules/next/dist/bin/next"),
        "dev",
        "--hostname",
        "127.0.0.1",
        "--port",
        "3000",
    ],
)
