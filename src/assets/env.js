// Runtime environment overrides for frontend-only secrets
// Edit OPENWEATHER_API_KEY here during development without changing TypeScript files.
(function (w) {
  w.__env = w.__env || {};
  // Example: w.__env.OPENWEATHER_API_KEY = 'your_key_here';
  w.__env.OPENWEATHER_API_KEY = w.__env.OPENWEATHER_API_KEY || '';
})(window);
