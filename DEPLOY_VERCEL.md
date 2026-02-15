# Vercel 배포 가이드

## 현재 프로젝트 사전 준비 상태
- `vercel.json` 추가 완료
  - Framework: `vite`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- 배포 전 점검 스크립트 추가 완료
  - `npm run check` (테스트 + 빌드)
- 배포 편의 스크립트 추가 완료
  - `npm run deploy:vercel:preview`
  - `npm run deploy:vercel:prod`

## 네가 해야 할 것

### 1) 계정/레포 준비
1. Vercel 계정 생성 또는 로그인
2. 이 프로젝트를 GitHub/GitLab/Bitbucket 저장소에 push

### 2) Vercel 프로젝트 생성 (권장: Git 연동)
1. Vercel Dashboard에서 `Add New...` -> `Project`
2. 저장소 선택 후 Import
3. 설정 확인
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: 저장소 루트(`gamm`)
4. Deploy 실행

### 3) 배포 전 로컬 검증
1. 의존성 설치: `npm install`
2. 검증 실행: `npm run check`

### 4) CLI로 직접 배포(선택)
1. 로그인: `npx vercel login`
2. 프로젝트 연결: `npx vercel link`
3. 프리뷰 배포: `npm run deploy:vercel:preview`
4. 프로덕션 배포: `npm run deploy:vercel:prod`

## 참고
- 현재 프로젝트는 서버/DB 환경변수 없이 동작합니다.
- 나중에 환경변수가 필요해지면 Vercel Project Settings -> Environment Variables에 추가하세요.
