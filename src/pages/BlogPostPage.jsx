import React, { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { blogPosts } from '../data/blogPosts'
import styles from './BlogPostPage.module.css'

function renderInline(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

function renderContent(content) {
  const lines = content.trim().split('\n')
  const elements = []
  let key = 0
  let listItems = []

  function flushList() {
    if (listItems.length) {
      elements.push(<ul key={key++} className={styles.list}>{listItems}</ul>)
      listItems = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) { flushList(); continue }

    if (line.startsWith('## ')) {
      flushList()
      elements.push(<h2 key={key++}>{line.slice(3)}</h2>)
    } else if (line === '---') {
      flushList()
      elements.push(<hr key={key++} className={styles.divider} />)
    } else if (/^!\[([^\]]*)\]\(([^)]+)\)$/.test(line)) {
      flushList()
      const [, alt, src] = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
      elements.push(<img key={key++} src={src} alt={alt} className={styles.inlineImage} />)
    } else if (line.startsWith('- ')) {
      const html = renderInline(line.slice(2))
      listItems.push(<li key={key++} dangerouslySetInnerHTML={{ __html: html }} />)
    } else {
      flushList()
      const html = renderInline(line)
      elements.push(<p key={key++} dangerouslySetInnerHTML={{ __html: html }} />)
    }
  }
  flushList()
  return elements
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const post = blogPosts.find(p => p.slug === slug)

  useEffect(() => {
    if (!post) { navigate('/blog'); return }
    document.title = post.metaTitle
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', post.metaDescription)
  }, [post])

  if (!post) return null

  const otherPosts = blogPosts.filter(p => p.slug !== slug).slice(0, 2)

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero} style={{ backgroundImage: `url(${post.coverImage})` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Link to="/blog" className={styles.backLink}>← The Stay Roanoke Guide</Link>
          <span className={styles.category}>{post.category}</span>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.byline}>By {post.author} · {post.date}</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Article */}
        <article className={styles.article}>
          <p className={styles.intro}>{post.excerpt}</p>
          <div className={styles.content}>
            {renderContent(post.content)}
          </div>
        </article>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h3>Ready to visit Roanoke?</h3>
            <p>Browse our collection of handpicked vacation rentals in Roanoke and Salem, Virginia.</p>
            <Link to="/search" className={styles.ctaBtn}>Browse Properties</Link>
          </div>

          {otherPosts.length > 0 && (
            <div className={styles.relatedBox}>
              <h4>More from the Guide</h4>
              {otherPosts.map(p => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className={styles.relatedPost}>
                  <img src={p.coverImage} alt={p.title} />
                  <div>
                    <span className={styles.relatedCategory}>{p.category}</span>
                    <p>{p.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* Schema.org Article structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.metaDescription,
        "image": post.coverImage,
        "datePublished": post.date,
        "author": { "@type": "Organization", "name": "Stay Roanoke" },
        "publisher": {
          "@type": "Organization",
          "name": "Stay Roanoke",
          "url": "https://stayroanoke.com"
        }
      })}} />
    </div>
  )
}
