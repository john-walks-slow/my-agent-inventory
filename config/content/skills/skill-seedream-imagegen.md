# seedream-imagegen（Seedream 5.0 Lite 生图与头像工作流）

## 何时使用

- 用户要求使用火山方舟 Seedream（`doubao-seedream-5.0-lite`）进行 AI 生图或头像生成时；
- 需要基于 Agent 角色设定（如 `~/agents/<name>/IDENTITY.md`）生成专属头像或插画时；
- 通过本地 `cpa`（cli-proxy-api）网关调用 OpenAI 兼容的图像生成接口（`/v1/images/generations`）时。


## 接口与配置规范

本地 `cpa` 网关作为统一模型中转，已预置并映射火山方舟的 `doubao-seedream-5.0-lite` 模型：

- **接口地址**：`http://localhost:9999/v1/images/generations`
- **请求方法**：`POST`
- **请求头**：
  - `Content-Type: application/json`
  - `Authorization: Bearer sk-<vnc-password>`（固定密钥，对应 `.credentials.yaml` 中的 `CPA_API_KEY`）
- **模型名称**：`seedream-5.0-lite`（或 `vc/seedream-5.0-lite`）


## 核心参数约束与避坑指南（CRITICAL）

### 1. 分辨率像素门槛（严禁 1024x1024）
火山方舟 Seedream 5.0 系列模型对生成分辨率有**硬性最小像素限制**：
> `image size must be at least 3686400 pixels`

* **错误做法**：传入常见的 `"size": "1024x1024"`（约 105 万像素），API 会直接抛出 `InvalidParameter` 错误；
* **正确做法**：必须使用不低于 368.64 万像素的规格：
  - **正方形头像/插画推荐**：`"2048x2048"`（419.4 万像素）或 `"1920x1920"`（368.64 万像素）；
  - **横屏/竖屏比例**：根据实际比例确保 `宽 × 高 ≥ 3,686,400`。

### 2. 生成耗时与超时设置
- 单张 2048×2048 图像的生成耗时通常在 **15 ~ 25 秒** 左右；
- 如需生成多张图，建议**单图独立调用**或将请求超时时间设置在 60 秒以上，避免网关或脚本超时中断。


## 人设提取与 Prompt 编写范式

当任务为某个 Agent（如 `agents/yu`、`agents/luna`）生成头像时，不要凭空猜测，应先读取其 `IDENTITY.md`，按以下五要素组装英文 Prompt：

1. **类型与风格基调**：`Anime avatar portrait, masterpiece, light novel cover illustration style, clean transparent coloring` 等；
2. **角色核心属性**：年龄、身份、体型（如 `17-year-old Japanese high school girl` / `resident JK maid`）；
3. **发型与五官细节**：发色、发型细节、发尾卷曲、刘海位置、瞳色（如 `chestnut brown hair with loose low twintails`, `amber eyes`）；
4. **表情与性格神态**：害羞程度、脸红范围、神情微动（如 `blushing cheeks spreading to ears`, `head tilted with curious dreamy expression`）；
5. **标志性衣着与配饰**：制服领结、特定刺绣围裙、发带等；
6. **光影与构图**：`soft lens flare`, `dreamy bokeh`, `bust portrait shot`, `aesthetic icon`。


## 完整生成与回传脚本示例

```python
import urllib.request
import json
import os

url = "http://localhost:9999/v1/images/generations"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer sk-<vnc-password>"
}

payload = {
    "model": "seedream-5.0-lite",
    "prompt": "Anime avatar portrait, masterpiece, highest quality, light novel cover illustration style...",
    "size": "2048x2048",
    "n": 1
}

# 1. 发起生图请求
req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
with urllib.request.urlopen(req, timeout=120) as resp:
    res = json.loads(resp.read().decode("utf-8"))
    img_url = res["data"][0]["url"]

# 2. 下载保存至目标路径
output_path = "~/agents/yu/avatar.jpg"
urllib.request.urlretrieve(img_url, output_path)
```


## IM 客户端附件回传

在 Telegram / 微信 等 IM 对话场景下，生成并保存图片后：
* 必须调用 **`dsh_im_return_file`** 工具，传入本地文件的绝对路径（如 `~/agents/yu/avatar.jpg`）；
* 系统会将图片作为原生图片消息推送给用户，无需用户手动寻找或通过外链查看。
