import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const sourceHtml = resolve("/tmp/wedding-rendered.html");
const outputDir = resolve(root, "docs");
const outputHtml = resolve(outputDir, "index.html");
const css = (await readFile(resolve(root, "app/globals.css"), "utf8")) + "\n" + (await readFile(resolve(root, "app/design.css"), "utf8")).replaceAll('/fonts/', './fonts/').replaceAll('/images/', './images/');
let html = await readFile(sourceHtml, "utf8");

html = html.slice(0, html.indexOf("</html>") + "</html>".length);
html = html
  .replace(/<script[\s\S]*?<\/script>/g, "")
  .replace(/<link rel="modulepreload"[^>]*>/g, "")
  .replace(/<link rel="preload" as="image"[^>]*>/g, "")
  .replace(/<link rel="stylesheet"[^>]*>/g, "")
  .replace(
    /http:\/\/(?:localhost|127\.0\.0\.1):\d+\/og\.png/g,
    "https://u-are-my-valentine.github.io/wedding-invitation/og.png",
  )
  .replace(
    /\/_vinext\/image\?url=%2Fimages%2Fwedding%2F(\d+)\.webp&amp;w=\d+&amp;q=\d+/g,
    "./images/wedding/$1.webp",
  )
  .replaceAll('src="/images/', 'src="./images/')
  .replace(/srcset="[^"]*"/gi, (attribute) => attribute.replace(/([" ,])\/images\//g, "$1./images/"))
  .replace("</head>", `<style>${css}</style></head>`);

const extraStyles = `
<style>
.static-dialog[hidden]{display:none}
.static-dialog .dialog{position:relative}
.static-gallery-image{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:54px 16px 70px}
</style>`;

const dialogs = `
<div class="dialog-backdrop static-dialog" id="gallery-dialog" hidden>
  <div class="dialog gallery-dialog" role="dialog" aria-modal="true" aria-labelledby="gallery-title" tabindex="-1">
    <div class="dialog-heading">
      <h2 id="gallery-title">사진 크게 보기</h2>
      <button class="icon-button static-close" aria-label="사진 크게 보기 닫기">×</button>
    </div>
    <div class="gallery-viewer">
      <img class="static-gallery-image" alt="">
      <button class="gallery-prev" aria-label="이전 사진">‹</button>
      <button class="gallery-next" aria-label="다음 사진">›</button>
      <span class="gallery-count"></span>
    </div>
  </div>
</div>`;

