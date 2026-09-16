const KOREA_OFFSET = "+09:00";

export function getWeddingDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${KOREA_OFFSET}`);
}

export function getDdayMessage(weddingDate: Date, now = new Date()): string {
  const weddingKst = new Date(
    weddingDate.toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  );
  const nowKst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  weddingKst.setHours(0, 0, 0, 0);
  nowKst.setHours(0, 0, 0, 0);
  const days = Math.round((weddingKst.getTime() - nowKst.getTime()) / 86_400_000);
  if (days > 0) return `결혼식까지 ${days}일 남았습니다.`;
  if (days === 0) return "오늘, 저희 결혼합니다.";
  return "축복해 주신 모든 분께 감사드립니다.";
}

export function getMonthCalendar(date: Date): Array<number | null> {
  const year = Number(
    date.toLocaleDateString("en-US", { timeZone: "Asia/Seoul", year: "numeric" }),
  );
  const month = Number(
    date.toLocaleDateString("en-US", { timeZone: "Asia/Seoul", month: "numeric" }),
  );
  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();
  return [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: lastDate }, (_, index) => index + 1),
  ];
}

export function getGoogleCalendarUrl(
  title: string,
  start: Date,
  durationMinutes: number,
  location: string,
  details: string,
): string {
  const format = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${format(start)}/${format(end)}`,
    location,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function createIcsContent(
  title: string,
  start: Date,
  durationMinutes: number,
  location: string,
  description: string,
): string {
  const format = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const escape = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//KO",
    "BEGIN:VEVENT",
    `UID:wedding-${start.getTime()}@invitation`,
    `DTSTAMP:${format(new Date())}`,
    `DTSTART:${format(start)}`,
    `DTEND:${format(end)}`,
    `SUMMARY:${escape(title)}`,
    `LOCATION:${escape(location)}`,
    `DESCRIPTION:${escape(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function getCountdown(weddingDate: Date, now: Date) {
  const total = Math.max(0, Math.floor((weddingDate.getTime() - now.getTime()) / 1000));
  const koreaDate = (date: Date) => new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const calendarDays = Math.max(0, Math.round((Date.parse(koreaDate(weddingDate)) - Date.parse(koreaDate(now))) / 86400000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
    calendarDays,
    finished: now.getTime() >= weddingDate.getTime(),
  };
}
