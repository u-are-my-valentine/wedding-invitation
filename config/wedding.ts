import type { WeddingConfig } from "@/types/wedding";

// 실제 정보로 교체할 때는 이 파일만 수정하면 됩니다.
export const weddingConfig: WeddingConfig = {
  couple: {
    groom: {
      name: "곽재현",
      father: { name: "곽원영" },
      mother: { name: "전영란" },
    },
    bride: {
      name: "정연수",
      father: { name: "정재현" },
      mother: { name: "이상희" },
    },
  },
  wedding: {
    date: "2027-02-14",
    time: "12:30",
    durationMinutes: 90,
    venueName: "드레스가든",
    address: "서울특별시 강남구 영동대로 707",
    lotAddress: "서울특별시 강남구 청담동 71-8",
    mapUrl: "https://naver.me/55rmbsR7",
  },
  invitation: {
    eyebrow: "THE WEDDING DAY",
    title: "초대합니다",
    message: [
      "첫 만남엔 선후배로,\n두번째 만남엔 잘 맞는 친구로,\n그 후에는 연인으로 10년을 함께했습니다.\n이제는 부부로 인생을 함께하려 합니다.\n\n자리하시어 저희의 시작을 축하해 주신다면\n더할 나위 없이 기쁜 하루가 될 것입니다.",
    ],
  },
  gallery: [
    ["0100", 3729, 5593],
    ["0177", 3917, 5875],
    ["0316", 3917, 5875],
    ["0392", 3917, 5875],
    ["0463", 3815, 5722],
    ["0644", 4000, 6000],
    ["0807", 3905, 5857],
    ["0922", 3812, 5717],
    ["1133", 3890, 5835],
    ["1186", 3917, 5875],
    ["1330", 6000, 4000],
    ["1420", 6000, 4000],
    ["1439", 3930, 5895],
    ["1471", 3905, 5857],
    ["1499", 3870, 5805],
  ].map(([id, width, height], index) => ({
    src: `/images/wedding/${id}.webp`,
    alt: `곽재현과 정연수의 웨딩 사진 ${index + 1}`,
    width: Number(width),
    height: Number(height),
  })),
  transport: [
    { label: "지하철", description: "7호선 청담역 13번 출구에서 도보 1분" },
    { label: "주차 안내", description: "웨딩홀 주차장 이용 - 2시간 무료" },
  ],
  accounts: {
    groom: [
      { label: "신랑", holder: "곽재현", bank: "신한은행", number: "110-000-000000" },
      { label: "아버지", holder: "곽원영", bank: "우리은행", number: "1002-000-000000" },
    ],
    bride: [
      { label: "신부", holder: "정연수", bank: "하나은행", number: "110-000-000000" },
      { label: "아버지", holder: "정재현", bank: "국민은행", number: "000000-00-000000" },
    ],
  },
  features: { rsvp: false, guestbook: false, music: false },
  share: {
    title: "곽재현 ♥ 정연수, 결혼합니다",
    description: "2027년 2월 14일 일요일 오후 12시 30분 · 드레스가든",
    image: "/og.png?v=color-photo-20260916",
  },
  searchEngineIndex: false,
};
