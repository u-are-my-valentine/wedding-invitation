"use client";

import Image from "next/image";
import {
  type ReactNode,
  type TouchEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { weddingConfig as config } from "@/config/wedding";
import {
  getCountdown,
  getMonthCalendar,
  getWeddingDate,
} from "@/lib/wedding-date";
import type { Account, Person } from "@/types/wedding";

const weddingDate = getWeddingDate(config.wedding.date, config.wedding.time);
const calendarDays = getMonthCalendar(weddingDate);
const [weddingYear, weddingMonth, weddingDay] = config.wedding.date
  .split("-")
  .map(Number);
const [weddingHour, weddingMinute] = config.wedding.time.split(":").map(Number);
const hour12 = weddingHour % 12 || 12;
const periodEnglish = weddingHour < 12 ? "AM" : "PM";
const weekdayKorean = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", weekday: "long" }).format(weddingDate);
const timeDisplay = `${weekdayKorean} 낮 ${hour12}시 ${weddingMinute}분`;
const coverTime = `${periodEnglish} ${hour12}:${String(weddingMinute).padStart(2, "0")}`;
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthEnglish = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  month: "long",
}).format(weddingDate);
const dateParts = config.wedding.date.replaceAll("-", ".");
const seollalDays = weddingYear === 2027 && weddingMonth === 2 ? [6, 7, 8, 9] : [];

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="section reveal" id={id}>
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      <div className="section-rule" aria-hidden="true" />
      {children}
    </section>
  );
}

function FamilyLine({ person, role }: { person: Person; role: "아들" | "딸" }) {
  const parents = [person.father, person.mother].filter(Boolean);
  return (
    <p className="family-line">
      <span>
        {parents.map((parent, index) => (
          <span key={parent?.name}>
            {index > 0 && " · "}
            {parent?.deceased && <span className="deceased">故 </span>}
            {parent?.name}
          </span>
        ))}
      </span>
      {parents.length > 0 && <span className="relation">의 {role}</span>}
      <strong>{person.name}</strong>
    </p>
  );
}

