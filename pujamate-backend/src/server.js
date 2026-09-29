require('dotenv').config();

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('JWT_SECRET must be a strong secret of at least 32 characters in production.');
}

const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`PujaMate API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
