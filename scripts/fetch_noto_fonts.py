#!/usr/bin/env python3
# 生成自托管中文字体：Noto Sans SC + Noto Serif SC（woff2，子集化为常用汉字）
#
# 背景：网站原仅靠系统字体，导致 Windows / macOS / Android 渲染不一致（Mac 中文回退成黑体）。
# 本脚本把 Noto 中文字体子集化后放进 public/fonts/，由 index.css 的 @font-face 自托管加载，
# 全平台显示同一套字，且不依赖任何外部字体 CDN（国内访问稳定）。
#
# 用法（在 gallery 项目根目录，先开代理，因为要下载 Google Fonts 源）：
#   PowerShell:
#     $env:HTTP_PROXY="http://127.0.0.1:7897"; $env:HTTPS_PROXY="http://127.0.0.1:7897"
#     python scripts/fetch_noto_fonts.py
#   Bash:
#     HTTP_PROXY=http://127.0.0.1:7897 HTTPS_PROXY=http://127.0.0.1:7897 python3 scripts/fetch_noto_fonts.py
#
# 需要 Python 3.10+，脚本会自动 pip install fonttools brotli（走清华镜像）。
import os, re, sys, shutil, subprocess, tempfile, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "fonts")
TMP = os.path.join(tempfile.gettempdir(), "noto_fonts_src")
os.makedirs(OUT, exist_ok=True)
os.makedirs(TMP, exist_ok=True)

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"


def ensure_fonttools():
    try:
        import fontTools, brotli  # noqa
    except ImportError:
        print("安装 fonttools / brotli ...")
        subprocess.run(
            [sys.executable, "-m", "pip", "install",
             "-i", "https://pypi.tuna.tsinghua.edu.cn/simple",
             "fonttools", "brotli"],
            check=True,
        )
        print("安装完成")


def fetch(url, timeout=150):
    last = None
    for _ in range(5):
        try:
            return urllib.request.urlopen(
                urllib.request.Request(url, headers={"User-Agent": UA}), timeout=timeout
            ).read()
        except Exception as e:
            last = e
            time.sleep(2)
    raise RuntimeError("下载失败: " + url)


def dl(family, gh, cands):
    p = os.path.join(TMP, family + ".ttf")
    if os.path.exists(p) and os.path.getsize(p) > 100000:
        print("已缓存", family)
        return p
    for u in ["https://cdn.jsdelivr.net/gh/google/fonts@main/" + gh] + cands:
        try:
            d = fetch(u)
            open(p, "wb").write(d)
            print("下载", family, str(len(d) // 1024) + "KB", u)
            return p
        except Exception as e:
            print("失败", family, repr(e)[:60])
    return None


ensure_fonttools()
from fontTools import subset as fts
from fontTools.ttLib import TTFont

sans = dl(
    "NotoSansSC",
    "ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf",
    ["https://github.com/google/fonts/raw/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf"],
)
serif = dl(
    "NotoSerifSC",
    "ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf",
    [
        "https://github.com/google/fonts/raw/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf",
        "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notoserifsc/NotoSerifSC-Regular.ttf",
    ],
)

def gb2312_unicodes():
    """返回 GB2312 汉字区的 Unicode 码位集合（约 6763 个常用汉字，覆盖 99.9% 场景）。"""
    s = set()
    for hi in range(0xB0, 0xF8):  # 高字节 0xB0..0xF7
        for lo in range(0xA1, 0xFF):  # 低字节 0xA1..0xFE
            try:
                ch = bytes([hi, lo]).decode("gb2312")
            except UnicodeDecodeError:
                continue
            if "\u4e00" <= ch <= "\u9fff":
                s.add(ord(ch))
    return s


# 子集范围：ASCII + 常用拉丁 + 中文标点/全角 + GB2312 常用汉字（不再含生僻字，体积砍到约 1/3）
UNI = "U+20-7E,U+A0-FF,U+0100-017F,U+0180-024F,U+2000-206F,U+3000-303F,U+FF00-FFEF,U+2E80-2EFF,U+2F00-2FDF"
uni = set()
for a, b in re.findall(r"U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?", UNI):
    if b:
        uni.update(range(int(a, 16), int(b, 16) + 1))
    else:
        uni.add(int(a, 16))
uni |= gb2312_unicodes()
print("子集字符数:", len(uni))

opts = fts.Options()
opts.layout_features = "*"
opts.no_hinting = True
faces = []


def subset(src, name, family):
    dst = os.path.join(OUT, name)
    if not src or not os.path.exists(src):
        print("缺少源文件", name)
        return
    f = TTFont(src)
    ss = fts.Subsetter(options=opts)
    ss.populate(unicodes=uni)
    ss.subset(f)
    f.flavor = "woff2"
    f.save(dst)
    print("生成", name, str(os.path.getsize(dst) // 1024) + "KB")
    faces.append(
        '@font-face{font-family:"%s";font-style:normal;font-weight:100 900;'
        'font-display:swap;src:url("/fonts/%s") format("woff2");}' % (family, name)
    )


subset(sans, "NotoSansSC.woff2", "Noto Sans SC")
subset(serif, "NotoSerifSC.woff2", "Noto Serif SC")
open(os.path.join(OUT, "noto.css"), "w", encoding="utf-8").write("\n".join(faces) + "\n")
shutil.rmtree(TMP, ignore_errors=True)
print("完成 ->", os.path.join(OUT, "noto.css"))
print("然后：npm run build 重新构建并部署；确认 public/fonts/*.woff2 已提交到仓库。")
