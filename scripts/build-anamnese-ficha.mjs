// Builds the "Ficha de avaliação clínica da queixa sexual" (article: Protocolo de anamnese em
// Sexologia) as a printable A4 PDF and as an image for the article, with the brand fonts and colors.
// Rendered by headless Microsoft Edge (no extra dependency); set EDGE_PATH if it lives elsewhere.
//
//   node scripts/build-anamnese-ficha.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fonts = join(root, 'scripts', 'fonts');
const pdfOut = join(root, 'public', 'downloads', 'lutteros-ficha-avaliacao-queixa-sexual.pdf');
const imgOut = join(root, 'public', 'images', 'articles', 'figures', 'anamnese-ficha-v1.webp');
const edge =
  process.env.EDGE_PATH ??
  ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
if (!edge) throw new Error('Microsoft Edge not found. Set EDGE_PATH.');

const url = (p) => pathToFileURL(p).href;
const logo = url(join(root, 'public', 'images', 'logo.png'));
const SOURCE = 'Protocolo de anamnese em Sexologia e critérios diagnósticos das disfunções sexuais';

const baseCss = `
@font-face { font-family: Cardo; src: url('${url(join(fonts, 'Cardo-Regular.ttf'))}'); }
@font-face { font-family: Cardo; font-style: italic; src: url('${url(join(fonts, 'Cardo-Italic.ttf'))}'); }
@font-face { font-family: 'DM Sans'; src: url('${url(join(fonts, 'DMSans.ttf'))}'); font-weight: 100 1000; }
:root { --teal:#198189; --teal-deep:#0f5459; --plum:#630a79; --ink:#052628; --mint:#e4eeeb; --lilac:#eadfe9; --ivory:#faf9f6; --muted:#4b6365; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; color: var(--ink); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.box { display:inline-block; width:.78em; height:.78em; border:1.4px solid var(--teal); border-radius:2px; vertical-align:-.08em; margin-right:.32em; background:#fff; }
.opt { white-space: nowrap; margin-right: 1.1em; }
`;

// ---------- Printable A4 form ----------
const line = (label, flex = 1) => `<div class="f" style="flex:${flex}"><span>${label}</span><i></i></div>`;
const row = (...fields) => `<div class="r">${fields.join('')}</div>`;
const yesNo = (label) => `<div class="yn"><span>${label}</span><span class="opt"><b class="box"></b>sim</span><span class="opt"><b class="box"></b>não</span></div>`;
const checks = (items) => `<div class="checks">${items.map((t) => `<span class="opt"><b class="box"></b>${t}</span>`).join('')}</div>`;
const section = (title, hint, body, tone = 'teal') =>
  `<section class="s ${tone}"><h2>${title}</h2>${hint ? `<p class="hint">${hint}</p>` : ''}${body}</section>`;

const formHtml = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Ficha de avaliação clínica da queixa sexual · Lutteros</title><meta name="author" content="Lutteros"><style>${baseCss}
@page { size: A4; margin: 13mm 14mm 15mm; }
body { font-size: 9.3pt; line-height: 1.33; }
header { display:flex; align-items:flex-end; justify-content:space-between; gap:8mm; padding-bottom:3.4mm; border-bottom:2px solid var(--teal); }
header img { height: 10mm; }
header .t { text-align:right; }
header .eyebrow { font-size:7.4pt; letter-spacing:.14em; text-transform:uppercase; color:var(--plum); font-weight:600; }
header h1 { font-family: Cardo, serif; font-weight:400; font-size:18pt; line-height:1.1; margin-top:1mm; }
.meta { display:flex; gap:6mm; margin:3mm 0 1mm; }
.r { display:flex; gap:6mm; margin-top:2mm; }
.f { display:flex; align-items:flex-end; gap:2mm; min-width:0; }
.f span { white-space:nowrap; color:var(--muted); font-size:8.4pt; }
.f i { flex:1; border-bottom:1px solid rgba(5,38,40,.45); height:5mm; }
.s { break-inside: avoid; margin-top:3.2mm; padding:2.6mm 4mm 3mm; border-radius:2.6mm; background:var(--ivory); border:1px solid rgba(5,38,40,.1); border-left:3px solid var(--teal); }
.s.plum { border-left-color: var(--plum); }
.s h2 { font-family: Cardo, serif; font-weight:400; font-size:12pt; color:var(--teal-deep); }
.s.plum h2 { color: var(--plum); }
.hint { margin-top:.4mm; color:var(--muted); font-size:8.1pt; font-style:italic; }
.checks { display:flex; flex-wrap:wrap; row-gap:1.3mm; margin-top:2mm; font-size:8.8pt; }
.yn { display:flex; align-items:center; margin-top:1.8mm; font-size:8.8pt; }
.yn > span:first-child { min-width: 48mm; }
.grid2 { display:grid; grid-template-columns:1fr 1fr; column-gap:8mm; }
footer { margin-top:4mm; padding-top:2.2mm; border-top:1px solid rgba(5,38,40,.15); display:flex; justify-content:space-between; gap:6mm; color:var(--muted); font-size:7.2pt; }
</style></head><body>
<header>
  <img src="${logo}" alt="Lutteros">
  <div class="t"><p class="eyebrow">Anamnese em Sexologia</p><h1>Ficha de avaliação clínica<br>da queixa sexual</h1></div>
