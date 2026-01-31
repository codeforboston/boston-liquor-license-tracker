import re
import json
import requests
from dataclasses import dataclass
from difflib import SequenceMatcher
from urllib.parse import urlencode

FEATURESERVER_ROOT = "https://gisportal.boston.gov/arcgis/rest/services/SAM/Live_SAM_Address/FeatureServer"
LAYER_ID = 0

# Field names from the schema
F_FULL_ADDRESS = "FULL_ADDRESS"
F_STREET_NUMBER = "STREET_NUMBER"
F_IS_RANGE = "IS_RANGE"
F_RANGE_FROM = "RANGE_FROM"
F_RANGE_TO = "RANGE_TO"
F_UNIT = "UNIT"
F_FULL_STREET_NAME = "FULL_STREET_NAME"
F_STREET_BODY = "STREET_BODY"
F_SUFFIX_ABBR = "STREET_SUFFIX_ABBR"
F_SUFFIX_FULL = "STREET_FULL_SUFFIX"
F_ZIP = "ZIP_CODE"
F_NEIGHBORHOOD = "MAILING_NEIGHBORHOOD"


# -----------------------------
# Utilities
# -----------------------------
def _norm(s: str) -> str:
    s = (s or "").upper().strip()
    s = re.sub(r"[.,]", " ", s)
    s = re.sub(r"\s+", " ", s)
    return s


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, _norm(a), _norm(b)).ratio()


def sql_escape(s: str) -> str:
    return (s or "").replace("'", "''")


def layer_url(root: str, layer_id: int) -> str:
    return f"{root}/{layer_id}"


def arcgis_query(root: str, layer_id: int, where: str, out_fields="*", return_geometry=True,
                result_record_count: int | None = None) -> dict:
    url = f"{layer_url(root, layer_id)}/query"
    params = {
        "f": "pjson",
        "where": where,
        "outFields": out_fields,
        "returnGeometry": "true" if return_geometry else "false",
    }
    if result_record_count is not None:
        params["resultRecordCount"] = result_record_count

    full_url = f"{url}?{urlencode(params)}"
    resp = requests.get(url, params=params, timeout=30)
    resp.raise_for_status()
    return {"request_url": full_url, "json": resp.json()}


# -----------------------------
# Parsing (simple; tailored to my input shape)
# -----------------------------
@dataclass
class ParsedAddress:
    raw: str
    number: str | None
    number_start: str | None
    number_end: str | None
    street_body: str | None
    street_type: str | None
    unit: str | None
    zip: str | None
    neighborhood: str | None


def parse_address(raw: str) -> ParsedAddress:
    s = raw.strip()

    parts = [p.strip() for p in s.split(",") if p.strip()]
    street_line = parts[0] if parts else s

    # neighborhood heuristic: second comma chunk if it’s not state/city
    neighborhood = None
    if len(parts) >= 2:
        cand = parts[1]
        if not re.fullmatch(r"MA", cand.strip(), flags=re.I) and cand.strip().upper() != "BOSTON":
            neighborhood = cand.strip()

    # ZIP
    mzip = re.search(r"\b(\d{5})(?:-\d{4})?\b", s)
    zip5 = mzip.group(1) if mzip else None

    # Unit
    unit = None
    munit = re.search(r"\b(?:APT|UNIT|STE|SUITE|FL|FLOOR|RM|ROOM)\s*([A-Z0-9\-]+)\b", s, re.I)
    if munit:
        unit = munit.group(0).strip()
    else:
        mhash = re.search(r"\s(#\s*[A-Z0-9\-]+)\b", s, re.I)
        if mhash:
            unit = mhash.group(1).strip()

    # number/range
    mnum = re.match(r"^\s*(\d+(?:-\d+)?)\s+(.*)$", street_line)
    number = None
    rest = street_line
    if mnum:
        number = mnum.group(1)
        rest = mnum.group(2)

    number_start = number_end = None
    if number and "-" in number:
        number_start, number_end = number.split("-", 1)
    elif number:
        number_start = number

    # type = last token
    tokens = rest.split()
    street_type = None
    street_body = rest.strip() or None
    if tokens:
        street_type = tokens[-1]
        street_body = " ".join(tokens[:-1]).strip() or None

    return ParsedAddress(
        raw=raw, number=number, number_start=number_start, number_end=number_end,
        street_body=street_body, street_type=street_type, unit=unit, zip=zip5,
        neighborhood=neighborhood
    )


