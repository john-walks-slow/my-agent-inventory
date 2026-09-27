# 字体清单

站内全部字体自托管于本目录，随仓库分发；许可文本均随附。

| 文件 | @font-face 名 | 用途 | 来源 | 许可 |
|---|---|---|---|---|
| `DotGothic16.woff2` | `PixelCJK` | stardew 主题正文/展示 | [google/fonts](https://github.com/google/fonts/tree/main/ofl/dotgothic16) | OFL 1.1（`dotgothic16-OFL.txt`） |
| `Silkscreen.ttf` | `PixelLatin` | Latin 备用 | [google/fonts](https://github.com/google/fonts/tree/main/ofl/silkscreen) | OFL 1.1（`silkscreen-OFL.txt`） |
| `pkmn.woff2` | `PKMN` | pokemon 主题展示（GB 初代字形，Western 变体） | [nue-of-k/pkmn](https://github.com/nue-of-k/pkmn) | MIT（`pkmn-LICENSE.txt`） |
| `fusion-pixel-12px-proportional-zh_hans.woff2` | `Fusion Pixel` | pokemon / jrpg / diablo 正文 | [TakWolf/fusion-pixel-font](https://github.com/TakWolf/fusion-pixel-font) | OFL 1.1（`fusion-pixel-OFL.txt`，部件许可见 `fusion-pixel-LICENSES/`） |
| `Cinzel.woff2` | `Cinzel` | jrpg 主题展示（可变字重 400–900） | [google/fonts](https://github.com/google/fonts/tree/main/ofl/cinzel) | OFL 1.1（`cinzel-OFL.txt`） |
| `PirataOne.woff2` | `Pirata One` | diablo 主题展示 | [google/fonts](https://github.com/google/fonts/tree/main/ofl/pirataone) | OFL 1.1（`pirataone-OFL.txt`） |

- ttf → woff2 转换用 fontTools（`TTFont.flavor = 'woff2'`），字形未做子集化（保证 fork 者任意文案可覆盖）。
- `pkmn.woff2` 取上游 **w（Western）字重**（唯一小写全量有墨的变体），并经 `tools/prep-pkmn-font.py` 修复：OS/2 首末字符区间倒挂 + 剥离 25 个 cmap 空映射字形（cmap 有映射 ≠ 有字形，空轮廓在浏览器渲染为空白/乱码），豁免 U+0020/U+3000；`scripts/font-probe.mjs` 确定性验证 94/94 ASCII 有墨。
- badge 内嵌字体子集由 `tools/subset-badge-fonts.py` 从本目录字体生成（ASCII 拉丁，pokemon 子集缺 `#%*<=>{}` 9 符号回退系统字体）。
- 各主题字体经 `html[data-theme]` 下的 `--font-display` / `--font-body` 变量切换，仅激活主题引用的字体会被浏览器下载。
