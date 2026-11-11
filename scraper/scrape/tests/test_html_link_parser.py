"""Tests for app.parsers.html_link_parser.HtmlLinkParser."""

from app.parsers.html_link_parser import HtmlLinkParser

# Mirrors the boston.gov drawer markup: a year title plus columns of links.
HTML = """
<div class="entity paragraphs-item-drawer dr">
  <div class="field field-name-field-title field-label-hidden"><div>2025</div></div>
  <div class="dr-c">
    <ul>
      <li><a href="https://drive.google.com/file/d/abc/view">Voting Minutes: Thursday, November 6</a></li>
    </ul>
  </div>
</div>
<div class="entity paragraphs-item-drawer dr">
  <div class="field field-name-field-title field-label-hidden"><div>2021</div></div>
  <div class="dr-c"><a href="/files/Board%20Voting%20Agenda%204.8.21_0.pdf">Voting agenda:</a></div>
</div>
<a href="https://boston.justfoia.com/publicportal/home/newrequest">Public records</a>
"""


def test_links_carry_their_drawer_year():
    links = HtmlLinkParser().extract_links(HTML)
    assert [(link["body"], link["section_year"]) for link in links] == [
        ("Voting Minutes: Thursday, November 6", "2025"),
        ("Voting agenda:", "2021"),
        ("Public records", None),
    ]
