import Link from "next/link";

const css = `
  .mdb *{box-sizing:border-box;margin:0;padding:0}
  .mdb{--g:#1B4D2E;--g2:#123822;--mint:#3AE18B;--cream:#F4F1E8;
    position:relative;width:100%;max-width:1200px;margin:0 auto;aspect-ratio:1200/440;
    background:radial-gradient(120% 140% at 85% 10%,#24613b 0%,var(--g) 45%,var(--g2) 100%);
    border-radius:18px;overflow:hidden;color:#fff;direction:rtl;
    font-family:"Cairo","Segoe UI",Tahoma,Arial,sans-serif}
  .mdb .logo{position:absolute;top:22px;right:28px;width:130px;z-index:5}
  .mdb .logo img{width:100%;height:auto;display:block}
  .mdb .scene{position:absolute;inset:0;display:grid;grid-template-columns:46% 54%;align-items:center;
    padding:70px 40px 44px;opacity:0;animation:12s infinite both}
  .mdb .s1{animation-name:mdS1}.mdb .s2{animation-name:mdS2}.mdb .s3{animation-name:mdS3}
  @keyframes mdS1{0%,30%{opacity:1}33.4%,97%{opacity:0}100%{opacity:1}}
  @keyframes mdS2{0%,30%{opacity:0}33.4%,63.4%{opacity:1}66.7%,100%{opacity:0}}
  @keyframes mdS3{0%,63.4%{opacity:0}66.7%,97%{opacity:1}100%{opacity:0}}
  .mdb .txt{padding-left:10px}
  .mdb .kick{display:inline-block;font-size:15px;font-weight:700;color:var(--mint);letter-spacing:.2px;margin-bottom:10px}
  .mdb h2{font-size:38px;line-height:1.3;font-weight:800}
  .mdb h2 em{font-style:normal;color:var(--mint)}
  .mdb .en{direction:ltr;text-align:right;font-size:15px;color:#cfe3d6;margin-top:12px;line-height:1.45}
  .mdb .art svg{width:100%;height:auto;display:block}
  /* text entrances */
  .mdb .s1 .in{animation:mdT1 12s infinite both}
  .mdb .s2 .in{animation:mdT2 12s infinite both}
  .mdb .s3 .in{animation:mdT3 12s infinite both}
  .mdb .d1{animation-delay:.25s!important}.mdb .d2{animation-delay:.5s!important}.mdb .d3{animation-delay:.75s!important}
  @keyframes mdT1{0%{opacity:0;transform:translateY(14px)}4%,100%{opacity:1;transform:none}}
  @keyframes mdT2{0%,33.4%{opacity:0;transform:translateY(14px)}37.5%,100%{opacity:1;transform:none}}
  @keyframes mdT3{0%,66.7%{opacity:0;transform:scale(.85)}70%{opacity:1;transform:scale(1.04)}72%,100%{opacity:1;transform:none}}
  /* scene 1 art */
  .mdb .smoke{animation:mdSmoke 3s infinite ease-out;transform-box:fill-box;transform-origin:center}
  .mdb .smoke.b{animation-delay:1s}.mdb .smoke.c{animation-delay:2s}
  @keyframes mdSmoke{0%{opacity:0;transform:translateY(0) scale(.6)}20%{opacity:.8}100%{opacity:0;transform:translateY(-44px) scale(1.5)}}
  .mdb .queue{animation:mdCreep 2.4s infinite ease-in-out}
  @keyframes mdCreep{0%,100%{transform:translateX(0)}50%{transform:translateX(-6px)}}
  .mdb .tiny{animation:mdWait 1.2s infinite ease-in-out;transform-box:fill-box;transform-origin:bottom center}
  @keyframes mdWait{0%,100%{transform:rotate(0)}25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}
  .mdb .hand{animation:mdSpin 1.5s infinite linear;transform-origin:500px 150px}
  @keyframes mdSpin{to{transform:rotate(360deg)}}
  /* scene 2 art */
  .mdb .truck{animation:mdDrive 12s infinite both}
  @keyframes mdDrive{0%,57%{transform:translateX(0)}66.7%,100%{transform:translateX(620px)}}
  .mdb .box{animation:mdDrop 12s infinite both}
  .mdb .box.b2{animation-delay:.35s}.mdb .box.b3{animation-delay:.7s}.mdb .box.b4{animation-delay:1.05s}.mdb .box.b5{animation-delay:1.4s}
  @keyframes mdDrop{0%,34%{transform:translateY(-240px);opacity:0}38%{transform:translateY(0);opacity:1}39.5%{transform:translateY(-10px)}41%,100%{transform:translateY(0);opacity:1}}
  .mdb .speed line{animation:mdSpeed .6s infinite linear}
  @keyframes mdSpeed{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-40}}
  /* scene 3 art */
  .mdb .burst{animation:mdRot 18s infinite linear;transform-origin:280px 165px}
  @keyframes mdRot{to{transform:rotate(360deg)}}
  .mdb .hero{animation:mdHero 12s infinite both;transform-box:fill-box;transform-origin:bottom center}
  @keyframes mdHero{0%,66.7%{transform:translateY(30px) scale(.6);opacity:0}71%{transform:translateY(-8px) scale(1.08);opacity:1}74%,100%{transform:none;opacity:1}}
  .mdb .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
  .mdb .chip{font-size:13px;font-weight:700;background:rgba(255,255,255,.1);border:1px solid rgba(58,225,139,.45);padding:6px 12px;border-radius:999px}
  .mdb .cta{display:inline-flex;gap:10px;align-items:center;margin-top:18px;background:var(--mint);color:#0b2615;font-weight:800;
    font-size:16px;padding:11px 22px;border-radius:10px;text-decoration:none}
  .mdb .cta small{font-weight:600;font-size:12px;opacity:.75}
  /* progress */
  .mdb .prog{position:absolute;bottom:18px;left:40px;display:flex;gap:6px;z-index:5;direction:ltr}
  .mdb .prog i{display:block;width:34px;height:4px;border-radius:4px;background:rgba(255,255,255,.2);overflow:hidden}
  .mdb .prog i b{display:block;height:100%;width:100%;background:var(--mint);transform-origin:left;animation:12s infinite linear both}
  .mdb .prog i:nth-child(1) b{animation-name:mdP1}.mdb .prog i:nth-child(2) b{animation-name:mdP2}.mdb .prog i:nth-child(3) b{animation-name:mdP3}
  @keyframes mdP1{0%{transform:scaleX(0)}33.3%{transform:scaleX(1)}33.4%,100%{transform:scaleX(0)}}
  @keyframes mdP2{0%,33.3%{transform:scaleX(0)}66.6%{transform:scaleX(1)}66.7%,100%{transform:scaleX(0)}}
  @keyframes mdP3{0%,66.6%{transform:scaleX(0)}99.9%{transform:scaleX(1)}100%{transform:scaleX(0)}}
  @media (max-width:760px){
    .mdb{aspect-ratio:auto;height:600px}
    .mdb .scene{grid-template-columns:1fr;grid-template-rows:auto 1fr;padding:74px 22px 40px;align-items:start}
    .mdb h2{font-size:28px}.mdb .en{font-size:13.5px}.mdb .logo{width:110px;top:18px;right:20px}
    .mdb .art{align-self:end}.mdb .prog{left:22px}
  }
  @media (prefers-reduced-motion:reduce){
    .mdb .scene,.mdb .scene *,.mdb .prog b{animation:none!important}
    .mdb .s1,.mdb .s2{opacity:0}.mdb .s3{opacity:1}
  }
`;

