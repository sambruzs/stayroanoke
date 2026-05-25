import React, { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { blogPosts } from '../data/blogPosts'
import styles from './BlogPostPage.module.css'

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderInline(text) {
  const escaped = escapeHtml(text)
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, (_, t) => `<strong>${t}</strong>`)
    .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, (_, label, path) => `<a href="${escapeHtml(path)}">${label}</a>`)
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, (_, label, url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`)
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

function setMeta(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el) }
  el.setAttribute('content', content)
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el) }
  el.setAttribute('href', url)
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const post = blogPosts.find(p => p.slug === slug)

  useEffect(() => {
    if (!post) { navigate('/blog'); return }

    const url = `https://stayroanoke.com/blog/${post.slug}`
    const image = post.coverImage.startsWith('http') ? post.coverImage : `https://stayroanoke.com${post.coverImage}`

    document.title = post.metaTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', post.metaDescription)

    setCanonical(url)
    setMeta('og:title', post.metaTitle)
    setMeta('og:description', post.metaDescription)
    setMeta('og:image', image)
    setMeta('og:type', 'article')
    setMeta('og:url', url)
  }, [post])

  if (!post) return null

  const otherPosts = blogPosts.filter(p => p.slug !== slug).slice(0, 2)

  const canonicalUrl = `https://stayroanoke.com/blog/${post.slug}`
  const imageUrl = post.coverImage.startsWith('http') ? post.coverImage : `https://stayroanoke.com${post.coverImage}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.metaDescription,
        image: imageUrl,
        datePublished: post.date,
        url: canonicalUrl,
        author: { '@type': 'Organization', name: 'Stay Roanoke', url: 'https://stayroanoke.com' },
        publisher: { '@type': 'Organization', name: 'Stay Roanoke', url: 'https://stayroanoke.com' },
      },
      ...(post.faqs?.length ? [{
        '@type': 'FAQPage',
        mainEntity: post.faqs.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      }] : []),
    ],
  }

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

          {/* FAQ section */}
          {post.faqs?.length > 0 && (
            <div className={styles.faqSection}>
              <h2 className={styles.faqHeading}>Frequently Asked Questions</h2>
              <div className={styles.faqList}>
                {post.faqs.map(({ q, a }) => (
                  <div key={q} className={styles.faqItem}>
                    <h3 className={styles.faqQ}>{q}</h3>
                    <p className={styles.faqA}>{a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </div>
  )
}
