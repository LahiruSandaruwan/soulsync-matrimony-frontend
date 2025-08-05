#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Bundle analyzer script
function analyzeBundle() {
  const distPath = path.join(__dirname, 'dist/matrimony-frontend');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ Build directory not found. Run "ng build" first.');
    return;
  }

  console.log('📊 Analyzing bundle size...\n');

  // Analyze main bundle
  const mainBundlePath = path.join(distPath, 'browser/main.js');
  if (fs.existsSync(mainBundlePath)) {
    const stats = fs.statSync(mainBundlePath);
    const sizeInKB = (stats.size / 1024).toFixed(2);
    console.log(`📦 Main bundle: ${sizeInKB} KB`);
  }

  // Analyze polyfills
  const polyfillsPath = path.join(distPath, 'browser/polyfills.js');
  if (fs.existsSync(polyfillsPath)) {
    const stats = fs.statSync(polyfillsPath);
    const sizeInKB = (stats.size / 1024).toFixed(2);
    console.log(`📦 Polyfills: ${sizeInKB} KB`);
  }

  // Analyze styles
  const stylesPath = path.join(distPath, 'browser/styles.css');
  if (fs.existsSync(stylesPath)) {
    const stats = fs.statSync(stylesPath);
    const sizeInKB = (stats.size / 1024).toFixed(2);
    console.log(`📦 Styles: ${sizeInKB} KB`);
  }

  // Analyze lazy chunks
  const browserPath = path.join(distPath, 'browser');
  if (fs.existsSync(browserPath)) {
    const files = fs.readdirSync(browserPath);
    const jsFiles = files.filter(file => file.endsWith('.js') && file.includes('chunk'));
    
    console.log('\n📦 Lazy chunks:');
    jsFiles.forEach(file => {
      const filePath = path.join(browserPath, file);
      const stats = fs.statSync(filePath);
      const sizeInKB = (stats.size / 1024).toFixed(2);
      console.log(`   ${file}: ${sizeInKB} KB`);
    });
  }

  // Total size calculation
  let totalSize = 0;
  const browserPath2 = path.join(distPath, 'browser');
  if (fs.existsSync(browserPath2)) {
    const files = fs.readdirSync(browserPath2);
    files.forEach(file => {
      const filePath = path.join(browserPath2, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });
  }

  const totalSizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`\n📊 Total bundle size: ${totalSizeInMB} MB`);

  // Recommendations
  console.log('\n💡 Optimization recommendations:');
  console.log('1. Use dynamic imports for large components');
  console.log('2. Remove unused dependencies');
  console.log('3. Optimize images and assets');
  console.log('4. Use tree shaking for unused code');
  console.log('5. Consider code splitting for admin features');
}

// Run analysis
analyzeBundle(); 