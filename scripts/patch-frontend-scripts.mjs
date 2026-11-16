import fs from 'node:fs';

const SUPABASE_SCRIPTS = [
  '    <script src="js/vendor/supabase.min.js"></script>',
  '    <script src="js/utils.js"></script>',
  '    <script src="js/supabase.js"></script>'
].join('\n') + '\n';

const targets = [
  { file: 'index.html', anchor: '    <script src="js/home-blog.js"></script>\n' },
  { file: 'tk-sigma.html', anchor: '  <script src="js/facilities.js"></script>\n' },
  { file: 'daycare-sigma.html', anchor: '  <script src="js/facilities.js"></script>\n' },
  { file: 'galeri-fasilitas.html', anchor: '  <script src="js/facilities.js"></script>\n' }
];

for (const target of targets) {
  let html = fs.readFileSync(target.file, 'utf8');

  if (html.includes('js/supabase.js')) {
    console.log('lewati (sudah ada):', target.file);
    continue;
  }

  if (!html.includes(target.anchor)) {
    console.error('anchor tidak ditemukan:', target.file);
    process.exitCode = 1;
    continue;
  }

  html = html.replace(target.anchor, SUPABASE_SCRIPTS + target.anchor);

  fs.writeFileSync(target.file, html, 'utf8');
  console.log('dipatch:', target.file);
}