const script = `
<script>
(() => {
  const gallery = ${JSON.stringify([
    "0100","0177","0316","0392","0463","0644","0807","0922",
    "1133","1186","1330","1420","1439","1471","1499",
  ])};
  let galleryIndex = 0;
  let touchStartX = null;
  let previousFocus = null;
  const toast = document.querySelector(".toast");
  const galleryDialog = document.querySelector("#gallery-dialog");
  const galleryImage = galleryDialog.querySelector(".static-gallery-image");
  const galleryCount = galleryDialog.querySelector(".gallery-count");

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  async function copyText(value, message) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const input = document.createElement("textarea");
        input.value = value;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      showToast(message);
    } catch {
      showToast("복사하지 못했습니다. 길게 눌러 복사해 주세요.");
    }
  }

  function openDialog(dialog) {
    previousFocus = document.activeElement;
    dialog.hidden = false;
    document.body.classList.add("modal-open");
    dialog.querySelector(".dialog").focus();
  }

  function closeDialog(dialog) {
    dialog.hidden = true;
    document.body.classList.remove("modal-open");
    if (previousFocus) previousFocus.focus();
  }

  function renderGallery() {
    galleryImage.src = "./images/wedding/" + gallery[galleryIndex] + ".webp";
    galleryImage.alt = "곽재현과 정연수의 웨딩 사진 " + (galleryIndex + 1);
    galleryCount.textContent = (galleryIndex + 1) + " / " + gallery.length;
  }

  function moveGallery(direction) {
    galleryIndex = (galleryIndex + direction + gallery.length) % gallery.length;
    renderGallery();
  }

  const galleryStrip = document.querySelector(".gallery-strip");
  galleryStrip.addEventListener("scroll", () => {
    const index = Math.max(0, Math.min(gallery.length - 1, Math.round(galleryStrip.scrollLeft / galleryStrip.clientWidth)));
    document.querySelector(".gallery-position span").textContent = String(index + 1).padStart(2, "0");
  }, { passive: true });
  document.querySelectorAll(".gallery-step").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Math.round(galleryStrip.scrollLeft / galleryStrip.clientWidth);
      const direction = Number(button.dataset.direction);
      const next = (index + direction + gallery.length) % gallery.length;
      const wraps = index + direction < 0 || index + direction >= gallery.length;
      galleryStrip.scrollTo({ left: next * galleryStrip.clientWidth, behavior: wraps || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
  });

  document.querySelectorAll(".gallery-item").forEach((button, index) => {
    button.addEventListener("click", () => {
      galleryIndex = Number(button.dataset.galleryIndex ?? index);
      renderGallery();
      openDialog(galleryDialog);
    });
  });

  document.querySelectorAll("button").forEach((button) => {
    const text = button.textContent.trim();
    if (text.endsWith("공유하기")) {
      button.addEventListener("click", async () => {
        const data = {
          title: "곽재현 ♥ 정연수, 결혼합니다",
          text: "2027년 2월 14일 일요일 오후 12시 30분 · 드레스가든",
          url: location.href,
        };
        try {
          if (navigator.share) await navigator.share(data);
          else await copyText(location.href, "청첩장 링크가 복사되었습니다.");
        } catch (error) {
          if (error.name !== "AbortError") {
            await copyText(location.href, "청첩장 링크가 복사되었습니다.");
          }
        }
      });
    }
  });

  document.querySelectorAll(".account-tabs button").forEach((button, index) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".account-tabs button").forEach((tab, i) => tab.setAttribute("aria-pressed", String(i === index)));
      document.querySelectorAll("[data-account-side]").forEach((panel, i) => { panel.hidden = i !== index; });
    });
  });
  document.querySelectorAll(".account-row").forEach((row) => {
    row.querySelector("button").addEventListener("click", () => {
      copyText(row.querySelector("strong").textContent.split(" ").slice(1).join(" "), "계좌번호가 복사되었습니다.");
    });
  });

  document.querySelectorAll(".static-close").forEach((button) => {
    button.addEventListener("click", () => closeDialog(button.closest(".static-dialog")));
  });
  document.querySelectorAll(".static-dialog").forEach((backdrop) => {
    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop) closeDialog(backdrop);
    });
  });
  galleryDialog.querySelector(".gallery-prev").addEventListener("click", () => moveGallery(-1));
  galleryDialog.querySelector(".gallery-next").addEventListener("click", () => moveGallery(1));
  galleryDialog.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0] ? event.touches[0].clientX : null;
  }, { passive: true });
  galleryDialog.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const endX = event.changedTouches[0] ? event.changedTouches[0].clientX : touchStartX;
    if (Math.abs(endX - touchStartX) > 50) moveGallery(endX > touchStartX ? -1 : 1);
    touchStartX = null;
  }, { passive: true });
  document.addEventListener("keydown", (event) => {
    const openDialog = document.querySelector(".static-dialog:not([hidden])");
    if (!openDialog) return;
    if (event.key === "Escape") closeDialog(openDialog);
    if (openDialog === galleryDialog && event.key === "ArrowLeft") moveGallery(-1);
    if (openDialog === galleryDialog && event.key === "ArrowRight") moveGallery(1);
  });

  function updateCountdown() {
    const target = new Date(document.querySelector(".dday").dataset.weddingDate);
    const now = new Date();
    const kstDate = date => new Date(date.getTime() + 9 * 3600000).toISOString().slice(0, 10);
    const days = Math.max(0, Math.round((Date.parse(kstDate(target)) - Date.parse(kstDate(now))) / 86400000));
    const dday = document.querySelector(".dday");
    if (now >= target) dday.textContent = "축복해 주신 모든 분께 감사드립니다.";
    else dday.innerHTML = "연수, 재현의 결혼식이 <strong>" + days + "</strong>일 남았습니다.";
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

})();
</script>`;

html = html
  .replace("</head>", `${extraStyles}</head>`)
  .replace("</body>", `${dialogs}${script}</body>`);

await rm(outputDir, { recursive: true, force: true });
await mkdir(resolve(outputDir, "images"), { recursive: true });
await cp(resolve(root, "public/images/wedding"), resolve(outputDir, "images/wedding"), {
  recursive: true,
});
await cp(resolve(root, "public/images/location"), resolve(outputDir, "images/location"), { recursive: true });
await cp(resolve(root, "public/og.png"), resolve(outputDir, "og.png"));
await cp(resolve(root, "public/fonts"), resolve(outputDir, "fonts"), { recursive: true });
await writeFile(resolve(outputDir, ".nojekyll"), "# Serve this directory as plain static files.\n");
await writeFile(outputHtml, html);

console.log(outputHtml);
