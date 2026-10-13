// Frontend/src/Features/SEO.js
import { useEffect } from 'react';

const SEO = ({ title, description, keywords, imageUrl, url, schema, robots, canonicalUrl, type = 'website' }) => {
  useEffect(() => {
    const pageTitle = title || 'iCards.com.vn';
    document.title = pageTitle;

    const setMetaTag = (attr, attrValue, content) => {
      let element = document.querySelector(`meta[${attr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content || '');
    };

    const setLinkTag = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href || '');
    };

    const currentUrl = window.location.origin + (url || window.location.pathname);
    const finalCanonical = canonicalUrl || currentUrl;

    // Meta SEO cơ bản
    setMetaTag('name', 'description', description);
    if (keywords) setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', robots || 'index, follow');
    setLinkTag('canonical', finalCanonical);

    // Open Graph
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', 'iCards.com.vn');
    setMetaTag('property', 'og:locale', 'vi_VN');
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', currentUrl);
    if (imageUrl) {
      setMetaTag('property', 'og:image', imageUrl);
      setMetaTag('property', 'og:image:secure_url', imageUrl);
    }

    // Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:site', '@icards_vn');
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', description);
    if (imageUrl) setMetaTag('name', 'twitter:image', imageUrl);

    // Schema JSON-LD
    const schemaScriptId = 'app-schema-ld-json';
    let schemaScript = document.getElementById(schemaScriptId);
    if (schemaScript) schemaScript.remove();
    if (schema) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.id = schemaScriptId;
      schemaScript.textContent = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
    }

  }, [title, description, keywords, imageUrl, url, schema, robots, canonicalUrl, type]);

  return null;
};

export default SEO;