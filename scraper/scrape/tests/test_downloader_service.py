"""The downloader must never save a PDF under an unparsed date."""

from app.services import downloader_service
from app.services.downloader_service import DownloaderService


def test_undated_links_are_skipped(tmp_path, monkeypatch):
    service = DownloaderService(download_dir=tmp_path)
    links = [
        {"href": "https://example.com/a.pdf", "body": "x", "date": "2025-11-06"},
        {"href": "https://example.com/b.pdf", "body": "x", "date": "yyyy-11-20"},
        {"href": "https://example.com/c.pdf", "body": "x", "date": "yyyy-mm-dd"},
    ]
    monkeypatch.setattr(service.storage, "load", lambda _path: links)
    monkeypatch.setattr(service.exclude_filter, "exclude_items", [])
    monkeypatch.setattr(service, "_download_pdf", lambda href: b"%PDF-" + href.encode())
    monkeypatch.setattr(service, "_copy_exception_pdfs", lambda *a: 0)
    monkeypatch.setattr(downloader_service.const, "EXCEPTION_PDFS", str(tmp_path))

    service.run()

    assert sorted(p.name for p in tmp_path.glob("*.pdf")) == [
        "voting_minutes_2025-11-06.pdf"
    ]