</header>
<div class="meta">${line('Data', 1)}${line('Profissional', 2.2)}${line('Prontuário', 1.2)}</div>

${section('Identificação da paciente', '', row(line('Nome', 3), line('Idade', 1)) + row(line('Profissão'), line('Escolaridade')) + row(line('Religião'), line('Estado civil')) + row(line('Tempo de relacionamento'), line('Situação econômica')))}

${section('Identificação da parceria', '', row(line('Nome', 3), line('Idade', 1)) + row(line('Religião'), line('Escolaridade')) + row(line('Situação econômica'), line('Hábitos')))}

${section('Queixa principal', 'Identificar a fase da resposta sexual comprometida e aferir a presença de dor à relação sexual.',
  `<div class="yn"><span>Fase comprometida</span><span class="opt"><b class="box"></b>desejo</span><span class="opt"><b class="box"></b>excitação</span><span class="opt"><b class="box"></b>orgasmo</span></div>` +
  yesNo('Dor na relação sexual') + row(line('Descrição')), 'plum')}

${section('História da queixa sexual atual', 'Caracterizar a queixa quanto ao início, duração, fatores relacionados, fatores que melhoram e fatores que pioram.',
  row(line('Início'), line('Duração')) + row(line('Fatores relacionados')) + row(line('Fatores que melhoram')) + row(line('Fatores que pioram')))}

${section('Antecedentes pessoais patológicos', '',
  row(line('Medicamentos em uso')) +
  checks(['Hipertensão arterial', 'Diabetes tipo I', 'Diabetes tipo II', 'Hiperprolactinemia', 'Hipertireoidismo', 'Hipotireoidismo', 'Anticoncepcional hormonal', 'Cimetidina', 'Antidepressivos', 'Ansiolíticos', 'Anti-hipertensivos', 'Antiandrogênicos']) +
  `<div class="yn"><span>Hábitos</span><span class="opt"><b class="box"></b>álcool</span><span class="opt"><b class="box"></b>fumo</span><span class="opt"><b class="box"></b>drogas ilícitas</span></div>`)}

${section('Antecedentes gineco-obstétricos', '',
  row(line('Menarca'), line('Data da última menstruação', 1.6)) +
  row(line('Ciclos menstruais: intervalo', 1.4), line('duração')) +
  row(line('Gestações'), line('Tipos de parto', 1.6)) +
  row(line('Patologias gineco-obstétricas')) + row(line('Cirurgias gineco-obstétricas')) +
  row(line('Anticoncepção', 1.6), line('Idade da menopausa')) + row(line('Terapia hormonal')))}

${section('História sexual pregressa', '',
  row(line('Sexarca'), line('Número de parceiros')) + row(line('Frequência de relações sexuais'), line('Orientação sexual')) + yesNo('Relações sexuais satisfatórias'), 'plum')}

