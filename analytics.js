/**
 * Vercel Web Analytics Integration for Mintlify
 * 
 * This script injects Vercel Web Analytics into the Mintlify documentation site.
 * It follows the Vercel Analytics quickstart guide for plain HTML/Vanilla JS implementation.
 * 
 * @see https://vercel.com/docs/analytics/quickstart
 */

(function() {
  'use strict';
  
  // Initialize the Vercel Analytics queue
  window.va = window.va || function() { 
    (window.vaq = window.vaq || []).push(arguments); 
  };
  
  // Create and inject the analytics script
  var script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  
  // Append the script to the document head or body
  var firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
})();
