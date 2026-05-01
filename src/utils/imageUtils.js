// Guesty HQ images use Cloudinary (assets.guesty.com)
// We can append Cloudinary URL transformations for optimal quality

function cloudinaryTransform(url, transformation) {
  if (!url) return ''
  // Cloudinary URLs have /upload/ in them — insert transform after /upload/
  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${transformation}/`)
  }
  return url
}

export function getCardImage(url) {
  if (!url) return ''
  // w_800 = 800px wide, q_auto = auto quality, f_auto = auto format (WebP if supported)
  return cloudinaryTransform(url, 'w_800,q_auto,f_auto')
}

export function getGalleryImage(url) {
  if (!url) return ''
  // Full quality for main gallery view
  return cloudinaryTransform(url, 'w_1920,q_auto,f_auto')
}

export function getThumbImage(url) {
  if (!url) return ''
  return cloudinaryTransform(url, 'w_400,q_auto,f_auto')
}

export function getHighResImage(url, width = 1200) {
  if (!url) return ''
  return cloudinaryTransform(url, `w_${width},q_auto,f_auto`)
}