function AccessibleDialog({
  title,
  open,
  onClose,
  children,
  className = "",
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.focus();
    document.body.classList.add("modal-open");

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modal-open");
      previousFocus?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={`dialog ${className}`}
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="dialog-heading">
          <h2 id={titleId}>{title}</h2>
          <button aria-label={`${title} 닫기`} className="icon-button" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AccountGroup({
  title,
  accounts,
  copy,
}: {
  title: string;
  accounts: Account[];
  copy: (value: string, message: string) => void;
}) {
  if (accounts.length === 0) return null;
  return (
    <div className="account-group" aria-label={title}>
      <div className="account-list">
        {accounts.map((account) => (
          <div className="account-row" key={`${account.label}-${account.holder}`}>
            <span>
              <small>{account.label} · {account.holder}</small>
              <strong>{account.bank} {account.number}</strong>
            </span>
            <button
              className="text-button"
              onClick={() => copy(account.number, "계좌번호가 복사되었습니다.")}
            >
              복사
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WeddingInvitation() {
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [gallerySlide, setGallerySlide] = useState(0);
  const galleryStripRef = useRef<HTMLDivElement>(null);
  const [accountSide, setAccountSide] = useState<"groom" | "bride">("groom");
  const [toast, setToast] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const countdown = now === null ? null : getCountdown(weddingDate, new Date(now));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const touchStartX = useRef<number | null>(null);

  const closeGallery = () => setGalleryIndex(null);
  const scrollGallery = (direction: number) => {
    const strip = galleryStripRef.current;
    if (!strip) return;
    const index = Math.round(strip.scrollLeft / strip.clientWidth);
    const next = (index + direction + config.gallery.length) % config.gallery.length;
    const wraps = index + direction < 0 || index + direction >= config.gallery.length;
    strip.scrollTo({ left: next * strip.clientWidth, behavior: wraps || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  const moveGallery = (direction: number) => {
    setGalleryIndex((current) => {
      if (current === null) return null;
      return (current + direction + config.gallery.length) % config.gallery.length;
    });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (galleryIndex === null) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "ArrowLeft") moveGallery(-1);
      if (event.key === "ArrowRight") moveGallery(1);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [galleryIndex]);

  async function copy(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value);
      setToast(message);
    } catch {
      setToast("복사하지 못했습니다. 길게 눌러 복사해 주세요.");
    }
  }

  async function shareInvitation() {
    const shareData = {
      title: config.share.title,
      text: config.share.description,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copy(window.location.href, "청첩장 링크가 복사되었습니다.");
      }
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") {
        await copy(window.location.href, "청첩장 링크가 복사되었습니다.");
      }
    }
  }

  function handleGalleryTouchStart(event: TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleGalleryTouchEnd(event: TouchEvent) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;
    if (Math.abs(distance) > 50) moveGallery(distance > 0 ? -1 : 1);
    touchStartX.current = null;
  }

  return (
    <>
      <main className="invitation-shell">
        <section className="cover" aria-labelledby="cover-title">
          <div className="stamp-frame">
            <div className="stamp-paper">
              <div className="cover-photo">
                <Image alt={config.gallery[0].alt} fill priority unoptimized sizes="140px" src={config.gallery[0].src} />
              </div>
            </div>
          </div>
          <div className="stamp-heading">
            <p>THE WEDDING OF</p>
            <h1 id="cover-title">{config.couple.bride.name}<i>&amp;</i>{config.couple.groom.name}</h1>
            <p className="stamp-date">{monthEnglish.toUpperCase()} {weddingDay}, {weddingYear}<br />{coverTime}</p>
          </div>
        </section>

        <Section id="invitation" title={config.invitation.title}>
          <div className="invitation-copy">
            {config.invitation.message.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="family">
            <FamilyLine person={config.couple.bride} role="딸" />
            <FamilyLine person={config.couple.groom} role="아들" />
          </div>

        </Section>

        <figure className="portrait-interlude">
          <Image alt={config.gallery[11].alt} width={600} height={400} unoptimized sizes="(max-width: 480px) 88vw, 424px" src={config.gallery[11].src} />
        </figure>

        <Section id="date" eyebrow="THE DAY" title="예식 일시">
          <div className="calendar" aria-label={`${weddingYear}년 ${weddingMonth}월 달력`}>
            <p className="calendar-month">{monthEnglish}, {weddingYear}</p>
            <div className="calendar-grid calendar-weekdays">
              {weekdayLabels.map((day, index) => (
                <span className={index === 0 ? "sunday" : ""} key={day}>{day}</span>
              ))}
            </div>
            <div className="calendar-grid calendar-dates">
              {calendarDays.map((day, index) => (
                <span
                  className={[
                    index % 7 === 0 ? "sunday" : "",
                    day !== null && seollalDays.includes(day) ? "seollal-day" : "",
                    day === weddingDay ? "wedding-day" : "",
                  ].join(" ")}
                  key={`${day ?? "empty"}-${index}`}
                  aria-label={day === weddingDay ? `${weddingMonth}월 ${day}일 결혼식` : day !== null && seollalDays.includes(day) ? `2월 ${day}일 ${day === 9 ? "설날 대체공휴일" : "설 연휴"}` : undefined}
                >
                  {day}
                  {seollalDays.length > 0 && day === 7 && <small className="holiday-label" aria-hidden="true">설연휴</small>}
                </span>
              ))}
            </div>
          </div>
          <p className="date-display">{dateParts}</p>
          <p className="time-display">{timeDisplay}</p>
          <p className="dday" data-wedding-date={weddingDate.toISOString()} suppressHydrationWarning>
            {countdown?.finished ? "축복해 주신 모든 분께 감사드립니다." : <>연수, 재현의 결혼식이 <strong>{countdown?.calendarDays ?? "--"}</strong>일 남았습니다.</>}
          </p>
        </Section>

        <Section id="gallery" title="GALLERY">
          <div className="gallery-strip" ref={galleryStripRef} role="region" aria-label="웨딩 사진 목록" tabIndex={0} onScroll={(event) => setGallerySlide(Math.max(0, Math.min(config.gallery.length - 1, Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))))}>
            {config.gallery.map((photo, index) => (
              <button className="gallery-item gallery-slide" key={photo.src} aria-label={`웨딩 사진 ${index + 1} / ${config.gallery.length} 크게 보기`} data-gallery-index={index} onClick={() => setGalleryIndex(index)}>
                <Image alt={photo.alt} width={photo.width} height={photo.height} unoptimized sizes="(max-width: 480px) 84vw, 416px" src={photo.src} />
              </button>
            ))}
          </div>
          <div className="gallery-navigation">
            <button className="gallery-step" data-direction="-1" aria-label="이전 사진 보기" onClick={() => scrollGallery(-1)}><span aria-hidden="true" /></button>
            <p className="gallery-position" aria-live="polite" aria-atomic="true"><span>{String(gallerySlide + 1).padStart(2, "0")}</span><i aria-hidden="true">/</i>{String(config.gallery.length).padStart(2, "0")}</p>
            <button className="gallery-step" data-direction="1" aria-label="다음 사진 보기" onClick={() => scrollGallery(1)}><span aria-hidden="true" /></button>
          </div>
        </Section>

        <Section id="location" title="오시는 길">
          <div className="venue-card">
            <p className="venue-name">{config.wedding.venueName}</p>
            {config.wedding.hallName && <p>{config.wedding.hallName}</p>}
            <address>{config.wedding.address}</address>
          </div>
          <figure className="venue-map-figure">
            <Image
              className="venue-map"
              alt="청담역 13번 출구에서 드레스가든으로 가는 길을 붉은 화살표로 표시한 약도"
              src="/images/location/dressgarden-route-sidewalk.png"
              width={1540}
              height={1021}
              unoptimized
            />
          </figure>
          <a className="map-view-button" href={config.wedding.mapUrl} rel="noreferrer" target="_blank">지도 보기</a>
          <div className="transport-list">
            {config.transport.map((item) => (
              <div className="transport-row" key={item.label}>
                <strong>{item.label}</strong>
                <p>{item.label === "지하철" ? <><span className="subway-line">●</span> {item.description}</> : item.description}</p>
              </div>
            ))}
          </div>
        </Section>



        {(config.accounts.groom.length > 0 || config.accounts.bride.length > 0) && (
          <Section id="accounts" title="마음 전하실 곳">
            <div className="account-tabs" aria-label="계좌 구분">
              <button aria-pressed={accountSide === "groom"} onClick={() => setAccountSide("groom")}>신랑측</button>
              <button aria-pressed={accountSide === "bride"} onClick={() => setAccountSide("bride")}>신부측</button>
            </div>
            <div className="accounts" data-side={accountSide}>
              <div data-account-side="groom" hidden={accountSide !== "groom"}>
                <AccountGroup accounts={config.accounts.groom} copy={copy} title="신랑측 계좌번호" />
              </div>
              <div data-account-side="bride" hidden={accountSide !== "bride"}>
                <AccountGroup accounts={config.accounts.bride} copy={copy} title="신부측 계좌번호" />
              </div>
            </div>
          </Section>
        )}

        <section className="closing">
          <Image
            alt={config.gallery[10].alt}
            fill
            unoptimized
            sizes="(max-width: 480px) 88vw, 424px"
            src={config.gallery[10].src}
          />
        </section>

        <footer>
          <button onClick={shareInvitation}>청첩장 공유하기</button>
          <span>{config.couple.groom.name} &amp; {config.couple.bride.name}의 결혼식</span>
        </footer>
      </main>

      <AccessibleDialog
        className="gallery-dialog"
        onClose={closeGallery}
        open={galleryIndex !== null}
        title="사진 크게 보기"
      >
        {galleryIndex !== null && (
          <div
            className="gallery-viewer"
            onTouchEnd={handleGalleryTouchEnd}
            onTouchStart={handleGalleryTouchStart}
          >
            <Image
              alt={config.gallery[galleryIndex].alt}
              fill
              priority
              unoptimized
              sizes="100vw"
              style={{ objectFit: "contain" }}
              src={config.gallery[galleryIndex].src}
            />
            <button aria-label="이전 사진" className="gallery-prev" onClick={() => moveGallery(-1)}>‹</button>
            <button aria-label="다음 사진" className="gallery-next" onClick={() => moveGallery(1)}>›</button>
            <span className="gallery-count">{galleryIndex + 1} / {config.gallery.length}</span>
          </div>
        )}
      </AccessibleDialog>

      <div aria-atomic="true" aria-live="polite" className={`toast ${toast ? "show" : ""}`} role="status">
        {toast}
      </div>
    </>
  );
}