export default function SmallOrdersBanner() {
  return (
    <>
      <style>{css}</style>
      <section className="mdb" aria-label="Small orders, full priority — Mass Distribution">
        <div className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/md-logo-white.svg" alt="Mass Distribution" width="130" height="47" />
        </div>

        {/* SCENE 1: the problem */}
        <div className="scene s1">
          <div className="txt">
            <span className="kick in">بتطلب من المصنع على طول؟</span>
            <h2 className="in d1">أوردرك صغير…<br /><em>يبقى استنى دورك.</em></h2>
            <p className="en in d2">Ordering straight from the manufacturer? Small orders wait at the back of the line.</p>
          </div>
          <div className="art">
            <svg viewBox="0 0 620 330" aria-hidden="true">
              <line x1="0" y1="282" x2="620" y2="282" stroke="rgba(255,255,255,.25)" strokeWidth="2"/>
              {/* factory */}
              <g fill="#6f8a7a">
                <rect x="18" y="140" width="190" height="142" rx="4"/>
                <path d="M18 140 L18 105 L66 140 L66 105 L114 140 L114 105 L162 140 L162 105 L208 140 Z"/>
                <rect x="165" y="78" width="26" height="50"/>
              </g>
              <circle className="smoke" cx="178" cy="70" r="11" fill="#cfd8d3"/>
              <circle className="smoke b" cx="182" cy="68" r="9" fill="#cfd8d3"/>
              <circle className="smoke c" cx="174" cy="69" r="10" fill="#cfd8d3"/>
              <rect x="88" y="212" width="54" height="70" rx="3" fill="#3f5a4a"/>
              <text x="113" y="186" textAnchor="middle" fontSize="15" fontWeight="700" fill="#e7efe9">المصنع</text>
              {/* big orders queue */}
              <g className="queue" fontSize="12" fontWeight="700" textAnchor="middle" fill="#123822">
                <g><rect x="222" y="190" width="78" height="92" rx="4" fill="#b9c9bf"/><rect x="222" y="220" width="78" height="2" fill="#8fa596"/><rect x="222" y="251" width="78" height="2" fill="#8fa596"/><text x="261" y="210">١٢٠٠ كرتونة</text></g>
                <g><rect x="310" y="206" width="72" height="76" rx="4" fill="#b9c9bf"/><rect x="310" y="236" width="72" height="2" fill="#8fa596"/><text x="346" y="226">٨٠٠ كرتونة</text></g>
                <g><rect x="392" y="218" width="66" height="64" rx="4" fill="#b9c9bf"/><rect x="392" y="248" width="66" height="2" fill="#8fa596"/><text x="425" y="238">٥٠٠ كرتونة</text></g>
              </g>
              {/* the small customer */}
              <g className="tiny">
                <rect x="478" y="238" width="44" height="44" rx="4" fill="#3AE18B"/>
                <path d="M478 252 H522" stroke="#1B4D2E" strokeWidth="2"/>
                <text x="500" y="300" textAnchor="middle" fontSize="13" fontWeight="800" fill="#3AE18B">أوردرك</text>
              </g>
              {/* clock */}
              <circle cx="500" cy="150" r="30" fill="none" stroke="#fff" strokeWidth="3"/>
              <line x1="500" y1="150" x2="500" y2="132" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
              <line className="hand" x1="500" y1="150" x2="518" y2="150" stroke="#3AE18B" strokeWidth="3" strokeLinecap="round"/>
              <text x="500" y="202" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">مستني…</text>
            </svg>
          </div>
        </div>

        {/* SCENE 2: the solution */}
        <div className="scene s2">
          <div className="txt">
            <span className="kick in">مع Mass Distribution</span>
            <h2 className="in d1">كل الماركات اللي محتاجها<br /><em>في أوردر واحد… وعربية واحدة.</em></h2>
            <p className="en in d2">Every brand you need. One order, one invoice, one delivery.</p>
          </div>
          <div className="art">
            <svg viewBox="0 0 620 330" aria-hidden="true">
              <line x1="0" y1="282" x2="620" y2="282" stroke="rgba(255,255,255,.25)" strokeWidth="2"/>
              <g className="truck">
                <g className="speed" stroke="#3AE18B" strokeWidth="5" strokeLinecap="round" strokeDasharray="26 14">
                  <line x1="-10" y1="170" x2="52" y2="170"/><line x1="4" y1="198" x2="52" y2="198"/><line x1="-20" y1="226" x2="52" y2="226"/><line x1="10" y1="254" x2="52" y2="254"/>
                </g>
                {/* cargo bed */}
                <rect x="60" y="150" width="340" height="112" rx="6" fill="#0f2e1c" stroke="#3AE18B" strokeWidth="3"/>
                {/* boxes */}
                <g fontSize="14" fontWeight="800" textAnchor="middle">
                  <g className="box b1"><rect x="72" y="196" width="60" height="62" rx="4" fill="#F4F1E8"/><text x="102" y="233" fill="#1B4D2E">ألبان</text></g>
                  <g className="box b2"><rect x="138" y="196" width="60" height="62" rx="4" fill="#F7D774"/><text x="168" y="233" fill="#3d2f00">زيوت</text></g>
                  <g className="box b3"><rect x="204" y="196" width="60" height="62" rx="4" fill="#F29E6B"/><text x="234" y="233" fill="#3b1600">مكرونة</text></g>
                  <g className="box b4"><rect x="270" y="196" width="60" height="62" rx="4" fill="#8FC7F2"/><text x="300" y="233" fill="#0c2a42">مشروبات</text></g>
                  <g className="box b5"><rect x="336" y="196" width="58" height="62" rx="4" fill="#E9707A"/><text x="365" y="233" fill="#3a0006">صوصات</text></g>
                </g>
                {/* cab */}
                <path d="M404 180 H470 L512 222 V262 H404 Z" fill="#3AE18B"/>
                <path d="M418 192 H464 L494 222 H418 Z" fill="#0f2e1c"/>
                {/* wheels */}
                <g fill="#0b1a12" stroke="#cfe3d6" strokeWidth="4"><circle cx="118" cy="268" r="20"/><circle cx="330" cy="268" r="20"/><circle cx="462" cy="268" r="20"/></g>
              </g>
            </svg>
          </div>
        </div>

        {/* SCENE 3: the promise */}
        <div className="scene s3">
          <div className="txt">
            <h2 className="in">الكمية صغيرة؟</h2>
            <h2 className="in d1"><em>الأولوية كاملة.</em></h2>
            <p className="en in d2" style={{ fontSize: "18px", color: "#fff", fontWeight: 700 }}>Small orders. Full priority.</p>
            <div className="chips in d3">
              <span className="chip">ماركات كتير · أوردر واحد</span>
              <span className="chip">توصيل خلال ٢٤ إلى ٤٨ ساعة</span>
              <span className="chip">القاهرة والجيزة</span>
            </div>
            <Link className="cta in d3" href="/products">اطلب دلوقتي <small>Order now</small></Link>
          </div>
          <div className="art">
            <svg viewBox="0 0 620 330" aria-hidden="true">
              <g className="burst" fill="rgba(58,225,139,.14)">
                <path d="M280 165 L280 -60 L330 -60 Z"/><path d="M280 165 L480 30 L500 70 Z"/><path d="M280 165 L560 190 L550 235 Z"/>
                <path d="M280 165 L440 360 L400 380 Z"/><path d="M280 165 L150 380 L110 360 Z"/><path d="M280 165 L0 230 L -10 185 Z"/>
                <path d="M280 165 L40 40 L70 10 Z"/><path d="M280 165 L180 -60 L225 -60 Z"/>
              </g>
              <ellipse cx="280" cy="286" rx="120" ry="14" fill="rgba(0,0,0,.25)"/>
              <g className="hero">
                <rect x="220" y="160" width="120" height="120" rx="8" fill="#3AE18B"/>
                <path d="M220 196 H340" stroke="#1B4D2E" strokeWidth="4"/>
                <path d="M268 160 V196 M292 160 V196" stroke="#1B4D2E" strokeWidth="4"/>
                <text x="280" y="248" textAnchor="middle" fontSize="22" fontWeight="800" fill="#0b2615">أوردرك</text>
                <path d="M280 112 l10 20 22 3 -16 15 4 22 -20 -11 -20 11 4 -22 -16 -15 22 -3z" fill="#F7D774"/>
              </g>
            </svg>
          </div>
        </div>

        <div className="prog" aria-hidden="true"><i><b></b></i><i><b></b></i><i><b></b></i></div>
      </section>
    </>
  );
}
