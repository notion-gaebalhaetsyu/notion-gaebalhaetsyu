import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  Heart,
  Copy,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Clock3,
  Check,
  UserRound,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import "./styles.css";
import { homeBanners } from "./bannerConfig";
import filbertImage from "./images/필버트.png";
import mandooImage from "./images/만두.png";
import logoImage from "./images/개발했슈 로고.png";

const widgets = [
  {
    id: 1,
    name: "오늘의 한 조각",
    desc: "매일의 기분과 한 문장을 기록하는 감성 위젯",
    cat: "기록",
    maker: "김빵순",
    emoji: "🍓",
    tone: "pink",
    tags: ["기록", "감성"],
    updated: "2026. 07. 28",
    api: false,
    mobile: true,
  },
  {
    id: 2,
    name: "집중력 오븐 타이머",
    desc: "몰입과 휴식을 반복하는 포모도로 집중 타이머",
    cat: "집중",
    maker: "오븐장갑",
    emoji: "🍞",
    tone: "cream",
    tags: ["집중", "생산성"],
    updated: "2026. 07. 24",
    api: false,
    mobile: true,
  },
  {
    id: 3,
    name: "D-Day 카운트다운",
    desc: "기다리는 날까지 남은 시간을 한눈에 보여줘요",
    cat: "D-Day",
    maker: "코드몽",
    emoji: "🎂",
    tone: "green",
    tags: ["D-Day", "일정"],
    updated: "2026. 07. 18",
    api: false,
    mobile: true,
  },
  {
    id: 4,
    name: "작은 투두 바구니",
    desc: "오늘 해야 할 일을 가볍게 꺼내보는 투두리스트",
    cat: "투두",
    maker: "밀가루요정",
    emoji: "🧺",
    tone: "yellow",
    tags: ["투두", "생활"],
    updated: "2026. 07. 11",
    api: false,
    mobile: true,
  },
  {
    id: 5,
    name: "서울 날씨 창문",
    desc: "노션을 열 때마다 오늘의 날씨를 알려주는 창문",
    cat: "생활",
    maker: "날씨빵",
    emoji: "☀️",
    tone: "blue",
    tags: ["생활", "날씨"],
    updated: "2026. 07. 02",
    api: true,
    mobile: true,
  },
  {
    id: 6,
    name: "디지털 시계빵",
    desc: "심플한 시계와 날짜를 보여주는 기본 위젯",
    cat: "시계",
    maker: "오븐장갑",
    emoji: "🕰️",
    tone: "purple",
    tags: ["시계", "심플"],
    updated: "2026. 06. 28",
    api: false,
    mobile: true,
  },
];
const categories = ["전체", "시계", "D-Day", "집중", "투두", "기록", "생활"];

