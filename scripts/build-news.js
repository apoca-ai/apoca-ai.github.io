const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, '..', 'source', '_posts');
const NEWS_DIR = path.join(__dirname, '..', 'news');
const ROOT_DIR = path.join(__dirname, '..');

// 确保目录存在
if (!fs.existsSync(NEWS_DIR)) {
    fs.mkdirSync(NEWS_DIR, { recursive: true });
}

// 读取所有 markdown 文件
function getPosts() {
    if (!fs.existsSync(POSTS_DIR)) return [];
    
    const files = fs.readdirSync(POSTS_DIR)
        .filter(f => f.endsWith('.md'))
        .map(filename => {
            const filePath = path.join(POSTS_DIR, filename);
            const content = fs.readFileSync(filePath, 'utf-8');
            const parsed = matter(content);
            const slug = filename.replace(/\.md$/, '');
            
            return {
                slug,
                title: parsed.data.title || 'Untitled',
                date: parsed.data.date || new Date().toISOString().split('T')[0],
                category: parsed.data.category || '资讯',
                excerpt: parsed.data.excerpt || '',
                content: marked(parsed.content),
                rawContent: parsed.content
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return files;
}

// 生成 slug（从文件名）
function getSlug(filename) {
    return filename.replace(/\.md$/, '');
}

// 格式化日期
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// 页面公共头部
function getPageHead(title) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — Apoca AI</title>
    <meta name="description" content="Apoca AI 资讯动态，下一代微孔集流体智能制造平台最新进展。">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/news.css">
</head>`;
}

// 导航栏
function getNavbar(activePage) {
    const links = [
        { href: '../index.html#home', label: '首页' },
        { href: '../index.html#about', label: '关于' },
        { href: '../index.html#technology', label: '技术平台' },
        { href: '../index.html#applications', label: '应用场景' },
        { href: '../index.html#intelligent', label: '智能制造' },
        { href: './index.html', label: '资讯', active: activePage === 'news' },
        { href: '../index.html#contact', label: '联系' }
    ];
    
    const navLinks = links.map(l => {
        const cls = l.active ? 'nav-link active' : 'nav-link';
        return `<li><a href="${l.href}" class="${cls}">${l.label}</a></li>`;
    }).join('');
    
    return `<nav class="navbar scrolled" id="navbar">
        <div class="nav-container">
            <a href="../index.html" class="logo">
                <span class="logo-mark">A</span>
                <span class="logo-text">Apoca AI</span>
            </a>
            <ul class="nav-menu" id="navMenu">
                ${navLinks}
            </ul>
        </div>
    </nav>`;
}

// 页脚
function getFooter() {
    return `<footer class="footer">
        <div class="container">
            <div class="footer-main">
                <div class="footer-brand">
                    <a href="../index.html" class="logo">
                        <span class="logo-mark">A</span>
                        <span class="logo-text">Apoca AI</span>
                    </a>
                    <p>AI 驱动的新型新能源材料平台</p>
                </div>
                <div class="footer-nav">
                    <div class="footer-col">
                        <h4>导航</h4>
                        <ul>
                            <li><a href="../index.html">首页</a></li>
                            <li><a href="../index.html#about">关于</a></li>
                            <li><a href="../index.html#technology">技术平台</a></li>
                            <li><a href="./index.html">资讯</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>更多</h4>
                        <ul>
                            <li><a href="../index.html#applications">应用场景</a></li>
                            <li><a href="../index.html#intelligent">智能制造</a></li>
                            <li><a href="../index.html#contact">联系</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Apoca AI. All rights reserved.</p>
            </div>
        </div>
    </footer>`;
}

// 生成文章页
function generatePostPage(post) {
    const html = `${getPageHead(post.title)}
<body>
${getNavbar('news')}

<main class="news-page">
    <div class="container">
        <article class="news-article">
            <header class="article-header">
                <div class="article-meta">
                    <span class="article-category">${post.category}</span>
                    <span class="article-date">${formatDate(post.date)}</span>
                </div>
                <h1 class="article-title">${post.title}</h1>
            </header>
            <div class="article-body">
                ${post.content}
            </div>
            <footer class="article-footer">
                <a href="./index.html" class="btn btn-ghost">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    返回资讯列表
                </a>
            </footer>
        </article>
    </div>
</main>

${getFooter()}
<script src="../assets/js/main.js"></script>
</body>
</html>`;

    const outputPath = path.join(NEWS_DIR, `${post.slug}.html`);
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`Generated: news/${post.slug}.html`);
}

// 生成列表页
function generateIndexPage(posts) {
    const cards = posts.map(post => {
        const excerpt = post.excerpt || (post.rawContent.slice(0, 120) + '...');
        return `
        <article class="news-list-card">
            <div class="news-list-meta">
                <span class="news-list-category">${post.category}</span>
                <span class="news-list-date">${formatDate(post.date)}</span>
            </div>
            <h3 class="news-list-title">
                <a href="./${post.slug}.html">${post.title}</a>
            </h3>
            <p class="news-list-excerpt">${excerpt}</p>
            <a href="./${post.slug}.html" class="news-list-readmore">
                阅读全文
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </a>
        </article>`;
    }).join('\n');

    const html = `${getPageHead('资讯动态')}
<body>
${getNavbar('news')}

<main class="news-page">
    <div class="container">
        <div class="news-page-header">
            <span class="section-tag">资讯动态</span>
            <h1 class="section-title">
                行业洞察与<span class="gradient-text"> 最新进展</span>
            </h1>
            <p class="news-page-desc">聚焦新能源材料与智能制造领域的前沿动态</p>
        </div>
        
        <div class="news-list">
            ${cards}
        </div>
    </div>
</main>

${getFooter()}
<script src="../assets/js/main.js"></script>
</body>
</html>`;

    const outputPath = path.join(NEWS_DIR, 'index.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`Generated: news/index.html (${posts.length} posts)`);
}

// 主流程
function main() {
    console.log('Building news pages...\n');
    
    const posts = getPosts();
    
    if (posts.length === 0) {
        console.log('No posts found in source/_posts/');
        console.log('Create markdown files with front matter to get started.\n');
    }
    
    // 生成文章页
    posts.forEach(post => generatePostPage(post));
    
    // 生成列表页
    generateIndexPage(posts);
    
    console.log('\nDone!');
}

main();
