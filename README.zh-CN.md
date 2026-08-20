# Signal Grid Social Cards

[English README](README.md)

一个主要面向小红书 / RedNote 的开源 Codex Skill，用来把有来源的选题制作成中文或英文 3:4 图文卡片，同时产出可编辑 HTML/CSS、有序 PNG、发布标题、正文、标签和来源记录。

![三套内置色板](examples/palette-preview/contact-sheet.png)

> 本项目在 [Guizang Social Card Skill](https://github.com/op7418/guizang-social-card-skill) 的工作流与社交叙事实践基础上开发。感谢 [op7418](https://github.com/op7418) 开源这一优秀项目。Signal Grid 采用不同的模块化视觉语言，并保留上游署名及 AGPL-3.0 许可。

## 主要能力

- 默认生成 5–6 张 `1080×1440` 小红书图文卡片。
- 支持完整简体中文或英文版本，不是只翻译标题。
- 同时生成可编辑 HTML/CSS、PNG 和总览拼图。
- 生成 `POST_COPY.md`：推荐标题、备选标题、发布正文、标签及必要提示。
- 生成 `SOURCES.md`：记录新闻事实、Logo、人物照片及其他识别素材的来源。
- 内置 Signal Blue / Alert Orange、Violet / Moss、Petrol / Raspberry 三套色板。

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

## 本地渲染与校验

```bash
npm install
npx playwright install chromium
python3 -m pip install -r requirements.txt
python3 scripts/validate_skill.py .
npm run render:example
python3 scripts/make_contact_sheet.py examples/palette-preview/png examples/palette-preview/contact-sheet.png
python3 scripts/build_release.py
```

仓库提供 `docs/validate.workflow.yml` 作为 GitHub Actions 模板。GitHub 凭证具有 workflow 写入权限后，将它复制到 `.github/workflows/validate.yml` 即可启用自动校验。

## 素材与权利

仓库不打包第三方 Logo、人物照片、产品图或新闻照片。Skill 在生成任务中使用这些素材时，必须记录来源、尊重原始许可与商标权，并且不得暗示未经证实的合作或背书。详情见 [NOTICE.md](NOTICE.md)。

## 致谢

本项目基于 [Guizang Social Card Skill](https://github.com/op7418/guizang-social-card-skill) 的工作流与社交叙事实践继续设计。再次感谢 [op7418](https://github.com/op7418) 的开源贡献。

## 许可证

GNU AGPL-3.0。必须保留上游署名；修改、分发或以网络服务形式提供时，需要遵守 AGPL 的源码开放要求。完整条款见 [LICENSE](LICENSE) 与 [NOTICE.md](NOTICE.md)。
