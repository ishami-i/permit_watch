"""
Supervisor lookup by administrative district.
"""
import json
from pathlib import Path

_ROOT_DIR = Path(__file__).resolve().parent.parent
_SUPERVISOR_FILE = _ROOT_DIR / "sample_data" / "supervisors.json"

with open(_SUPERVISOR_FILE, "r", encoding="utf-8") as _file:
    _SUPERVISORS = json.load(_file)


def assign_supervisor(district):
    """
    Return the supervisor record responsible for the given district,
    or None if no supervisor covers it.
    """
    for supervisor in _SUPERVISORS:
        if supervisor["district"] == district:
            return supervisor
    return None


if __name__ == "__main__":
    for _district in ["Gasabo", "Huye", "Nonexistent District"]:
        print(f"{_district}: {assign_supervisor(_district)}")