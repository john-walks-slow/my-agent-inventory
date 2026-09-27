#!/usr/bin/env python3
"""Badge 拉丁字体子集再生成：src/assets/fonts/ → src/badge/fonts/*-latin.woff2。

badge SVG 以 <img> 嵌入时无法加载外部字体，各主题展示字体的 ASCII 95 字形
以 data-URI 内嵌（scripts/gen-badges.ts 读取后转 base64）。本脚本保证四个
子集与源字体同步——尤其 pkmn.woff2 重新加工后必须重出子集。

用法：python3 tools/subset-badge-fonts.py
"""

from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "assets" / "fonts"
OUT = ROOT / "src" / "badge" / "fonts"

# 子集名 → 源字体文件
SOURCES = {
    "stardew-latin.woff2": "Silkscreen.ttf",
    "pokemon-latin.woff2": "pkmn.woff2",
    "jrpg-latin.woff2": "Cinzel.woff2",
    "diablo-latin.woff2": "PirataOne.woff2",
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for out_name, src_name in SOURCES.items():
        src_path = SRC / src_name
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.name_IDs = ["*"]  # 保留命名表（族名供 badge fontDisplay 引用）
        opts.glyph_names = False
        opts.layout_features = ["*"]
        opts.notdef_outline = True
        font = subset.load_font(str(src_path), opts)
        # ASCII 可见字符 + 空格；源字体缺的码位自然不在子集中（回退系统字体）
        subsetter = subset.Subsetter(opts)
        subsetter.populate(unicodes=list(range(0x20, 0x7F)))
        subsetter.subset(font)
        out_path = OUT / out_name
        subset.save_font(font, str(out_path), opts)
        family = font["name"].getDebugName(1)
        print(f"✓ {out_path.relative_to(ROOT)}（源 {src_name}，族名 {family}）")


if __name__ == "__main__":
    main()
