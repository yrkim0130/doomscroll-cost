# 💸 DoomScroll Cost (스마트폰 딴짓 비용 계산기)

> **"쇼츠와 릴스를 멍하니 넘기는 동안, 당신의 통장과 미래 자산은 얼마나 증발하고 있을까요?"**

하루 무심코 소비하는 스마트폰 스크롤 시간의 기회비용을 실시간 금화 애니메이션과 금융 데이터로 시각화해 주는 자기계발 마이크로 SaaS입니다.

---

## 🚀 Live Demo
- **웹사이트 바로가기:** [배포 후 생성된 Vercel 링크를 여기에 넣어주세요]

---

## ✨ 핵심 기능 (Features)

### 1. 📊 연간 기회비용 리포트
- **시간 & 시급 맞춤 계산**: 하루 딴짓 시간(0.5h ~ 8h)과 목표 시급을 바탕으로 1년간 증발한 진짜 금액 산출
- **직관적 가치 환산**:
  - 📚 **독서 환산**: 날아간 시간으로 완독할 수 있었던 책 권수
  - 📈 **S&P 500 복리 계산**: 이 돈을 매년 주가지수에 투자했을 때 10년 뒤 얻을 수 있었던 미래 자산 가치

### 2. 💸 실시간 금화 증발 타이머
- 딴짓을 시작하는 순간부터 1초마다 초당 임금 기준 손실액 실시간 카운팅
- 화면 상단에서 금화가 바닥으로 후두둑 떨어지는 물리 애니메이션으로 시각적 경각심 부여

### 3. 📸 SNS 공유 카드 원클릭 생성
- 인스타그램 스토리 / X(트위터) 공유 규격의 고화질 인포그래픽 카드 PNG 다운로드
- 생성 완료 시 축하 폭죽 효과(`canvas-confetti`) 제공

### 4. 🔒 100% 프라이버시 보호
- 별도의 회원가입이나 서버 데이터베이스 저장 없이, 모든 계산과 이미지 생성이 사용자 브라우저 내부에서만 안전하게 동작

---

## 🛠️ 기술 스택 (Tech Stack)

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion, Canvas Confetti
- **Export**: html-to-image
- **Icons**: Lucide React
- **Deploy**: Vercel

---

## 💡 개발 동기
도파민 중독과 무의식적인 숏폼 소비로 인해 잃어버리는 시간의 무게를 숫자로 직접 체감하고, 즉각적인 행동 변화를 이끌어내기 위해 1인 바이브 코딩(Vibe Coding)으로 제작되었습니다.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