${section('Resposta sexual individual', '', `<div class="grid2">${yesNo('Tem sonhos eróticos?')}${yesNo('Tem desejo sexual?')}${yesNo('Tem lubrificação?')}${yesNo('Tem orgasmo?')}${yesNo('Autoerotismo?')}</div>`, 'plum')}

${section('Histórico de abuso sexual', '', yesNo('Histórico de abuso sexual') + row(line('Grau de parentesco')), 'plum')}

${section('Qualidade da relação conjugal', '',
  `<div class="grid2">${yesNo('Parceria carinhosa')}${yesNo('Ejaculação precoce')}${yesNo('Ejaculação retardada')}${yesNo('Disfunção erétil')}</div>` +
  row(line('Outros')) +
  `<div class="yn"><span>Qualidade do relacionamento</span><span class="opt"><b class="box"></b>boa</span><span class="opt"><b class="box"></b>ruim</span><span class="opt"><b class="box"></b>indiferente</span></div>`, 'plum')}

${section('Avaliação laboratorial mínima', 'Hemograma, função tireoidiana, prolactina e exames pertinentes ao quadro clínico geral.',
  checks(['Hemograma', 'Função tireoidiana', 'Prolactina']) + row(line('Outros exames pertinentes')))}

<footer><span>Lutteros · lutteros.com.br · Material para profissionais de saúde.</span><span>Fonte: ${SOURCE}.</span></footer>
</body></html>`;

// ---------- Article image (summary of the same form) ----------
const opts = (items) => items.map((t) => `<span class="opt"><b class="box"></b>${t}</span>`).join('');
const sn = opts(['sim', 'não']);
const cards = [
  ['Identificação da paciente', 'Nome, idade, profissão, escolaridade, religião, estado civil, tempo de relacionamento, situação econômica.'],
  ['Identificação da parceria', 'Nome, idade, religião, escolaridade, situação econômica, hábitos.'],
  ['Queixa principal', 'Identificar a fase da resposta sexual comprometida e aferir a presença de dor à relação sexual.', 'plum'],
  ['História da queixa sexual atual', 'Caracterizar a queixa quanto ao início, duração, fatores relacionados, fatores que melhoram, fatores que pioram.'],
  ['Antecedentes pessoais patológicos', 'Medicamentos em uso, hábitos: hipertensão arterial, diabetes tipo I e II, hiperprolactinemia, hiper ou hipotireoidismo, uso de anticoncepcional hormonal, cimetidina, antidepressivos, ansiolíticos, anti-hipertensivos, antiandrogênicos, álcool, fumo, drogas ilícitas.'],
  ['Antecedentes gineco-obstétricos', 'Menarca, data da última menstruação, ciclos menstruais (intervalo, duração), gestações, tipos de parto, patologias gineco-obstétricas, cirurgias gineco-obstétricas, anticoncepção, idade da menopausa, terapia hormonal.'],
  ['História sexual pregressa', `Sexarca, número de parceiros, frequência de relações sexuais, orientação sexual. Relações sexuais satisfatórias: ${sn}`, 'plum'],
  ['Resposta sexual individual', `<span class="q">Tem sonhos eróticos? ${sn}</span><span class="q">Tem desejo sexual? ${sn}</span><span class="q">Tem lubrificação? ${sn}</span><span class="q">Tem orgasmo? ${sn}</span><span class="q">Autoerotismo? ${sn}</span>`, 'plum'],
  ['Histórico de abuso sexual', `${sn} Grau de parentesco: ________`, 'plum'],
  ['Qualidade da relação conjugal', `<span class="q">Parceria carinhosa: ${sn}</span><span class="q">Ejaculação precoce: ${sn}</span><span class="q">Ejaculação retardada: ${sn}</span><span class="q">Disfunção erétil: ${sn}</span><span class="q">Outros: ________</span><span class="q">Qualidade do relacionamento:</span><span class="q">${opts(['boa', 'ruim', 'indiferente'])}</span>`, 'plum'],
  ['Avaliação laboratorial mínima', 'Hemograma, função tireoidiana, prolactina e exames pertinentes ao quadro clínico geral.'],
];

const cardHtml = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${baseCss}
html, body { background:#ffffff; }
.page { width: 1000px; padding: 48px 52px 40px; background: var(--ivory); position: relative; overflow: hidden; }
.page::before { content:''; position:absolute; right:-160px; top:-210px; width:520px; height:520px; border-radius:42% 58% 38% 62%; background: var(--mint); }
.page::after { content:''; position:absolute; left:-180px; bottom:-230px; width:460px; height:460px; border-radius:58% 42% 62% 38%; background: var(--lilac); opacity:.7; }
.wrap { position: relative; z-index: 1; }
header { display:flex; align-items:center; justify-content:space-between; }
header img { height: 44px; }
.eyebrow { font-size:13px; letter-spacing:.16em; text-transform:uppercase; color:var(--plum); font-weight:600; }
h1 { font-family: Cardo, serif; font-weight:400; font-size:44px; line-height:1.08; margin:22px 0 6px; letter-spacing:-.01em; }
.lead { color: var(--muted); font-size:17px; }
.cols { columns: 2; column-gap: 22px; margin-top: 28px; }
.c { break-inside: avoid; margin-bottom: 18px; padding: 18px 20px 18px 22px; border-radius: 16px; background:#fff; border:1px solid rgba(5,38,40,.09); border-left: 4px solid var(--teal); box-shadow: 0 18px 40px -34px rgba(5,38,40,.55); }
.c.plum { border-left-color: var(--plum); }
.c h2 { font-family: Cardo, serif; font-weight:400; font-size:23px; line-height:1.15; color: var(--teal-deep); margin-bottom: 7px; }
.c.plum h2 { color: var(--plum); }
.c p { font-size:15.5px; line-height:1.55; color:#26393b; }
.q { display:block; margin-top:4px; }
.box { width:15px; height:15px; border-width:1.8px; }
.opt { margin-right: 12px; }
footer { margin-top: 10px; display:flex; justify-content:space-between; color: var(--muted); font-size: 13px; }
</style></head><body><div class="page"><div class="wrap">
<header><img src="${logo}" alt="Lutteros"><span class="eyebrow">Anamnese em Sexologia</span></header>
<h1>Ficha de avaliação clínica<br>da queixa sexual</h1>
<p class="lead">Roteiro para a primeira consulta: o que investigar em cada etapa.</p>
<div class="cols">${cards.map(([t, b, tone]) => `<div class="c ${tone ?? ''}"><h2>${t}</h2><p>${b}</p></div>`).join('')}</div>
<footer><span>lutteros.com.br</span><span>Fonte: Protocolo de anamnese em Sexologia</span></footer>
</div></div></body></html>`;

