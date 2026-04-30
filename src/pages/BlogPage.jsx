import React from 'react'
import { Link } from 'react-router-dom'
import { blogPosts } from '../data/blogPosts'
import styles from './BlogPage.module.css'

export default function BlogPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Local Knowledge</p>
        <h1 className={styles.title}>The Stay Roanoke Guide</h1>
        <p className={styles.subtitle}>Everything you need to plan the perfect Blue Ridge getaway</p>
      </div>

      <div className={styles.grid}>
        {blogPosts.map(post => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className={styles.card}>
            <div className={styles.cardImage}>
              <img src={post.coverImage} alt={post.title} loading="lazy" />
              <span className={styles.category}>{post.category}</span>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.date}>{post.date}</p>
              <h2 className={styles.cardTitle}>{post.title}</h2>
              <p className={styles.excerpt}>{post.excerpt}</p>
              <span className={styles.readMore}>Read more →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
