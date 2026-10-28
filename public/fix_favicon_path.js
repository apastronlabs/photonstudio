const fs = require('fs');

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('<link rel="icon" type="image/svg+xml" href="./assets/icons/canvas.svg">')) {
    html = html.replace(
      '<link rel="icon" type="image/svg+xml" href="./assets/icons/canvas.svg">',
      '<link rel="icon" type="image/png" href="./assets/Logo%20-%20Favicon.png">'
    );
    fs.writeFileSync(file, html);
    console.log(`Updated ${file}`);
  }
}