// ---------- Render ----------
const work = join(tmpdir(), `lutteros-ficha-${Date.now()}`);
mkdirSync(work, { recursive: true });

// The brand SVG has a square canvas; rasterize and trim it to a transparent wordmark.
const logoFile = join(work, 'logo.png');
await sharp(join(root, 'public', 'images', 'logo', 'lutteros-logo.svg'), { density: 600 }).trim().png().toFile(logoFile);
const logoUrl = url(logoFile);

const formFile = join(work, 'ficha.html');
const cardFile = join(work, 'card.html');
writeFileSync(formFile, formHtml.replaceAll(logo, logoUrl));
writeFileSync(cardFile, cardHtml.replaceAll(logo, logoUrl));

const run = (args) =>
  execFileSync(edge, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', `--user-data-dir=${join(work, 'profile')}`, ...args], { stdio: 'pipe', timeout: 60000 });

mkdirSync(dirname(pdfOut), { recursive: true });
run(['--no-pdf-header-footer', `--print-to-pdf=${pdfOut}`, url(formFile)]);
console.log('Wrote', pdfOut);

// Screenshot on a white canvas taller than the card, then trim the white away.
const shot = join(work, 'card.png');
run(['--force-device-scale-factor=2', '--window-size=1000,2600', `--screenshot=${shot}`, url(cardFile)]);
mkdirSync(dirname(imgOut), { recursive: true });
await sharp(shot).trim({ background: '#ffffff', threshold: 4 }).resize({ width: 1600 }).webp({ quality: 90 }).toFile(imgOut);
console.log('Wrote', imgOut);

rmSync(work, { recursive: true, force: true });
