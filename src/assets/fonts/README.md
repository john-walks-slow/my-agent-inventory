# 字体清单

站内全部字体自托管于本目录，随仓库分发；许可文本均随附。

| 文件 | @font-face 名 | 用途 | 来源 | 许可 |
|---|---|---|---|---|
| `DotGothic16.woff2` | `PixelCJK` | stardew 主题正文/展示 | [google/fonts](https://github.com/google/fonts/tree/main/ofl/dotgothic16) | OFL 1.1（`dotgothic16-OFL.txt`） |
| `Silkscreen.ttf` | `PixelLatin` | Latin 备用 | [google/fonts](https://github.com/google/fonts/tree/main/ofl/silkscreen) | OFL 1.1（`silkscreen-OFL.txt`） |
| `pkmn-r.woff2` | `PKMN` | pokemon 主题展示（GB 初代字形） | [nue-of-k/pkmn](https://github.com/nue-of-k/pkmn) | MIT（`pkmn-LICENSE.txt`） |
| `pkmn-s.woff2` / `pkmn-w.woff2` | — | PKMN 备用字重（Strict / Western，暂未引用） | 同上 | 同上 |
| `fusion-pixel-12px-proportional-zh_hans.woff2` | `Fusion Pixel` | pokemon / jrpg / diablo 正文 | [TakWolf/fusion-pixel-font](https://github.com/TakWolf/fusion-pixel-font) | OFL 1.1（`fusion-pixel-OFL.txt`，部件许可见 `fusion-pixel-LICENSES/`） |
| `Cinzel.woff2` | `Cinzel` | jrpg 主题展示（可变字重 400–900） | [google/fonts](https://github.com/google/fonts/tree/main/ofl/cinzel) | OFL 1.1（`cinzel-OFL.txt`） |
| `PirataOne.woff2` | `Pirata One` | diablo 主题展示 | [google/fonts](https://github.com/google/fonts/tree/main/ofl/pirataone) | OFL 1.1（`pirataone-OFL.txt`） |

- ttf → woff2 转换用 fontTools（`TTFont.flavor = 'woff2'`），字形未做子集化（保证 fork 者任意文案可覆盖）。
- pkmn 三字重原始 ttf 有表级瑕疵会被 Chrome OTS 拒收（`OS/2` 首末字符区间倒挂 + `cmap` 段内越界字形引用），已用 fontTools 从解析后的映射重建 cmap（format 4+12）并修正 OS/2 区间；字形本身未动。
- 各主题字体经 `html[data-theme]` 下的 `--font-display` / `--font-body` 变量切换，仅激活主题引用的字体会被浏览器下载。
