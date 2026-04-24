require('dotenv').config();

const crypto = require('crypto');


const CONFIG = {
  apiKey: process.env.API_KEY,
  apiPassphrase: process.env.API_PASSPHRASE,
  apiSecret: process.env.API_SECRET,
  baseUrl: process.env.BASE_URL
};

function generateHeaders(method, path, body = {}, queryParams = {}) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyStr = method === 'GET' ? '{}' : JSON.stringify(body);
  const queryStr = JSON.stringify(queryParams);
  
  const message = timestamp + method.toUpperCase() + path + bodyStr + queryStr;
  const key = Buffer.from(CONFIG.apiSecret, 'base64');
  const signature = crypto.createHmac('sha256', key).update(message).digest('base64');

  return {
    'x-api-key': CONFIG.apiKey,
    'x-api-passphrase': CONFIG.apiPassphrase,
    'x-api-timestamp': timestamp,
    'x-api-sign': signature,
    'Content-Type': 'application/json'
  };
}

module.exports = { generateHeaders, CONFIG };