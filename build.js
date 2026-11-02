import fs from 'fs';
import path from 'path';

const srcPath = 'source/assets';
const destPath = 'dest';

const srcDir = path.join(process.cwd(), srcPath);
const destDir = path.join(process.cwd(), destPath);

let menu = fs.readFileSync(path.join(srcDir, 'sections/menu.html'), 'utf8');

const headerTop = fs.readFileSync(path.join(srcDir, 'sections/header.html'), 'utf8');
const headerArticle = fs.readFileSync(path.join(srcDir, 'sections/headerArticle.html'), 'utf8');
const headerIndex = fs.readFileSync(path.join(srcDir, 'sections/headerArticle.html'), 'utf8');

const authorName = "Lorem Ipsum";
const domain = "https://yourdomain.com";


// CONFIGURATION ENGINE:
// For this simple static setup, pages are defined by hand directly in this array.
// In a headless CMS or dynamic environment, this data array could instead be populated
// programmatically by fetching records from a database source.
const pageConfigs = [
  {
    date: '2026-10-31',
    file: 'index.html',
    header: headerIndex,
    menu: '',
    route: '/',
    title: `Homepage - Page Head Title`,  
    headline: '',
    description: `Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis | ${authorName}`
  },
  {
    bot: 'no',          // noindex
    date: '2026-11-01',
    file: 'article-Template.html',
    header: headerArticle,
    menu: 'Article',
    route: '/article',
    menu: 'Article Menu Entry',
    title: `Article - Page Head Title`,
    headline: 'Article Headline',
    description: `Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum  | ${authorName}`
  },
];

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

let menuList = "";
pageConfigs.forEach(page => {
  if (page.menu) {
    menuList += `\t\t\t<li><a href="${page.route}" aria-label="${page.menu}" data-menu-name="${page.menu}">${page.menu}</a></li>\n`;
  }
});
menu = menu.replace('{{SEO_MENU_LI}}', menuList);

pageConfigs.forEach(page => {
  const pageContent = fs.readFileSync(path.join(srcDir, page.file), 'utf8')
    .replace('{{SEO_HEADLINE}}', page.headline);

  const pageTop = headerTop
    .replaceAll('{{SEO_TITLE}}', page.title)
    .replaceAll('{{SEO_DESCRIPTION}}', page.description)
    .replaceAll('{{SEO_NO_IDX}}', page.bot !== undefined ? page.bot : '')
    .replaceAll('{{SEO_DOMAIN}}', domain)
    .replaceAll('{{SEO_ROUTE}}', page.route);

    
  const pageHead = page.header
    .replaceAll('{{SEO_HEADLINE}}', page.headline,)
    .replaceAll('{{SEO_ROUTE}}', page.route)
    .replaceAll('{{SEO_DESCRIPTION}}', page.description)
    .replaceAll('{{SEO_CREATED}}', page.date)
    .replaceAll('{{SEO_DOMAIN}}', domain)
    .replaceAll('{{SEO_AUTHOR}}', authorName)
    .replaceAll('{{SEO_MODIFIED}}', page.date);

  const finalHtml = 
`<!DOCTYPE html>
<html>
${pageTop}
${pageHead}
<body>
  ${menu}
  ${pageContent}
</body>
</html>`;

  fs.writeFileSync(path.join(destDir, page.file), finalHtml);
});

function copyFolder(source, target) {
    if (!fs.existsSync(source)) return;
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }
    const files = fs.readdirSync(source);
    files.forEach(file => {
        const curSource = path.join(source, file);
        const curTarget = path.join(target, file);

        if (fs.statSync(curSource).isDirectory()) {
            copyFolder(curSource, curTarget);
        } else {
            fs.copyFileSync(curSource, curTarget);
        }
    });
}

function copySingleFile(fileName, sourceDir, targetDir) {
    const srcFile = path.join(sourceDir, fileName);
    const distFile = path.join(targetDir, fileName);
    if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, distFile);
        console.log(`   -> File copied: ${srcPath}/${fileName} -> ${destPath}/${fileName}`);
    } else {
        console.warn(`   ⚠️ Pipeline Warning: ${fileName} not found in ${sourceDir}!`);
    }
}

function deployAssets() {
    console.log("🚀 Starting asset deployment pipeline...");    
    // Copy static folders
    const foldersToDeploy = ['css', 'images'];
    foldersToDeploy.forEach(folder => {
        const sourcePath = path.join(srcDir, folder);
        const targetPath = path.join(destDir, folder);
        if (fs.existsSync(sourcePath)) {
            copyFolder(sourcePath, targetPath);
            console.log(`   -> Directory copied: ${srcPath}/${folder} -> ${destPath}/${folder}/`);
        }
    });
    // Copy static files
    copySingleFile('favicon.ico', srcDir, destDir);
    copySingleFile('404.html', srcDir, destDir);
    console.log(`📦 CSS stylesheets and graphical assets successfully transferred to ${destPath}/.`);
}

function generateSitemap() {
    console.log("🗺️ Generating sitemap.xml...");    
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmlContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    pageConfigs.forEach(page => {
        if (page.bot === undefined) {
            xmlContent += `  <url>\n`;
            xmlContent += `    <loc>${domain}${page.route}</loc>\n`;
            xmlContent += `    <lastmod>${page.date}</lastmod>\n`;
            xmlContent += `  </url>\n`;
        }
    });
    xmlContent += `</urlset>`;
    fs.writeFileSync(path.join(destDir, 'sitemap.xml'), xmlContent);
    console.log(`🤖 sitemap.xml successfully written to ${destPath}/.`);
}

deployAssets();
generateSitemap();

console.log(`✨ Build execution complete: All pages generated inside the "${destPath}" directory.`);
