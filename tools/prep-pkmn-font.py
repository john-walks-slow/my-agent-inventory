#!/usr/bin/env python3
"""PKMN 像素字体加工：上游 pkmn_w.ttf（Western 变体，小写齐全）→ src/assets/fonts/pkmn.woff2。

为什么不是随库的 pkmn_r：r/s 变体的 26 个小写字母里只有 g i k l m p 有字形，
其余映射到空字形（cmap 声称覆盖但渲染空白），站内 "Lv.42"、"dsh-*" 等混排文本直接乱码。
Western 变体补全了全部小写。

加工三件事：
1. 修 OS/2 usFirstCharIndex/usLastCharIndex 倒挂（上游 0xffff > 0xffe5，Chrome OTS 拒载）；
2. 剥离「映射到空轮廓字形」的 cmap 条目（真正缺字的码位回退到字体栈下一项 Fusion Pixel，
   而不是渲染空白）；空格类码位（U+0020/U+3000）合法无墨，豁免；
3. 输出 woff2（原样保留字形，不子集化——fork 者文案可任意覆盖）。

用法：python3 tools/prep-pkmn-font.py [本地ttf路径]
不带参数时自动从上游仓库拉取 pkmn_w.ttf（需代理网络）。
"""

import sys
import urllib.request
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets" / "fonts" / "pkmn.woff2"
UPSTREAM = "https://raw.githubusercontent.com/nue-of-k/pkmn/master/ttf/pkmn_w.ttf"
# 合法无墨的码位：空格与全角空格
BLANK_OK = {0x20, 0x3000}


def glyph_has_ink(font: TTFont, name: str) -> bool:
    g = font["glyf"][name]
    return (g.numberOfContours or 0) != 0 or (g.isComposite() and bool(g.components))


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    if src is None:
        src = Path("/tmp/pkmn_w.ttf")
        if not src.exists():
            print(f"下载上游 {UPSTREAM}")
            req = urllib.request.Request(UPSTREAM, headers={"User-Agent": "font-prep"})
            src.write_bytes(urllib.request.urlopen(req, timeout=60).read())

    font = TTFont(src)
    glyf = font["glyf"]

    # 1. 修 OS/2 倒挂：以 cmap 实际映射区间为准
    mapped = sorted(cp for t in font["cmap"].tables for cp in t.cmap)
    os2 = font["OS/2"]
    os2.usFirstCharIndex, os2.usLastCharIndex = mapped[0], mapped[-1]

    # 2. 剥离空字形映射（空格豁免）
    stripped = []
    for table in font["cmap"].tables:
        for cp in list(table.cmap):
            name = table.cmap[cp]
            if cp not in BLANK_OK and not glyph_has_ink(font, name):
                del table.cmap[cp]
                if cp not in stripped:
                    stripped.append(cp)

    font.flavor = "woff2"
    font.save(OUT)
    stripped.sort()
    print(f"✓ {OUT.relative_to(ROOT)}（源自 {src.name}）")
    print(f"  剥离空映射 {len(stripped)} 个码位: {[hex(c) for c in stripped]}")
    print(f"  OS/2 区间: {hex(os2.usFirstCharIndex)}–{hex(os2.usLastCharIndex)}")


if __name__ == "__main__":
    main()