function App() {
  const [page, setPage] = useState("home"),
    [query, setQuery] = useState(""),
    [cat, setCat] = useState("전체"),
    [selected, setSelected] = useState(null),
    [saved, setSaved] = useState([]),
    [toast, setToast] = useState(""),
    [mobile, setMobile] = useState(false);
  const filtered = useMemo(
    () =>
      widgets.filter(
        (w) =>
          (cat === "전체" || w.cat === cat) &&
          [w.name, w.desc, w.maker, ...w.tags]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [cat, query],
  );
  const go = (p) => {
    setPage(p);
    setSelected(null);
    setMobile(false);
    window.scrollTo(0, 0);
  };
  const toggle = (id) => {
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };
  const copy = (w) => {
    navigator.clipboard?.writeText(
      "https://widgets.gaebalhaetshu.com/embed/" + w.id,
    );
    setToast("노션에 담을 링크를 복사했슈!");
    setTimeout(() => setToast(""), 2600);
  };
  return (
    <div className="shell">
      <header className="top">
        <button
          className="mobile-menu"
          onClick={() => setMobile(!mobile)}
          aria-label="메뉴"
        >
          {mobile ? <X /> : <Menu />}
        </button>
        <button className="logo" onClick={() => go("home")}>
          <span className="logo-mark">🍞</span>
          <span>
            <b>위젯 제빵소</b>
            <small>개발했슈의 무료 노션 위젯</small>
          </span>
        </button>
        <div className="top-actions">
          <span className="demo">DEMO MODE</span>
          <button
            className="login"
            onClick={() =>
              setToast("Google 로그인은 운영 환경 설정 후 연결됩니다.")
            }
          >
            Google로 시작하기
          </button>
        </div>
      </header>
      <div className="layout">
        <aside className={mobile ? "open" : ""}>
          <nav>
            <p className="nav-label">둘러보기</p>
            <Nav
              icon="⌂"
              text="홈"
              active={page === "home"}
              onClick={() => go("home")}
            />
            <Nav
              icon="▦"
              text="위젯 둘러보기"
              active={page === "browse"}
              onClick={() => go("browse")}
            />
            <Nav
              icon="♡"
              text="관심 위젯"
              active={page === "favorites"}
              onClick={() => go("favorites")}
            />
            <p className="nav-label gap">함께 만들기</p>
            <Nav
              icon="♙"
              text="제빵사 소개"
              active={page === "makers"}
              onClick={() => go("makers")}
            />
            <Nav
              icon="✦"
              text="개발했슈 소개"
              active={page === "about"}
              onClick={() => go("about")}
            />
          </nav>
        </aside>
        <main>
          {page === "home" && (
            <Home
              go={go}
              filtered={filtered}
              saved={saved}
              toggle={toggle}
              copy={copy}
            />
          )}{" "}
          {page === "browse" && (
            <Browse
              filtered={filtered}
              cat={cat}
              setCat={setCat}
              query={query}
              setQuery={setQuery}
              saved={saved}
              toggle={toggle}
              open={setSelected}
            />
          )}{" "}
          {page === "favorites" && (
            <Browse
              filtered={widgets.filter((w) => saved.includes(w.id))}
              cat="전체"
              setCat={() => {}}
              query=""
              setQuery={() => {}}
              saved={saved}
              toggle={toggle}
              open={setSelected}
              favorite
            />
          )}{" "}
          {page === "makers" && <Makers go={go} />}{" "}
          {page === "about" && <About />}
          {selected && (
            <Detail
              w={selected}
              close={() => setSelected(null)}
              saved={saved}
              toggle={toggle}
              copy={copy}
            />
          )}
        </main>
      </div>
      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
      <footer className="site-footer">
        <div>
          <b>위젯 제빵소</b>
          <span>슈크림마을 · 개발했슈</span>
        </div>
        <div className="footer-links">
          <a href="#terms">이용약관</a>
          <a href="#privacy">개인정보처리방침</a>
          <span>© 2026 개발했슈. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
function Nav({ icon, text, active, onClick }) {
  return (
    <button className={"nav " + (active ? "active" : "")} onClick={onClick}>
      <span>{icon}</span>
      {text}
      {active && <ChevronRight size={15} />}
    </button>
  );
}
function Home({ go, filtered, saved, toggle, copy }) {
  const [bannerIndex, setBannerIndex] = useState(0);
  const banner = homeBanners[bannerIndex];

  useEffect(() => {
    const timer = window.setInterval(
      () => setBannerIndex((current) => (current + 1) % homeBanners.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="content">
      <div className="news-banner">
        {banner.image ? (
          <a href={banner.href} aria-label={banner.alt}>
            <img src={banner.image} alt={banner.alt} />
          </a>
        ) : (
          <button
            className="banner-fallback"
            onClick={() => go(banner.href === "#makers" ? "makers" : "browse")}
          >
            <span className="banner-orbit orbit-one" />
            <span className="banner-orbit orbit-two" />
            <span className="banner-copy">
              <small>{banner.label}</small>
              <b>{banner.title}</b>
              <em>{banner.text} →</em>
            </span>
          </button>
        )}
        <div className="banner-dots" aria-label="배너 선택">
          {homeBanners.map((item, index) => (
            <button
              key={item.alt}
              className={index === bannerIndex ? "active" : ""}
              onClick={() => setBannerIndex(index)}
              aria-label={`${index + 1}번째 배너`}
            />
          ))}
        </div>
      </div>
      <section className="hero">
        <div>
          <div className="eyebrow">
            <span>DEVELOPED BY 개발했슈</span>
            <span>✦ FREE NOTION WIDGETS</span>
          </div>
          <h1>
            노션에 필요한 기능,
            <br />
            <em>우리가 직접 구웠슈!</em>
          </h1>
          <p>
            개발했슈 제빵사들이 바이브코딩으로 만든
            <br />
            무료 위젯을 구경하고 바로 내 노션에 담아보세요.
          </p>
          <button className="primary" onClick={() => go("browse")}>
            갓 구운 위젯 구경하기 <ArrowRight size={17} />
          </button>
        </div>
        <div className="hero-art">
          <div className="steam">〰　〰</div>
          <div className="bread">🍞</div>
          <div className="plate">
            오늘도
            <br />
            <b>천천히</b>
            <br />
            구워요
          </div>
          <span className="sticker s1">무료예요!</span>
          <span className="sticker s2">
            made with
            <br />
            바이브코딩
          </span>
        </div>
      </section>
      <section className="section-head">
        <div>
          <span className="eyebrow dark">FRESH FROM THE OVEN</span>
          <h2>갓 구운 위젯</h2>
        </div>
        <button className="text-button" onClick={() => go("browse")}>
          전체 보기 <ArrowRight size={16} />
        </button>
      </section>
      <div className="grid">
        {filtered.slice(0, 3).map((w) => (
          <Card key={w.id} w={w} saved={saved} toggle={toggle} copy={copy} />
        ))}
      </div>
      <section className="how">
        <div>
          <span className="eyebrow dark">HOW TO USE</span>
          <h2>
            마음에 드는 위젯,
            <br />세 단계면 충분해요.
          </h2>
        </div>
        <div className="steps">
          <Step n="01" t="구경하기" d="내게 필요한 위젯을 찾아요" />
          <Step n="02" t="미리보기" d="내 노션에 어울리는지 써봐요" />
          <Step n="03" t="담아가기" d="링크를 복사해 노션에 붙여요" />
        </div>
      </section>
    </div>
  );
}
function Step({ n, t, d }) {
  return (
    <div className="step">
      <b>{n}</b>
      <span>{t}</span>
      <small>{d}</small>
    </div>
  );
}
function Card({ w, saved, toggle, copy }) {
  return (
    <article className="card">
      <div className={"preview " + w.tone}>
        <span className="card-emoji">{w.emoji}</span>
        <span className="preview-label">{w.cat}</span>
        <button
          className={"heart " + (saved.includes(w.id) ? "selected" : "")}
          onClick={() => toggle(w.id)}
          aria-label="관심 위젯"
        >
          {saved.includes(w.id) ? "♥" : "♡"}
        </button>
        <div className="preview-copy">
          {w.cat === "집중" ? "25:00" : w.name}
        </div>
      </div>
      <div className="card-body">
        <div className="card-title">
          <h3>{w.name}</h3>
          {w.api && <span className="badge">API</span>}
        </div>
        <p>{w.desc}</p>
        <div className="maker">
          <span className="avatar">{w.maker[0]}</span>
          {w.maker}
          <span className="card-arrow" onClick={() => copy(w)}>
            <Copy size={14} /> 링크 복사
          </span>
        </div>
      </div>
    </article>
  );
}
function Browse({
  filtered,
  cat,
  setCat,
  query,
  setQuery,
  saved,
  toggle,
  open,
  favorite,
}) {
  return (
    <div className="content browse">
      <div className="page-intro">
        <div>
          <span className="eyebrow dark">
            {favorite ? "MY COLLECTION" : "WIDGET LIBRARY"}
          </span>
          <h1>{favorite ? "내가 찜한 위젯" : "위젯 둘러보기"}</h1>
          <p>
            {favorite
              ? "다시 쓰고 싶은 위젯을 모아두었어요."
              : "필요한 기능을 고르고, 내 노션에 바로 담아가세요."}
          </p>
        </div>
        <div className="search">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="위젯, 제작자 검색"
          />
        </div>
      </div>
      {!favorite && (
        <div className="filters">
          {categories.map((c) => (
            <button
              className={cat === c ? "on" : ""}
              onClick={() => setCat(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="result-row">
        <b>{filtered.length}개의 위젯</b>
        <span>최신 등록순</span>
      </div>
      <div className="grid">
        {filtered.map((w) => (
          <div onClick={() => open(w)} key={w.id}>
            <Card
              w={w}
              saved={saved}
              toggle={toggle}
              copy={(e) => {
                e?.stopPropagation?.();
              }}
            />
          </div>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty">
          <span>🥐</span>
          <h2>아직 찜한 위젯이 없어요</h2>
          <p>마음에 드는 위젯의 하트를 눌러 담아보세요.</p>
        </div>
      )}
    </div>
  );
}
function Detail({ w, close, saved, toggle, copy }) {
  return (
    <div className="modal-back" onClick={close}>
      <div className="detail" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={close}>
          <X />
        </button>
        <div className={"detail-preview " + w.tone}>
          <span>{w.emoji}</span>
          <b>{w.name}</b>
          <small>실시간 미리보기 · 데모</small>
          <div className="mock-widget">
            {w.cat === "집중"
              ? "25:00"
              : w.cat === "시계"
                ? "09:41"
                : "오늘의 " + w.cat}
          </div>
        </div>
        <div className="detail-body">
          <span className="eyebrow dark">
            {w.cat} · {w.updated} 업데이트
          </span>
          <h2>{w.name}</h2>
          <p className="lead">{w.desc}</p>
          <div className="detail-actions">
            <button className="primary" onClick={() => copy(w)}>
              <Copy size={17} /> 임베드 링크 복사
            </button>
            <button
              className={"outline " + (saved.includes(w.id) ? "liked" : "")}
              onClick={() => toggle(w.id)}
            >
              <Heart
                size={17}
                fill={saved.includes(w.id) ? "currentColor" : "none"}
              />{" "}
              {saved.includes(w.id) ? "관심 저장됨" : "관심 위젯"}
            </button>
          </div>
          <div className="facts">
            <Fact t="무료 여부" v="무료" />
            <Fact t="로그인" v="필요 없음" />
            <Fact t="모바일" v={w.mobile ? "지원해요" : "확인 중"} />
            <Fact t="외부 API" v={w.api ? "사용해요" : "사용하지 않아요"} />
          </div>
          <h3>이렇게 사용해요</h3>
          <ol>
            <li>
              노션 페이지에서 <b>/embed</b>를 입력해요.
            </li>
            <li>복사한 링크를 붙여넣어요.</li>
            <li>위젯 크기를 내 취향대로 조절해요.</li>
          </ol>
          <div className="detail-maker">
            <span className="avatar">{w.maker[0]}</span>
            <div>
              <small>만든 제빵사</small>
              <b>{w.maker}</b>
            </div>
            <ArrowRight size={17} />
          </div>
        </div>
      </div>
    </div>
  );
}
function Fact({ t, v }) {
  return (
    <div>
      <small>{t}</small>
      <b>{v}</b>
    </div>
  );
}
function Makers({ go }) {
  const profiles = [
    {
      name: "필버트",
      role: "제빵사 · 리포터",
      image: filbertImage,
      portfolio: "https://developer-snoopy.github.io/",
      details: (
        <div className="maker-bullets">
          <p>• AI대학원 박사과정 재학 중 (수료)</p>
          <p>• 노션 앰버서더 / 공식 템플릿 제작자</p>
          <p>• 기술 개발 및 창업 관련 경진대회 다수 수상</p>
          <p className="nested">
            • 한국항공우주연구원 창업 아카데미 최우수 수상
          </p>
          <p>• 네이버 테크 분야 블로거 (지수: 최적 2+)</p>
          <p className="nested">• 블로그 이웃: 2,961명</p>
          <p>• Microsoft 광주전남 테크 커뮤니티 회원</p>
        </div>
      ),
    },
    {
      name: "만두",
      role: "제빵메이트 · 우수 슈포터즈",
      image: mandooImage,
      portfolio: "https://github.com/CLM-BONNY/CLM-BONNY",
      details: (
        <div className="maker-bullets">
          <p>• AI 엔지니어 재직중</p>
          <p className="nested">(정부부처 NLP·LLM 기반 서비스 개발 및 운영)</p>
          <p>• 노션 공식 템플릿 제작자</p>
          <p>• 네이버 커넥트재단, 알파코, 줄라마코리아 등 코딩 교육 코치</p>
          <p>• 네이버 커넥트재단 부스트캠프 AI Tech 7기</p>
          <p className="nested">• 네이버클라우드 기업 해커톤 1위</p>
        </div>
      ),
    },
  ];
  return (
    <div className="content">
      <div className="page-intro simple">
        <div>
          <span className="eyebrow dark">THE BAKERS</span>
          <h1>제빵사 소개</h1>
          <p>
            아이디어를 반죽하고, 쓸모 있는 도구를 구워내는 개발했슈 멤버들의
            동반자
          </p>
        </div>
      </div>
      <div className="maker-profiles">
        {profiles.map((profile) => (
          <article className="maker-profile" key={profile.name}>
            <div className="maker-profile-image">
              <img src={profile.image} alt={`${profile.name} 캐릭터`} />
            </div>
            <div className="maker-profile-body">
              <span className="eyebrow dark">{profile.role}</span>
              <h2>{profile.name}</h2>
              <div className="maker-table">{profile.details}</div>
              <a
                className="portfolio-link"
                href={profile.portfolio}
                target="_blank"
                rel="noreferrer"
              >
                포트폴리오 보러 가기 <ArrowRight size={15} />
              </a>
            </div>
          </article>
        ))}
      </div>
      <div className="maker-quote">
        바이브 코딩을 해보고 싶은데 어떤 것부터 해야 할지 잘 모르는 친구들
        환영!!
      </div>
    </div>
  );
}
function About() {
  return (
    <div className="content about">
      <div className="about-brand">
        <img src={logoImage} alt="개발했슈 로고" />
        <div>
          <span className="eyebrow dark">ABOUT GAEBALHAETSHU</span>
          <h1>
            개발했슈는
            <br />
            <em>어떤 동아리인가요?</em>
          </h1>
        </div>
      </div>
      <p className="about-lead">
        “노션에 필요하고, 내가 만들고 싶은 기능”을 실제로 구현하고 검증하면서
        <br />
        기획부터 개발·QA·배포까지 경험을 쌓는 바이브코딩 동아리입니다.
      </p>
      <section className="about-section">
        <div className="about-section-title">
          <span>01</span>
          <h2>활동 목적</h2>
        </div>
        <p>
          노션 기능과 노션 위젯 등, 직접 만들고 싶은 아이디어를 실제 제품으로
          구현하고 검증하면서 실전 경험을 만듭니다.
        </p>
      </section>
      <section className="about-section">
        <div className="about-section-title">
          <span>02</span>
          <h2>활동 목표</h2>
        </div>
        <p>
          개발했슈 워크북을 바탕으로 아이디어를 기획하고, 프로토타입을 거쳐 최종
          버전까지 완성·배포합니다.
        </p>
      </section>
      <section className="about-section activity">
        <div className="about-section-title">
          <span>03</span>
          <h2>활동 내용</h2>
        </div>
        <p>
          8주 커리큘럼으로 위젯과 기능을 기획 → 조사 → 개발 → 피드백 → 배포까지
          완주합니다.
        </p>
        <div className="timeline">
          {[
            ["1–2주차", "기획 · 자료조사", "기획서 작성, 레퍼런스·API 조사"],
            ["3–5주차", "개발", "기초 위젯 → MVP → 최종 완성·최적화"],
            ["6–7주차", "피드백", "슬랙 요청·수집 → 선별·반영·기록"],
            ["8주차", "배포 · 마무리", "배포 링크 공유, GitHub·최종 레포 정리"],
          ].map(([week, title, desc]) => (
            <div key={week}>
              <b>{week}</b>
              <strong>{title}</strong>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="about-section">
        <div className="about-section-title">
          <span>04</span>
          <h2>우리의 피드백 루프</h2>
        </div>
        <p>
          Slack 스레드를 중심으로 공유 → 피드백 → 개선의 빠른 루프를 만들고, 주
          1회 진행 상황을 공유합니다. 월 1회 베타테스터 피드백 2건 이상을 수집해
          품질을 개선하고 결과물을 문서화·아카이빙합니다.
        </p>
      </section>
      <div className="about-note">
        🍕 위젯을 직접 개발해보면서, 기획과 개발 경험을 모두 쌓아보는 건
        어떨까요?
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
