// src/middleware/cacheControl.js
// A short Cache-Control on read-only, low-volatility public endpoints lets
// mobile browsers and any CDN in front of the API skip a round trip on
// flaky 3G/4G connections (e.g. flipping between Explore filters that
// revisit the same query, or reopening the app). Never applied to
// auth/user-specific or fast-changing (crowd) routes.
function cacheControl(maxAgeSeconds) {
  return (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 2}`);
    next();
  };
}

module.exports = { cacheControl };
