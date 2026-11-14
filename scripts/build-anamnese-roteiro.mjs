import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fonts = join(root, 'scripts', 'fonts');
const output = process.env.PDF_OUTPUT
  || join(root, 'public', 'downloads', 'lutteros-roteiro-anamnese-estruturada.pdf');
const edge = process.env.EDGE_PATH
  || ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'].find(existsSync);

if (!edge) throw new Error('Microsoft Edge não encontrado. Defina EDGE_PATH.');

const url = (path) => pathToFileURL(path).href;
const line = (label, flex = 1) => `<div class="f" style="flex:${flex}"><span>${label}</span><i></i></div>`;
const row = (...fields) => `<div class="r">${fields.join('')}</div>`;
const yesNo = (label) => `<div class="yn"><span>${label}</span><span class="opt"><b class="box"></b>sim</span><span class="opt"><b class="box"></b>não</span></div>`;
const section = (title, body, tone = 'teal') => `<section class="s ${tone}"><h2>${title}</h2>${body}</section>`;
const work = mkdtempSync(join(tmpdir(), 'lutteros-roteiro-'));

try {
  const logoFile = join(work, 'logo.png');
  await sharp(join(root, 'public', 'images', 'logo', 'lutteros-logo.svg'), { density: 600 }).trim().png().toFile(logoFile);

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Roteiro de anamnese estruturada · Lutteros</title>
<meta name="author" content="Lutteros">
<style>
@font-face { font-family: Cardo; src: url('${url(join(fonts, 'Cardo-Regular.ttf'))}'); }
@font-face { font-family: 'DM Sans'; src: url('${url(join(fonts, 'DMSans.ttf'))}'); font-weight: 100 1000; }
:root { --teal:#198189; --teal-deep:#0f5459; --plum:#630a79; --ink:#052628; --ivory:#faf9f6; --muted:#4b6365; }
* { box-sizing:border-box; margin:0; padding:0; }
@page { size:A4; margin:13mm 14mm 15mm; }
body { font-family:'DM Sans',sans-serif; color:var(--ink); font-size:9.3pt; line-height:1.33; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.sheet:first-of-type { break-after:page; }
header { display:flex; align-items:flex-end; justify-content:space-between; gap:8mm; padding-bottom:3.4mm; border-bottom:2px solid var(--teal); }
header img { height:10mm; }
header .title { text-align:right; }
header .eyebrow { font-size:7.4pt; letter-spacing:.14em; text-transform:uppercase; color:var(--plum); font-weight:600; }
header h1 { font-family:Cardo,serif; font-weight:400; font-size:18pt; line-height:1.1; margin-top:1mm; }
.meta { display:flex; gap:6mm; margin:3mm 0 1mm; }
.r { display:flex; gap:6mm; margin-top:2mm; }
.f { display:flex; align-items:flex-end; gap:2mm; min-width:0; }
.f span { white-space:nowrap; color:var(--muted); font-size:8.4pt; }
.f i { flex:1; border-bottom:1px solid rgba(5,38,40,.45); height:5mm; min-width:8mm; }
.s { break-inside:avoid; margin-top:3.2mm; padding:2.6mm 4mm 3mm; border-radius:2.6mm; background:var(--ivory); border:1px solid rgba(5,38,40,.1); border-left:3px solid var(--teal); }
.s.plum { border-left-color:var(--plum); }
.s h2 { font-family:Cardo,serif; font-weight:400; font-size:12pt; color:var(--teal-deep); }
.s.plum h2 { color:var(--plum); }
.hint { margin-top:.4mm; color:var(--muted); font-size:8.1pt; font-style:italic; }
.box { display:inline-block; width:.78em; height:.78em; border:1.4px solid var(--teal); border-radius:2px; vertical-align:-.08em; margin-right:.32em; background:#fff; }
.opt { white-space:nowrap; margin-right:1.1em; }
.yn { display:flex; align-items:center; margin-top:1.8mm; font-size:8.8pt; }
.yn > span:first-child { min-width:48mm; }
footer { margin-top:4mm; padding-top:2.2mm; border-top:1px solid rgba(5,38,40,.15); display:flex; justify-content:space-between; gap:6mm; color:var(--muted); font-size:7.2pt; }
footer span { flex:1; }
</style>
</head>
<body>
<div class="sheet">
  <header>
    <img src="${url(logoFile)}" alt="Lutteros">
    <div class="title"><p class="eyebrow">Anamnese em Sexologia</p><h1>Roteiro de anamnese<br>estruturada</h1></div>
  </header>
  <div class="meta">${line('Data', 1)}${line('Profissional', 2.2)}${line('Prontuário', 1.2)}</div>
  ${section('Identificação da paciente (e da parceria quando houver)',
    row(line('Nome', 3), line('Idade')) +
    row(line('Escolaridade'), line('Profissão')) +
    row(line('Religião'), line('Estado civil')) +
    row(line('Tempo de relacionamento')))}
  ${section('Identificação da parceria',
    row(line('Nome', 3), line('Idade')) +
    row(line('Escolaridade'), line('Profissão')) +
    row(line('Religião'), line('Estado civil')))}
  ${section('Queixa principal',
    `<div class="yn"><span>Fase comprometida</span><span class="opt"><b class="box"></b>desejo</span><span class="opt"><b class="box"></b>excitação</span><span class="opt"><b class="box"></b>orgasmo</span></div>` +
    yesNo('Dor na relação sexual') + row(line('Queixa principal')), 'plum')}
  ${section('História da queixa atual',
    row(line('Quando iniciou')) +
    row(line('Fatores associados')) +
    row(line('Relato')))}
  ${section('História sexual pregressa',
    '<p class="hint">A investigação da violência sexual precisa ser realizada com cuidado, por meio de uma escuta cuidadosa e diferenciada.</p>' +
    row(line('Idade da sexarca'), line('Número de parcerias sexuais')) +
    row(line('Sexarca consentida ou induzida')) +
    row(line('Experiências sexuais')) +
    row(line('Histórico de violência sexual')), 'plum')}
  ${section('Resposta sexual individual',
    row(line('Pensamentos sexuais espontâneos')) +
    row(line('Fantasias sexuais'), line('Autoerotismo')) +
    row(line('Resposta sexual com cenas ou situações eróticas')), 'plum')}
</div>
<div class="sheet">
  ${section('História patológica pregressa',
    row(line('Patologias')) +
    row(line('Medicamentos em uso')) +
    row(line('Hábitos')))}
  ${section('História gineco-obstétrica',
    row(line('Idade da menarca'), line('Número de gestações')) +
    row(line('Número de partos'), line('Via de parto')) +
    row(line('Complicações na gravidez e parto')) +
    row(line('Método anticoncepcional')) +
    row(line('Data do início'), line('Tempo de uso')) +
    row(line('Disfunção sexual durante a gravidez'), line('Infertilidade')))}
  ${section('Qualidade da relação conjugal',
    row(line('Sentimento em relação à parceria')) +
    row(line('Grau de intimidade'), line('Comunicação')) +
    row(line('Momentos lúdicos juntos')) +
    row(line('Observações')), 'plum')}
  ${section('Resposta sexual da parceria',
    row(line('Dificuldade sexual')) +
    row(line('Observações')), 'plum')}
  ${section('Exame físico',
    row(line('Observações')) +
    row(line('')))}
  ${section('Exames complementares',
    row(line('Se necessário')) +
    row(line('')))}
  <footer>
    <span>Lutteros · lutteros.com.br</span>
    <span>Fonte: Anamnese estruturada: técnica para realizar o diagnóstico da disfunção sexual.</span>
  </footer>
</div>
</body>
</html>`;

  const htmlFile = join(work, 'roteiro.html');
  writeFileSync(htmlFile, html);
  mkdirSync(dirname(output), { recursive: true });
  execFileSync(edge, [
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-sync',
    '--no-first-run',
    '--hide-scrollbars',
    '--no-pdf-header-footer',
    `--user-data-dir=${join(work, 'profile')}`,
    `--print-to-pdf=${output}`,
    url(htmlFile),
  ], { stdio: 'pipe', timeout: 90000 });

  if (!existsSync(output)) throw new Error('O PDF não foi gerado.');
  console.log(`PDF criado: ${output}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