# -----------------------------
# Where-clause builders using my field names
# -----------------------------
def where_street_full_exact(full_street: str) -> str:
    v = sql_escape(_norm(full_street))
    return f"UPPER({F_FULL_STREET_NAME}) = '{v}'"


def where_street_full_like(full_street: str) -> str:
    v = sql_escape(_norm(full_street))
    return f"UPPER({F_FULL_STREET_NAME}) LIKE '%{v}%'"


def where_street_body_exact(body: str) -> str:
    v = sql_escape(_norm(body))
    return f"UPPER({F_STREET_BODY}) = '{v}'"


def where_zip(zip5: str) -> str:
    v = sql_escape(zip5)
    return f"{F_ZIP} = '{v}'"


def where_neighborhood(nbhd: str) -> str:
    v = sql_escape(_norm(nbhd))
    return f"UPPER({F_NEIGHBORHOOD}) = '{v}'"


def where_unit(unit: str) -> str:
    v = sql_escape(_norm(unit))
    return f"UPPER({F_UNIT}) = '{v}'"


def where_number_exact(num: str) -> str:
    v = sql_escape(str(num))
    return f"{F_STREET_NUMBER} = '{v}'"


def where_range_exact(frm: str, to: str) -> str:
    v1 = sql_escape(str(frm))
    v2 = sql_escape(str(to))
    return f"({F_IS_RANGE} = 1 AND {F_RANGE_FROM} = '{v1}' AND {F_RANGE_TO} = '{v2}')"


def and_all(*clauses: str) -> str:
    clauses = [c for c in clauses if c and c.strip()]
    if not clauses:
        return "1=1"
    return "(" + " AND ".join(clauses) + ")"


# -----------------------------
# Strategy implementation
# -----------------------------
def implement_strategy(raw_address: str,
                       root: str = FEATURESERVER_ROOT,
                       layer_id: int = LAYER_ID,
                       min_similarity: float = 0.70) -> dict:
    """
    Strategy:
      1) Full structured-ish query
      2) Without unit
      3) Without zip
      4) If range, try both endpoints
      5) If street type missing/uncertain, try without type
      6) If still failing, query only street + Boston MA and similarity-filter
    Uses my layer's fields: FULL_ADDRESS, STREET_NUMBER, RANGE_FROM/TO, UNIT, FULL_STREET_NAME, STREET_BODY, ZIP_CODE.
    """
    p = parse_address(raw_address)

    tried = []           # request URLs
    tried_wheres = []    # where clauses (helpful for debugging)
    best_feature = None
    best_score = None

    def consider(features: list[dict]):
        nonlocal best_feature, best_score

        # Only compare "2 Tremont St" part, not ", Brighton, MA 02135"
        inp = raw_address.split(",")[0].strip().upper()

        for feat in features:
            attrs = feat.get("attributes", {}) or {}
            cand = f"{attrs.get('STREET_NUMBER','')} {attrs.get('FULL_STREET_NAME','')}".strip().upper()
            score = similarity(inp, cand)

            if best_score is None or score > best_score:
                best_score = score
                best_feature = feat

    def run_where(where: str, record_cap: int | None = None) -> bool:
        out = arcgis_query(root, layer_id, where=where, out_fields="*", return_geometry=True,
                           result_record_count=record_cap)
        tried.append(out["request_url"])
        tried_wheres.append(where)
        feats = out["json"].get("features", []) or []
        if feats:
            consider(feats)
            return True
        return False

    # Number is a range -> try both endpoints; also try exact range record if possible
    endpoint_numbers = []
    if p.number_start:
        endpoint_numbers.append(p.number_start)
    if p.number_end and p.number_end != p.number_start:
        endpoint_numbers.append(p.number_end)

    def step_structured(include_unit: bool, include_zip: bool, include_type: bool) -> bool:
        found_any = False

        # Street clause: either FULL_STREET_NAME (with type) or STREET_BODY (without type)
        if include_type and p.street_body and p.street_type:
            street_clause_exact = where_street_full_exact(f"{p.street_body} {p.street_type}")
            street_clause_like = where_street_full_like(f"{p.street_body} {p.street_type}")
        else:
            # "without type" route
            if not p.street_body:
                return False
            street_clause_exact = where_street_body_exact(p.street_body)
            street_clause_like = street_clause_exact  # keep simple; could add LIKE on STREET_BODY if needed

        zip_clause = where_zip(p.zip) if (include_zip and p.zip) else ""
        unit_clause = where_unit(p.unit) if (include_unit and p.unit) else ""
        nbhd_clause = where_neighborhood(p.neighborhood) if p.neighborhood else ""

        # If it's a range, try matching the actual range record first (if we have both ends)
        if p.number_start and p.number_end:
            # range
            w = and_all(
                where_range_exact(p.number_start, p.number_end),
                street_clause_exact,
                unit_clause,
                zip_clause,
                nbhd_clause,
            )
            found_any |= run_where(w)

        # Try endpoints (or single number if not range)
        nums_to_try = endpoint_numbers if endpoint_numbers else ([p.number_start] if p.number_start else [])
        for n in nums_to_try:
            # exact street name
            w1 = and_all(
                where_number_exact(n),
                street_clause_exact,
                unit_clause,
                zip_clause,
                nbhd_clause
            )
            found_any |= run_where(w1)

            # fallback: LIKE street name (helps if abbreviations differ inside FULL_STREET_NAME)
            w2 = and_all(
                where_number_exact(n),
                street_clause_like,
                unit_clause,
                zip_clause,
                nbhd_clause
            )
            found_any |= run_where(w2)

        return found_any

    found = False

    # 1) Full structured-ish (number + street + type + unit + zip)
    found |= step_structured(include_unit=True, include_zip=True, include_type=True)

    # 2) Without unit
    if not found:
        found |= step_structured(include_unit=False, include_zip=True, include_type=True)

    # 3) Without zip
    if not found:
        found |= step_structured(include_unit=False, include_zip=False, include_type=True)

    # 5) Without type (treat type as uncertain/mismatched)
    if not found:
        found |= step_structured(include_unit=False, include_zip=False, include_type=False)

    # 6) Still failing: broad street-only query and choose best similarity by FULL_ADDRESS
    if not found and p.street_body:
        broad = sql_escape(_norm(p.street_body))
        # Use FULL_ADDRESS to broaden; then we similarity-rank
        w = f"UPPER({F_FULL_ADDRESS}) LIKE '%{broad}%'"
        run_where(w, record_cap=2000)

    if best_score is None or best_score < min_similarity:
        return {
            "input": raw_address,
            "tried_urls": tried,
            "tried_wheres": tried_wheres,
            "best_feature": best_feature,
            "best_score": best_score,
            "note": f"No match >= {min_similarity:.2f} similarity",
        }

    return {
        "input": raw_address,
        "tried_urls": tried,
        "tried_wheres": tried_wheres,
        "best_feature": best_feature,
        "best_score": best_score,
    }


