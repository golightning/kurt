# -*- coding: utf-8 -*-
"""Baut beide KURT-Werbeclips (quer + hoch) aus einer Quelle.
Absender ist die Spedition, nicht der Entwickler: keine Byte-Zahlen,
keine Screenshots, keine Rede von einer neuen Website."""
import io, os

SLATE = open('/tmp/_slate.txt').read()
RED   = open('/tmp/_red.txt').read()

ROOT = '/Users/tolgahisir/Desktop/Dev/kurt/brag-output/composition'

def zmark(eid, cls, animated=True):
    sid = f'{eid}-slate' if animated else ''
    rid = f'{eid}-red' if animated else ''
    return f'''<svg class="{cls}" id="{eid}" viewBox="-565.2 -506.0 1212.0 1168.2" fill="none" aria-hidden="true">
          <path {f'id="{sid}" ' if sid else ''}d="{SLATE}" fill="#708296" />
          <path {f'id="{rid}" ' if rid else ''}d="{RED}" fill="#e20613" />
        </svg>'''

# ---------------------------------------------------------------- Route
# Stationen 1:1 aus src/components/RouteLine.tsx (x/y in Prozent).
STOPS = [(3,46,'Ulm'),(22,38,'München'),(41,33,'Wien'),(59,39,'Budapest'),(75,52,'Belgrad'),(94,64,'Istanbul')]
BRANCH = [(75,52,''),(80,74,''),(86,88,'Thessaloniki')]

def route_svg(w, h, fs):
    """Die Relation als eigene Grafik — gezeichnet, nicht abfotografiert."""
    pts = ' '.join(f'{x*w/100:.1f},{y*h/100:.1f}' for x,y,_ in STOPS)
    bpts = ' '.join(f'{x*w/100:.1f},{y*h/100:.1f}' for x,y,_ in BRANCH)
    dots, labels = [], []
    for i,(x,y,n) in enumerate(STOPS):
        cx, cy = x*w/100, y*h/100
        last = (i == len(STOPS)-1)
        dots.append(f'<circle class="rt-dot" cx="{cx:.1f}" cy="{cy:.1f}" r="{9 if last else 6}" fill="{"#ff4a3d" if last else "#f4f4f6"}" />')
        anchor = 'start' if x < 12 else ('end' if x > 82 else 'middle')
        labels.append(f'<text class="rt-label" x="{cx:.1f}" y="{cy-22:.1f}" text-anchor="{anchor}" font-size="{fs}" font-family="Inter" font-weight="600" fill="{"#ff4a3d" if last else "#f4f4f6"}">{n}</text>')
    bx, by, bn = BRANCH[-1]
    labels.append(f'<text class="rt-label" x="{bx*w/100:.1f}" y="{by*h/100+40:.1f}" text-anchor="end" font-size="{fs}" font-family="Inter" font-weight="600" fill="#f4f4f6">{bn}</text>')
    dots.append(f'<circle class="rt-dot" cx="{bx*w/100:.1f}" cy="{by*h/100:.1f}" r="6" fill="#f4f4f6" />')
    return f'''<svg id="rt-svg" viewBox="0 0 {w} {h}" style="width:100%;height:auto;overflow:visible">
            <polyline id="rt-main" points="{pts}" fill="none" stroke="#e20613" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <polyline id="rt-branch" points="{bpts}" fill="none" stroke="#e20613" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round" opacity="0.75" />
            <g id="rt-dots">{''.join(dots)}</g>
            <g id="rt-labels">{''.join(labels)}</g>
          </svg>'''

