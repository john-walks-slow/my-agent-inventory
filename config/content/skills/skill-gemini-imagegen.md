# gemini-imagegen（Gemini 生图）

## 何时使用

用户要求用 gemini 生图 / 画图 / 生成图像时。

## 接口要点

- **端点**：`POST http://127.0.0.1:9999/v1/chat/completions`（chat 接口，**不是** `/v1/images/generations`）
- **认证**：`Authorization: Bearer sk-<vnc-password>`
- **模型**：`gemini-3.1-flash-image`
- **必须流式**：`stream: true`，图片数据在流式 `delta.images[].image_url.url`（`data:image/jpeg;base64,...`）
- **耗时**：单图 20-30s，超时给足（≥120s）
- **提示词**：英文最佳，"Generate an image of ..." 范式
- 无尺寸/质量参数，分辨率由模型自定（约 1MB JPEG）

## 生成脚本（实测可用）

```python
import subprocess, json, base64, os, time

prompt = "Generate an image of a cute orange cat sitting on a windowsill"

start = time.time()
p = subprocess.run(['curl','-s','-N','-X','POST','http://127.0.0.1:9999/v1/chat/completions',
  '-H','Authorization: Bearer sk-<vnc-password>','-H','Content-Type: application/json',
  '-d', json.dumps({
    "model": "gemini-3.1-flash-image",
    "messages": [{"role": "user", "content": prompt}],
    "stream": True,
    "max_tokens": 300
  }),
  '--max-time', '120'], capture_output=True, text=True, timeout=125)
total = time.time() - start

out_path = None
for l in p.stdout.split('\n'):
    l = l.strip()
    if not l.startswith('data:'): continue
    d = l[5:].strip()
    if d == '[DONE]': continue
    try:
        obj = json.loads(d)
        imgs = obj.get('choices',[{}])[0].get('delta',{}).get('images') or []
        for img in imgs:
            url = img.get('image_url',{}).get('url','')
            if url.startswith('data:image/jpeg;base64,'):
                raw = base64.b64decode(url.split(',',1)[1])
                out_path = '/tmp/gemini-gen.jpg'
                with open(out_path,'wb') as f: f.write(raw)
    except: pass

if out_path:
    print(f'已保存 {out_path} ({os.path.getsize(out_path)} bytes)，耗时 {total:.1f}s')
else:
    print(f'失败，耗时 {total:.1f}s')
    print(p.stdout[:500])
```
