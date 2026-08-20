# Signal Grid Social Cards

[English README](README.md)

一个主要面向小红书 / RedNote，同时适配 X 和 LinkedIn 的开源 Codex Skill。它把有来源的选题制作成中文或英文社交卡片，并产出可编辑 HTML/CSS、有序 PNG、平台发布文案及可选的 LinkedIn PDF。

> 本项目在 [Guizang Social Card Skill](https://github.com/op7418/guizang-social-card-skill) 的工作流与社交叙事实践基础上开发。感谢 [op7418](https://github.com/op7418) 开源这一优秀项目。Signal Grid 采用不同的模块化视觉语言，并保留上游署名及 AGPL-3.0 许可。

## 用 Signal Grid 制作

| Etched 估值翻倍 | OpenAI 训练与失配 | 小马智行海外 Robotaxi |
| --- | --- | --- |
| ![Etched 估值图文](examples/showcase/etched-valuation.png) | ![OpenAI 训练图文](examples/showcase/openai-misalignment.png) | ![小马智行 Robotaxi 图文](examples/showcase/pony-ai-robotaxi.png) |

每个案例都把一个时效选题整理成六张有来源的视觉叙事：钩子、证据、意义和边界。展示图中的识别素材仅用于编辑性说明，来源和权利状态记录在 [examples/showcase/SOURCES.md](examples/showcase/SOURCES.md)。

## 平台适配

| 平台 | 状态 | 原生输出 |
| --- | --- | --- |
| 小红书 / RedNote | 首要平台、原生预设 | 1080×1440（3:4），通常 5–6 张，附完整发布文案 |
| X | 专用重排预设 | 1080×1350（4:5），单帖不超过 4 张，提供符合普通帖限制的线程文案 |
| LinkedIn | 专用重排预设 | 1080×1350（4:5），多图帖子或单个 PDF 文档轮播 |

三端不会直接复用同一批成品 PNG。X 和 LinkedIn 版本从同一事实账本重新排版，并分别调整卡片数量和发布文案。详细规则见 [platform-system.md](references/platform-system.md)。

## 主要能力

- 默认生成 5–6 张 `1080×1440` 小红书图文卡片，并支持 X、LinkedIn 专用 4:5 重排。
- 支持完整简体中文或英文版本，不是只翻译标题。
- 同时生成可编辑 HTML/CSS、PNG 和总览拼图。
- 可把 LinkedIn 卡片组合成一个 PDF 文档轮播。
- 生成 `POST_COPY.md`：推荐标题、备选标题、发布正文、标签及必要提示。
- 生成 `SOURCES.md`：记录新闻事实、Logo、人物照片及其他识别素材的来源。
- 内置 Signal Blue / Alert Orange、Violet / Moss、Petrol / Raspberry 三套色板。

![三套内置色板](examples/palette-preview/contact-sheet.png)

未指定语言时默认使用简体中文；明确要求英文时，卡片文字、发布文案、标签、提示和替代文本均使用自然英文，并根据英文长度重新排版。

## 安装

将发布 ZIP 解压到 Codex Skills 目录：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills/signal-grid-social-cards"
unzip signal-grid-social-cards.zip -d "${CODEX_HOME:-$HOME/.codex}/skills/signal-grid-social-cards"
```

重新加载 Codex 后可以这样使用：

```text
使用 $signal-grid-social-cards 把这个选题做成 6 张小红书图文，并一起生成发布标题和正文。
```

英文版本：

```text
Use $signal-grid-social-cards to make an English six-card Xiaohongshu carousel from this article.
```

多平台版本：

```text
使用 $signal-grid-social-cards 为这个选题分别制作小红书、X 和 LinkedIn 中文版本，版式和发布文案按平台适配。
```

## 本地渲染与校验

```bash
npm install
npx playwright install chromium
python3 -m pip install -r requirements.txt
python3 scripts/validate_skill.py .
npm run render:example
python3 scripts/make_contact_sheet.py examples/palette-preview/png examples/palette-preview/contact-sheet.png
python3 scripts/pngs_to_pdf.py path/to/linkedin-png path/to/linkedin-carousel.pdf
python3 scripts/build_release.py
```

仓库提供 `docs/validate.workflow.yml` 作为 GitHub Actions 模板。GitHub 凭证具有 workflow 写入权限后，将它复制到 `.github/workflows/validate.yml` 即可启用自动校验。

## 素材与权利

首页的三张案例合成图包含用于编辑性识别的第三方 Logo 与照片，其来源和权利状态记录在 [examples/showcase/SOURCES.md](examples/showcase/SOURCES.md)，不随 AGPL 重新授权。Skill 在新任务中使用素材时，必须记录来源、尊重原始许可与商标权，并且不得暗示未经证实的合作或背书。详情见 [NOTICE.md](NOTICE.md)。

## 致谢

本项目基于 [Guizang Social Card Skill](https://github.com/op7418/guizang-social-card-skill) 的工作流与社交叙事实践继续设计。再次感谢 [op7418](https://github.com/op7418) 的开源贡献。

## 许可证

GNU AGPL-3.0。必须保留上游署名；修改、分发或以网络服务形式提供时，需要遵守 AGPL 的源码开放要求。完整条款见 [LICENSE](LICENSE) 与 [NOTICE.md](NOTICE.md)。
