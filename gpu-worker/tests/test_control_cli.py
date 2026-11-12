"""Control script must refuse foreign resources and never print DB credentials."""

import json
import runpy
from pathlib import Path
from types import SimpleNamespace
import pytest


@pytest.fixture
def ctl(tmp_path, monkeypatch):
    monkeypatch.setenv("HOME", str(tmp_path))
    root = Path(__file__).resolve().parents[2]
    module = runpy.run_path(
        str(root / "scripts/objectscanctl"), run_name="test_control"
    )
    return module["main"].__globals__


def test_rejects_unit_from_another_checkout(ctl, monkeypatch, tmp_path):
    unit = tmp_path / "foreign.service"
    unit.write_text("WorkingDirectory=/another/project\nExecStart=/another/worker\n")
    monkeypatch.setitem(
        ctl, "properties", lambda: {"LoadState": "loaded", "FragmentPath": str(unit)}
    )
    with pytest.raises(RuntimeError, match="different checkout"):
        ctl["unit_checked"]()


def test_drain_timeout_never_forces_stop(ctl, monkeypatch, tmp_path):
    calls = []
    monkeypatch.setitem(
        ctl, "unit_checked", lambda: {"ActiveState": "active", "MainPID": "123"}
    )
    monkeypatch.setitem(ctl, "worker_root", lambda: tmp_path)
    monkeypatch.setitem(ctl, "run", lambda *args, **kwargs: calls.append(args))
    with pytest.raises(RuntimeError, match="No forced stop"):
        ctl["worker"]("stop", 0)
    assert (tmp_path / "drain.request").exists()
    assert calls == []


def test_foreign_managed_pid_is_not_killed(ctl, monkeypatch):
    import os

    meta = ctl["STATE"] / "web.json"
    meta.write_text(json.dumps({"pid": os.getpid(), "root": "/another/project"}))
    calls = []
    monkeypatch.setattr(os, "killpg", lambda *args: calls.append(args))
    with pytest.raises(RuntimeError, match="identity changed"):
        ctl["web"]("stop")
    assert calls == []
    assert meta.exists()


def test_db_output_does_not_leak_credentials(ctl, monkeypatch, capsys):
    import sys

    monkeypatch.setattr(sys, "argv", ["objectscanctl", "start", "db"])
    monkeypatch.setitem(
        ctl,
        "run",
        lambda *args, **kwargs: SimpleNamespace(stdout="SECRET_SENTINEL", returncode=0),
    )
    ctl["main"]()
    assert "SECRET_SENTINEL" not in capsys.readouterr().out