if __name__ == "__main__":
    LICENSES_PATH = "data/licenses.json"
    subset_keys = [
        "SAM_ADDRESS_ID", "BUILDING_ID", "FULL_ADDRESS",
        "STREET_NUMBER", "IS_RANGE", "RANGE_FROM", "RANGE_TO",
        "UNIT", "FULL_STREET_NAME", "STREET_BODY",
        "STREET_SUFFIX_ABBR", "STREET_FULL_SUFFIX",
        "MAILING_NEIGHBORHOOD", "ZIP_CODE",
    ]

    with open(LICENSES_PATH, "r", encoding="utf-8") as f:
        licenses = json.load(f)[:5]  # list[dict]

    # Extract address strings (skip missing/empty)
    addresses = [
        item["address"].strip()
        for item in licenses
        if isinstance(item, dict) and item.get("address") and str(item["address"]).strip()
    ]

    results = []
    for addr in addresses:
        try:
            res = implement_strategy(addr)
        except Exception as e:
            res = {"input": addr, "error": str(e), "best_feature": None, "best_score": None}
        results.append(res)

    for i, result in enumerate(results, start=1):
        print("=" * 80)
        print(f"[{i}] Input:", result.get("input"))

        if result.get("error"):
            print("Error:", result["error"])
            continue

        print("\nTried WHERE clauses:")
        for w in result.get("tried_wheres", []):
            print("  ", w)

        print("\nTried request URLs:")
        for u in result.get("tried_urls", []):
            print("  ", u)

        print("\nBest score:", result.get("best_score"))

        bf = result.get("best_feature")
        if bf:
            attrs = (bf.get("attributes") or {})
            print("Best feature (subset):")
            print(json.dumps({k: attrs.get(k) for k in subset_keys}, indent=2))
        else:
            print("No best_feature")