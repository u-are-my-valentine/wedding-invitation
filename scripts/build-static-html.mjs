import ts from "typescript";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const imageOrigin = (process.env.WEDDING_IMAGE_ORIGIN ?? "https://warm-wedding-invitation-2027.jhhj4llm.chatgpt.site").replace(/\/$/, "");
const sourceHtml = resolve("/tmp/wedding-rendered.html");
const outputDir = resolve(root, "docs");
const outputHtml = resolve(outputDir, "index.html");
const css = (await readFile(resolve(root, "app/globals.css"), "utf8")) + "\n" + (await readFile(resolve(root, "app/design.css"), "utf8")).replaceAll('/art/', './art/').replaceAll('/fonts/', './fonts/').replaceAll('/images/', './images/');
let html = await readFile(sourceHtml, "utf8");

html = html.slice(0, html.indexOf("</html>") + "</html>".length);
html = html
  .replace(/<script[\s\S]*?<\/script>/g, "")
  .replace(/<link rel="modulepreload"[^>]*>/g, "")
  .replace(/<link rel="preload" as="image"[^>]*>/g, "")
  .replace(/<link rel="stylesheet"[^>]*>/g, "")
  .replace(
    /http:\/\/(?:localhost|127\.0\.0\.1):\d+\/og\.png/g,
    `${imageOrigin}/og.png`,
  )
  .replace(
    /\/_vinext\/image\?url=%2Fimages%2Fwedding%2F(\d+)\.webp&amp;w=\d+&amp;q=\d+/g,
    "./images/wedding/$1.webp",
  )
  .replace(/<img\b[^>]*>/gi, tag => tag.replace(/ srcset="[^"]*"/gi, ""))
  .replaceAll('src="/art/', 'src="./art/')
  .replaceAll('srcSet="/images/', 'srcSet="./images/')
  .replaceAll('srcset="/images/', 'srcset="./images/')
  .replaceAll(', /images/', ', ./images/')
  .replaceAll('src="/images/', 'src="./images/')
  .replace("</head>", `${imageOrigin ? `<link rel="preconnect" href="${imageOrigin}">` : ""}<style>${css}</style></head>`);

async function inlineHelper(name) {
  const source = await readFile(resolve(root, `lib/${name}.ts`), "utf8");
  return ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText.replace("export function", "function");
}

const script = `
<script>
(() => {
  ${await inlineHelper("cover-scroll")}
  ${await inlineHelper("envelope")}
  setupCoverScroll();
  setupEnvelopeIntro();
  const toast = document.querySelector(".toast");
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

  ${await inlineHelper("gallery")}
  setupGallery();
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

  document.querySelectorAll(".account-trigger").forEach((button) => {
    button.addEventListener("click", () => {
      const wasOpen = button.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".account-trigger").forEach((trigger) => {
        const open = trigger === button && !wasOpen;
        trigger.setAttribute("aria-expanded", String(open));
        document.getElementById(trigger.getAttribute("aria-controls")).hidden = !open;
      });
    });
  });
  document.querySelectorAll(".account-row").forEach((row) => {
    row.querySelector("button").addEventListener("click", () => {
      copyText(row.querySelector("strong").textContent.trim(), "계좌번호가 복사되었습니다.");
    });
  });

  const dday = document.querySelector(".dday");
  const target = new Date(dday.dataset.weddingDate);
  let countdownKey = "";
  function updateCountdown() {
    if (document.hidden) return;
    const now = new Date();
    const kstDate = date => new Date(date.getTime() + 9 * 3600000).toISOString().slice(0, 10);
    const days = Math.max(0, Math.round((Date.parse(kstDate(target)) - Date.parse(kstDate(now))) / 86400000));
    const key = now >= target ? "finished" : String(days);
    if (key === countdownKey) return;
    countdownKey = key;
    if (now >= target) dday.textContent = "축복해 주신 모든 분께 감사드립니다.";
    else dday.innerHTML = "연수, 재현의 결혼식이 <strong>" + days + "</strong>일 남았습니다.";
  }
  updateCountdown();
  setInterval(updateCountdown, 60_000);
  document.addEventListener("visibilitychange", updateCountdown);

})();
</script>`;

html = html
  .replace("</body>", `${script}</body>`)
  .replaceAll("./images/", `${imageOrigin || "."}/images/`);

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(resolve(root, "public/art"), resolve(outputDir, "art"), { recursive: true });
await cp(resolve(root, "public/fonts"), resolve(outputDir, "fonts"), { recursive: true });
if (!imageOrigin) await cp(resolve(root, "public/images"), resolve(outputDir, "images"), { recursive: true });
await writeFile(resolve(outputDir, ".nojekyll"), "# Serve this directory as plain static files.\n");
await writeFile(outputHtml, html);

console.log(outputHtml);
