// PostCSS configuration for Tailwind CSS processing
// I tried the ES6 export syntax first but it caused issues with some build tools
// So sticking with CommonJS for better compatibility across different environments

// const config = {
//   plugins: ["@tailwindcss/postcss"],
// };

// export default config;

// This CommonJS approach works more reliably
module.exports = {
  plugins: {
    // Using the new Tailwind PostCSS plugin - much faster than the old one
    "@tailwindcss/postcss": {},
    // TODO: Add autoprefixer if we need better browser support
    // autoprefixer: {},
  },
};