# ---------------------------------------------------------------- Auflieger
def trailer_svg(fs):
    """Der Auflieger bemasst sich selbst: Umriss, Hoehe, Laenge, Haengestangen."""
    bars = ''.join(
        f'<line class="tr-bar" x1="{270+i*58}" y1="104" x2="{270+i*58}" y2="272" stroke="#9b9ba6" stroke-width="2" />'
        for i in range(12))
    return f'''<svg id="tr-svg" viewBox="0 0 1100 450" style="width:100%;height:auto;overflow:visible">
            <rect id="tr-body" x="250" y="96" width="740" height="185" fill="none" stroke="#f4f4f6" stroke-width="3" />
            <g id="tr-bars">{bars}</g>
            <path id="tr-nose" d="M250 281 L150 281 L120 240 L120 200 L250 200" fill="none" stroke="#f4f4f6" stroke-width="3" />
            <circle id="tr-w1" cx="880" cy="305" r="24" fill="none" stroke="#f4f4f6" stroke-width="3" />
            <circle id="tr-w2" cx="945" cy="305" r="24" fill="none" stroke="#f4f4f6" stroke-width="3" />
            <circle id="tr-w3" cx="168" cy="305" r="24" fill="none" stroke="#f4f4f6" stroke-width="3" />
            <g id="tr-h">
              <line x1="1035" y1="96" x2="1035" y2="281" stroke="#ff4a3d" stroke-width="2" />
              <line x1="1023" y1="96" x2="1047" y2="96" stroke="#ff4a3d" stroke-width="2" />
              <line x1="1023" y1="281" x2="1047" y2="281" stroke="#ff4a3d" stroke-width="2" />
              <text x="1062" y="196" font-size="{fs}" font-family="Inter" font-weight="600" fill="#ff4a3d">2,75 m</text>
            </g>
            <g id="tr-l">
              <line x1="250" y1="372" x2="990" y2="372" stroke="#ff4a3d" stroke-width="2" />
              <line x1="250" y1="360" x2="250" y2="384" stroke="#ff4a3d" stroke-width="2" />
              <line x1="990" y1="360" x2="990" y2="384" stroke="#ff4a3d" stroke-width="2" />
              <text x="620" y="412" text-anchor="middle" font-size="{fs}" font-family="Inter" font-weight="600" fill="#ff4a3d">13,60 m Ladelänge</text>
            </g>
          </svg>'''

SERVICES = [
    ('Filialbelieferung', 'ohne Rampe — über die Hebebühne ebenerdig'),
    ('Bekleidung hängend', 'bis 3-fach gehängt im Textil-Koffersattel'),
    ('Temperaturgeführt', 'Frische und TK, lückenlos protokolliert'),
    ('Schwer- und Sondertransport', 'Projektladung über Straße, Schiene, See'),
]

