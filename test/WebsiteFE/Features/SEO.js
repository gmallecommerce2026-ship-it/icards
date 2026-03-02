// TrainData/FE/Features/SEO.js
import { useEffect } from 'react';

const SEO = ({ title, description, keywords, imageUrl, url, schema, robots, canonicalUrl }) => {
  useEffect(() => {
    document.title = title || 'iCards.com.vn';

    const setMetaTag = (attr, attrValue, content) => {
      let element = document.querySelector(`meta[${attr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content || '');
    };

    // --- THÊM MỚI: Xử lý thẻ link canonical ---
    const setLinkTag = (rel, href) => {
        let element = document.querySelector(`link[rel="${rel}"]`);
        if (!element) {
            element = document.createElement('link');
            element.setAttribute('rel', rel);
            document.head.appendChild(element);
        }
        element.setAttribute('href', href || '');
    };

    setMetaTag('name', 'description', description);
    if (keywords) setMetaTag('name', 'keywords', keywords);
    // --- THÊM MỚI: Xử lý thẻ robots ---
    if (robots) setMetaTag('name', 'robots', robots);

    // --- THÊM MỚI: Xử lý thẻ canonical ---
    setLinkTag('canonical', canonicalUrl || window.location.href);

    // Open Graph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', 'website');
    if (url) setMetaTag('property', 'og:url', window.location.origin + url);
    if (imageUrl) setMetaTag('property', 'og:image', imageUrl);

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    if (imageUrl) setMetaTag('name', 'twitter:image', imageUrl);

    // JSON-LD Schema
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

  }, [title, description, keywords, imageUrl, url, schema, robots, canonicalUrl]);

  return null;
};

export default SEO;