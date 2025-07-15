#!/usr/bin/env node

/**
 * Comprehensive SEO Analyzer for Bloggie
 * Analyzes technical SEO factors and provides actionable insights
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class SEOAnalyzer {
  constructor(siteUrl = 'http://localhost:3000') {
    this.siteUrl = siteUrl;
    this.results = {
      score: 0,
      criticalIssues: [],
      warnings: [],
      recommendations: [],
      performance: {},
      seo: {},
      accessibility: {},
    };
  }

  async analyze() {
    console.log('🔍 Starting comprehensive SEO analysis...\n');

    await this.checkTechnicalSEO();
    await this.checkContentSEO();
    await this.checkPerformance();
    await this.checkAccessibility();
    await this.checkSocialMedia();
    
    this.generateReport();
  }

  async checkTechnicalSEO() {
    console.log('📊 Analyzing Technical SEO...');

    // Check robots.txt
    try {
      const robotsContent = fs.readFileSync(path.join(process.cwd(), 'src/app/robots.ts'), 'utf8');
      if (robotsContent.includes('Allow: /')) {
        this.addSuccess('✅ Robots.txt properly configured');
      }
    } catch (e) {
      this.addCritical('❌ robots.txt missing or misconfigured');
    }

    // Check sitemap
    try {
      const sitemapContent = fs.readFileSync(path.join(process.cwd(), 'src/app/sitemap.ts'), 'utf8');
      if (sitemapContent.includes('MetadataRoute.Sitemap')) {
        this.addSuccess('✅ Dynamic sitemap implemented');
      }
    } catch (e) {
      this.addCritical('❌ Sitemap missing');
    }

    // Check manifest.json
    try {
      const manifestContent = fs.readFileSync(path.join(process.cwd(), 'public/manifest.json'), 'utf8');
      const manifest = JSON.parse(manifestContent);
      if (manifest.name && manifest.short_name) {
        this.addSuccess('✅ PWA manifest properly configured');
      }
    } catch (e) {
      this.addWarning('⚠️ PWA manifest missing or invalid');
    }

    // Check SEO utilities
    try {
      const seoUtilsContent = fs.readFileSync(path.join(process.cwd(), 'src/lib/seo.ts'), 'utf8');
      if (seoUtilsContent.includes('generateBlogMetadata')) {
        this.addSuccess('✅ Dynamic metadata generation implemented');
      }
      if (seoUtilsContent.includes('generateBlogJsonLd')) {
        this.addSuccess('✅ Structured data (JSON-LD) implemented');
      }
    } catch (e) {
      this.addCritical('❌ SEO utilities missing');
    }
  }

  async checkContentSEO() {
    console.log('📝 Analyzing Content SEO...');

    // Check if blog pages have dynamic metadata
    const blogPagePath = path.join(process.cwd(), 'src/app/blog/[id]/page.tsx');
    try {
      const blogPageContent = fs.readFileSync(blogPagePath, 'utf8');
      if (blogPageContent.includes('generateMetadata')) {
        this.addSuccess('✅ Dynamic metadata for blog posts');
      }
      if (blogPageContent.includes('application/ld+json')) {
        this.addSuccess('✅ Structured data for blog posts');
      }
    } catch (e) {
      this.addCritical('❌ Blog page SEO missing');
    }

    // Check for keyword optimization
    const seoLibPath = path.join(process.cwd(), 'src/lib/seo.ts');
    try {
      const seoContent = fs.readFileSync(seoLibPath, 'utf8');
      if (seoContent.includes('primaryKeywords')) {
        this.addSuccess('✅ Keyword targeting implemented');
      }
      if (seoContent.includes('extractKeywords')) {
        this.addSuccess('✅ Dynamic keyword extraction');
      }
    } catch (e) {
      this.addWarning('⚠️ Keyword optimization could be improved');
    }
  }

  async checkPerformance() {
    console.log('⚡ Analyzing Performance...');

    // Check Next.js config optimizations
    const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
    try {
      const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
      
      if (nextConfigContent.includes('formats: [\'image/avif\', \'image/webp\']')) {
        this.addSuccess('✅ Modern image formats enabled');
      }
      if (nextConfigContent.includes('optimizePackageImports')) {
        this.addSuccess('✅ Package imports optimized');
      }
      if (nextConfigContent.includes('Cache-Control')) {
        this.addSuccess('✅ Caching headers configured');
      }
    } catch (e) {
      this.addWarning('⚠️ Next.js config could be optimized');
    }

    // Check for performance monitoring
    const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
    try {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');
      if (layoutContent.includes('gtag')) {
        this.addSuccess('✅ Analytics tracking implemented');
      }
      if (layoutContent.includes('dns-prefetch')) {
        this.addSuccess('✅ DNS prefetching configured');
      }
    } catch (e) {
      this.addWarning('⚠️ Performance monitoring missing');
    }
  }

  async checkAccessibility() {
    console.log('♿ Analyzing Accessibility...');

    // Check for semantic HTML and ARIA
    const files = this.getAllTSXFiles();
    let hasSemanticHTML = false;
    let hasAriaLabels = false;

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('<main') || content.includes('<article') || content.includes('<section')) {
        hasSemanticHTML = true;
      }
      if (content.includes('aria-') || content.includes('role=')) {
        hasAriaLabels = true;
      }
    });

    if (hasSemanticHTML) {
      this.addSuccess('✅ Semantic HTML elements used');
    } else {
      this.addWarning('⚠️ More semantic HTML could improve accessibility');
    }

    if (hasAriaLabels) {
      this.addSuccess('✅ ARIA labels implemented');
    } else {
      this.addWarning('⚠️ ARIA labels could improve accessibility');
    }
  }

  async checkSocialMedia() {
    console.log('📱 Analyzing Social Media Integration...');

    const seoLibPath = path.join(process.cwd(), 'src/lib/seo.ts');
    try {
      const seoContent = fs.readFileSync(seoLibPath, 'utf8');
      
      if (seoContent.includes('openGraph')) {
        this.addSuccess('✅ Open Graph tags implemented');
      }
      if (seoContent.includes('twitter')) {
        this.addSuccess('✅ Twitter Card meta tags implemented');
      }
      if (seoContent.includes('summary_large_image')) {
        this.addSuccess('✅ Large image cards for better social sharing');
      }
    } catch (e) {
      this.addWarning('⚠️ Social media optimization missing');
    }
  }

  getAllTSXFiles() {
    const files = [];
    const walk = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walk(fullPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          files.push(fullPath);
        }
      });
    };
    walk(path.join(process.cwd(), 'src'));
    return files;
  }

  addSuccess(message) {
    this.results.recommendations.push({ type: 'success', message });
    this.results.score += 10;
  }

  addWarning(message) {
    this.results.warnings.push(message);
    this.results.score -= 2;
  }

  addCritical(message) {
    this.results.criticalIssues.push(message);
    this.results.score -= 10;
  }

  generateReport() {
    console.log('\n📊 SEO ANALYSIS REPORT');
    console.log('='.repeat(50));
    
    console.log(`\n🎯 Overall SEO Score: ${Math.max(0, this.results.score)}/100`);
    
    if (this.results.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      this.results.criticalIssues.forEach(issue => console.log(issue));
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.warnings.forEach(warning => console.log(warning));
    }
    
    console.log('\n✅ SUCCESSFUL IMPLEMENTATIONS:');
    this.results.recommendations
      .filter(r => r.type === 'success')
      .forEach(rec => console.log(rec.message));

    console.log('\n📈 SEO RECOMMENDATIONS:');
    console.log('1. Monitor Core Web Vitals with Lighthouse CI');
    console.log('2. Set up Google Search Console and Analytics');
    console.log('3. Create high-quality, technical content regularly');
    console.log('4. Build internal linking structure');
    console.log('5. Optimize for featured snippets with structured content');
    console.log('6. Implement schema markup for all content types');
    console.log('7. Monitor keyword rankings and adjust strategy');

    console.log('\n🎯 COMPETITIVE ANALYSIS:');
    console.log('Target Keywords: technical blog, programming tutorials, software engineering');
    console.log('Competitors: Medium.com, Dev.to, Hashnode.com');
    console.log('Competitive Advantage: Specialized technical focus, better performance');

    // Save report to file
    const reportPath = path.join(process.cwd(), 'seo-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new SEOAnalyzer(process.argv[2] || 'http://localhost:3000');
  analyzer.analyze().catch(console.error);
}

module.exports = SEOAnalyzer;