def build(fmt):
    V = fmt == 'vertical'
    W, H = (1080, 1920) if V else (1920, 1080)
    pad = 110 if V else 150
    # Typo-Stufen pro Format
    t = dict(
        hook   = 74 if V else 86,
        head   = 62 if V else 72,
        lead   = 32 if V else 34,
        eyebrow= 28 if V else 28,
        svc    = 40 if V else 46,
        svcsub = 28 if V else 28,
        badge  = 28 if V else 29,
        outro  = 54 if V else 62,
        mark   = 230 if V else 280,
    )
    rw, rh = (900, 760) if V else (1500, 620)
    rfs = 32 if V else 28
    trfs = 38 if V else 30

    svc_rows = ''.join(f'''
          <div class="svc" id="svc-{i}">
            <span class="svc-n">{i+1:02d}</span>
            <div>
              <div class="svc-t">{a}</div>
              <div class="svc-s">{b}</div>
            </div>
          </div>''' for i,(a,b) in enumerate(SERVICES))

    photo_block = (f'''<div class="ph-row" id="s5-photos">
            <img class="ph" id="ph-1" src="assets/textil.webp" alt="" />
            <img class="ph" id="ph-2" src="assets/kuehl.webp" alt="" />
          </div>''')

    html = f'''<!doctype html>
<html lang="de" data-resolution="{'vertical' if V else 'landscape'}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face {{ font-family:'Archivo'; src:url('fonts/archivo.woff2') format('woff2'); font-weight:100 900; font-display:block; }}
      @font-face {{ font-family:'Inter';   src:url('fonts/inter.woff2')   format('woff2'); font-weight:100 900; font-display:block; }}
      :root {{
        --ink:#08080a; --ink-2:#0e0e12; --line:#26262f;
        --fg:#f4f4f6; --muted:#9b9ba6; --faint:#80808d;
        --red:#e20613; --red-text:#ff4a3d;
        --font-display:'Archivo',sans-serif; --font-sans:'Inter',sans-serif;
      }}
      * {{ margin:0; padding:0; box-sizing:border-box; }}
      html, body {{ margin:0; width:{W}px; height:{H}px; overflow:hidden; background:var(--ink); }}
      #root {{ width:100%; height:100%; position:relative; background:var(--ink);
              font-family:var(--font-sans); color:var(--fg); overflow:hidden; }}
      .scene {{ position:absolute; inset:0; display:flex; flex-direction:column;
               align-items:center; justify-content:center; padding:0 {pad}px; }}
      .glow {{ position:absolute; width:{int(W*0.78)}px; height:{int(W*0.78)}px; border-radius:50%;
              background:radial-gradient(circle,#e20613 0%,transparent 65%);
              opacity:0.15; filter:blur(120px); pointer-events:none; }}
      .display {{ font-family:var(--font-display); font-weight:900; letter-spacing:-0.035em;
                 line-height:0.97; text-align:center; }}
      .lead {{ color:var(--muted); font-size:{t['lead']}px; line-height:1.5; text-align:center; font-weight:400; }}
      .eyebrow {{ font-size:{t['eyebrow']}px; letter-spacing:0.22em; text-transform:uppercase;
                 color:var(--faint); font-weight:600; }}
      .red {{ color:var(--red-text); }}
      .mark {{ width:{t['mark']}px; height:auto; }}
      .mark-small {{ width:{int(t['mark']*0.46)}px; }}

      /* Vollflaechiges Foto nur dort, wo die Datei gross genug ist. */
      .bg {{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }}
      .veil {{ position:absolute; inset:0;
               background:linear-gradient(180deg, rgba(8,8,10,0.30) 0%, rgba(8,8,10,0.26) 38%, rgba(8,8,10,0.86) 72%, rgba(8,8,10,0.97) 100%); }}
      /* Szene 2 setzt den Text nach unten: oben steht das Fahrzeug mit der
         eigenen Beschriftung, die nicht uebermalt werden darf. */
      .scene-photo {{ justify-content:flex-end; padding-bottom:{96 if V else 86}px; }}

      .svc {{ display:flex; gap:{28 if V else 34}px; align-items:baseline; width:100%;
              max-width:{820 if V else 1180}px; padding:{20 if V else 22}px 0;
              border-top:1px solid var(--line); }}
      .svc-n {{ font-family:var(--font-display); font-weight:800; font-size:{t['svcsub']}px;
                color:var(--red-text); font-variant-numeric:tabular-nums; flex:0 0 auto; }}
      .svc-t {{ font-family:var(--font-display); font-weight:800; font-size:{t['svc']}px;
                letter-spacing:-0.02em; line-height:1.1; }}
      .svc-s {{ font-size:{t['svcsub']}px; color:var(--muted); margin-top:7px; line-height:1.4; }}

      .badges {{ display:flex; flex-wrap:wrap; gap:{14 if V else 18}px; justify-content:center;
                 margin-top:{34 if V else 40}px; }}
      .badge {{ border:1px solid var(--line); border-radius:3px; padding:{13 if V else 15}px {20 if V else 26}px;
                font-size:{t['badge']}px; color:var(--fg); font-weight:600; background:rgba(14,14,18,0.72); }}

      .ph-row {{ display:flex; gap:{18 if V else 24}px; margin-top:{32 if V else 38}px; }}
      .ph {{ width:{400 if V else 520}px; height:auto; border:1px solid var(--line); border-radius:3px; display:block; }}

      .contact {{ display:flex; gap:{30 if V else 46}px; align-items:center; justify-content:center;
                  flex-wrap:wrap; margin-top:{30 if V else 34}px; }}
      .contact span {{ font-size:{t['lead']}px; color:var(--fg); font-weight:600; }}
      .contact .sep {{ color:var(--faint); }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="25"
         data-width="{W}" data-height="{H}">

      <!-- 1 — Hook: die Marke steht. Kein Flug, kein Impact. -->
      <div id="sc1" class="scene clip" data-start="0" data-duration="2.75" data-track-index="0">
        <div class="glow" id="s1-glow"></div>
        {zmark('s1-mark','mark')}
        <p class="eyebrow" id="s1-eyebrow" style="margin-top:{44 if V else 50}px">Ulm · seit über 30 Jahren</p>
      </div>

      <!-- 2 — Anspruch, auf echtem Fahrzeugbild (2048 px breit). -->
      <div id="sc2" class="scene scene-photo clip" data-start="2.75" data-duration="3.15" data-track-index="0">
        <img class="bg" id="s2-bg" src="assets/lkw.webp" alt="" style="object-position:{'12%' if V else '50%'} 38%" />
        <div class="veil"></div>
        <h1 class="display" id="s2-title" style="font-size:{t['hook']}px; position:relative">
          Ganzheitliche<br /><span class="red">Logistiklösungen</span>
        </h1>
        <p class="lead" id="s2-sub" style="margin-top:{26 if V else 30}px; position:relative; max-width:{820 if V else 1050}px">
          Komplett- und Teilladungen, national und international.
        </p>
      </div>

      <!-- 3 — Reichweite: die Relation zeichnet sich. -->
      <div id="sc3" class="scene clip" data-start="5.9" data-duration="5.0" data-track-index="0">
        <h2 class="display" id="s3-title" style="font-size:{t['head']}px; margin-bottom:{34 if V else 44}px">
          Von Ulm bis <span class="red">Istanbul</span>
        </h2>
        {route_svg(rw, rh, rfs)}
        <p class="lead" id="s3-sub" style="margin-top:{28 if V else 32}px">
          West- und Zentraleuropa bis in die Türkei und nach Griechenland.
        </p>
      </div>

      <!-- 4 — Spezialitaet: der Auflieger bemasst sich. -->
      <div id="sc4" class="scene clip" data-start="10.9" data-duration="3.85" data-track-index="0">
        <h2 class="display" id="s4-title" style="font-size:{t['head']}px; margin-bottom:{30 if V else 40}px">
          Fracht, die nicht auf eine<br />Standardpalette passt
        </h2>
        <div style="width:100%; max-width:{880 if V else 1320}px">{trailer_svg(trfs)}</div>
        <p class="lead" id="s4-sub" style="margin-top:{22 if V else 26}px">
          Textil-Koffersattel nach XL-CODE.
        </p>
      </div>

      <!-- 5 — Leistungsbreite. -->
      <div id="sc5" class="scene clip" data-start="14.75" data-duration="3.6" data-track-index="0">
        <p class="eyebrow" id="s5-eyebrow">Was wir fahren</p>
        <div style="margin-top:{30 if V else 36}px; width:100%; display:flex; flex-direction:column; align-items:center">
          {svc_rows}
        </div>
        {photo_block}
      </div>

      <!-- 6 — Vertrauen: Nachweise und Erreichbarkeit. -->
      <div id="sc6" class="scene clip" data-start="18.35" data-duration="3.4" data-track-index="0">
        <h2 class="display" id="s6-title" style="font-size:{t['head']}px">
          Geprüft, nicht behauptet
        </h2>
        <div class="badges" id="s6-badges">
          <div class="badge">ISO 9001</div>
          <div class="badge">IFS Logistics</div>
          <div class="badge">Businesspartner SSV Ulm 1846</div>
        </div>
        <p class="lead" id="s6-sub" style="margin-top:{30 if V else 36}px; max-width:{830 if V else 1020}px">
          Feste Ansprechperson, Mo – Fr 7 – 17 Uhr.
        </p>
      </div>

      <!-- 7 — Abbinder: Firma, Domain, Telefon. -->
      <div id="sc7" class="scene clip" data-start="21.75" data-duration="3.25" data-track-index="0">
        <div class="glow" id="s7-glow" style="opacity:0.1"></div>
        {zmark('s7-mark','mark mark-small', animated=False)}
        <h2 class="display" id="s7-name" style="font-size:{t['outro']}px; margin-top:{34 if V else 40}px">
          KURT Internationale<br />Transporte GmbH
        </h2>
        <div class="contact" id="s7-contact">
          <span>kurt-transport.com</span>
          <span class="sep">·</span>
          <span>+49 731 401 700</span>
        </div>
      </div>

      <audio id="music" src="assets/music.mp3" data-start="0.2" data-volume="0.26"></audio>
      <audio id="sfx-route" src="assets/tick.ogg" data-start="5.9" data-volume="0.46"></audio>
      <audio id="sfx-masse" src="assets/tick2.ogg" data-start="10.9" data-volume="0.46"></audio>
      <audio id="sfx-outro" src="assets/outro.ogg" data-start="21.75" data-volume="0.4"></audio>
    </div>

    <script>
      const tl = gsap.timeline({{ paused: true }});
      const E = 'power3.out';
      const OUT = 'power2.in';

      /* 1 — Die Marke baut sich aus ihren zwei Konturen auf. */
      tl.fromTo('#s1-mark-red',   {{ opacity:0, yPercent:-8 }}, {{ opacity:1, yPercent:0, duration:0.7, ease:E }}, 0.15)
        .fromTo('#s1-mark-slate', {{ opacity:0, xPercent:-6 }}, {{ opacity:1, xPercent:0, duration:0.6, ease:E }}, 0.42)
        .fromTo('#s1-glow',       {{ opacity:0 }}, {{ opacity:0.15, duration:1.1, ease:'power2.out' }}, 0.1)
        .fromTo('#s1-eyebrow',    {{ opacity:0, y:18 }}, {{ opacity:1, y:0, duration:0.6, ease:E }}, 0.78)
        .to('#s1-mark, #s1-eyebrow', {{ opacity:0, duration:0.34, ease:OUT }}, 2.37);

      /* 2 — Anspruch. Das Bild atmet langsam, der Satz steht. */
      tl.fromTo('#s2-bg',    {{ opacity:0, scale:1.06 }}, {{ opacity:1, scale:1.0, duration:3.1, ease:'none' }}, 2.82)
        .fromTo('#s2-title', {{ opacity:0, y:26 }}, {{ opacity:1, y:0, duration:0.7, ease:E }}, 3.0)
        .fromTo('#s2-sub',   {{ opacity:0, y:18 }}, {{ opacity:1, y:0, duration:0.6, ease:E }}, 3.28)
        .to('#s2-title, #s2-sub', {{ opacity:0, duration:0.3, ease:OUT }}, 5.6);

      /* 3 — Die Relation zeichnet sich Station fuer Station.
         stroke-dashoffset statt Opacity: die Linie entsteht, sie erscheint nicht. */
      const main = document.getElementById('rt-main');
      const branch = document.getElementById('rt-branch');
      const mainLen = main.getTotalLength();
      tl.set(main, {{ strokeDasharray: mainLen, strokeDashoffset: mainLen }}, 5.9)
        .fromTo('#s3-title', {{ opacity:0, y:24 }}, {{ opacity:1, y:0, duration:0.5, ease:E }}, 5.9)
        .to(main, {{ strokeDashoffset: 0, duration:2.0, ease:'power1.inOut' }}, 6.05)
        .fromTo('#rt-dots circle',  {{ opacity:0, scale:0.4, transformOrigin:'center' }},
                                    {{ opacity:1, scale:1, duration:0.3, ease:'back.out(2)', stagger:0.26 }}, 6.15)
        .fromTo('#rt-labels text',  {{ opacity:0, y:8 }}, {{ opacity:1, y:0, duration:0.32, stagger:0.26 }}, 6.25)
        .fromTo(branch, {{ opacity:0 }}, {{ opacity:0.75, duration:0.5, ease:E }}, 7.9)
        .fromTo('#s3-sub', {{ opacity:0 }}, {{ opacity:1, duration:0.5, ease:E }}, 7.3)
        .to('#s3-title, #rt-svg, #s3-sub', {{ opacity:0, duration:0.3, ease:OUT }}, 10.6);

      /* 4 — Der Auflieger bemasst sich: Umriss, Stangen, dann die Masse. */
      tl.fromTo('#s4-title', {{ opacity:0, y:24 }}, {{ opacity:1, y:0, duration:0.5, ease:E }}, 10.9)
        .fromTo('#tr-body, #tr-nose', {{ opacity:0 }}, {{ opacity:1, duration:0.45, ease:E }}, 10.98)
        .fromTo('#tr-w1, #tr-w2, #tr-w3', {{ opacity:0, scale:0.5, transformOrigin:'center' }},
                                           {{ opacity:1, scale:1, duration:0.35, ease:'back.out(2)', stagger:0.05 }}, 11.14)
        .fromTo('#tr-bars line', {{ opacity:0, scaleY:0, transformOrigin:'top center' }},
                                 {{ opacity:1, scaleY:1, duration:0.3, ease:E, stagger:0.035 }}, 11.32)
        .fromTo('#tr-h', {{ opacity:0, x:18 }}, {{ opacity:1, x:0, duration:0.45, ease:E }}, 12.25)
        .fromTo('#tr-l', {{ opacity:0, y:14 }}, {{ opacity:1, y:0, duration:0.45, ease:E }}, 12.57)
        .fromTo('#s4-sub', {{ opacity:0 }}, {{ opacity:1, duration:0.45, ease:E }}, 12.95)
        .to('#s4-title, #tr-svg, #s4-sub', {{ opacity:0, duration:0.3, ease:OUT }}, 14.45);

      /* 5 — Vier Leistungen bauen sich als Welle auf. */
      tl.fromTo('#s5-eyebrow', {{ opacity:0, y:14 }}, {{ opacity:1, y:0, duration:0.4, ease:E }}, 14.75)
        .fromTo('.svc', {{ opacity:0, x:-26 }}, {{ opacity:1, x:0, duration:0.5, ease:E, stagger:0.17 }}, 14.83)
        .fromTo('.ph',  {{ opacity:0, y:22 }}, {{ opacity:1, y:0, duration:0.55, ease:E, stagger:0.12 }}, 16.15)
        .to('#s5-eyebrow, .svc, .ph-row', {{ opacity:0, duration:0.3, ease:OUT }}, 18.05);

      /* 6 — Nachweise. */
      tl.fromTo('#s6-title',  {{ opacity:0, y:22 }}, {{ opacity:1, y:0, duration:0.5, ease:E }}, 18.35)
        .fromTo('.badge',     {{ opacity:0, y:16 }}, {{ opacity:1, y:0, duration:0.42, ease:E, stagger:0.11 }}, 18.52)
        .fromTo('#s6-sub',    {{ opacity:0 }}, {{ opacity:1, duration:0.45, ease:E }}, 18.95)
        .to('#s6-title, #s6-badges, #s6-sub', {{ opacity:0, duration:0.28, ease:OUT }}, 21.45);

      /* 7 — Abbinder. */
      tl.fromTo('#s7-mark',    {{ opacity:0, scale:0.92, transformOrigin:'center' }},
                               {{ opacity:1, scale:1, duration:0.55, ease:E }}, 21.84)
        .fromTo('#s7-name',    {{ opacity:0, y:20 }}, {{ opacity:1, y:0, duration:0.5, ease:E }}, 21.95)
        .fromTo('#s7-contact', {{ opacity:0 }}, {{ opacity:1, duration:0.45, ease:E }}, 22.15)
        .fromTo('#s7-glow',    {{ opacity:0 }}, {{ opacity:0.1, duration:0.9, ease:'power2.out' }}, 21.84);

      window.__timelines['main'] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
'''
    d = os.path.join(ROOT, 'kurt-brag-vertical' if V else 'kurt-brag')
    with io.open(os.path.join(d,'index.html'),'w',encoding='utf-8') as f:
        f.write(html)
    print('geschrieben:', d, len(html), 'bytes')

build('landscape')
build('vertical')
