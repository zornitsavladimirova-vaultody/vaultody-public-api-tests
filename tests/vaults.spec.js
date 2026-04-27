const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../auth/auth.js');
const endpoints = require('../config/endpoints.js');

let response;
let body;

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.vaults.listTest;
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Vaults API - GET /vaults/test', () => {

  test('should return status 200', async () => {
    expect(response.status()).toBe(200);
  });

  test('response should contain data field', async () => {
    expect(body).toHaveProperty('data');
  });

  test('data should contain items field', async () => {
    expect(body.data).toHaveProperty('items');
  });

  test('items should be an array', async () => {
    expect(Array.isArray(body.data.items)).toBeTruthy();
  });

  test('each vault should have id, name and type fields', async () => {
    for (const vault of body.data.items) {
      expect(vault).toHaveProperty('id');
      expect(vault).toHaveProperty('name');
      expect(vault).toHaveProperty('type');
    }
  });

  test('each vault type should equal test', async () => {
    for (const vault of body.data.items) {
      expect(vault.type).toBe('test');
    }
  });

  test('should return default limit of 50 in response', async () => {
    expect(body.data).toHaveProperty('limit');
    expect(body.data.limit).toBe(50);
  });

  test('should return hasMore field in response', async () => {
    expect(body.data).toHaveProperty('hasMore');
    expect(typeof body.data.hasMore).toBe('boolean');
  });

});

test.describe('Vaults API - GET /vaults/test - pagination', () => {

  test('should return correct number of items when limit is set to 2', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaults.listTest;
    const queryParams = { limit: '2' };
    const headers = generateHeaders('GET', path, {}, queryParams);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, {
      headers,
      params: queryParams
    });
    const b = await res.json();
    expect(res.status()).toBe(200);
    expect(b.data.items.length).toBeLessThanOrEqual(2);
  });

  test('should paginate correctly using startingAfter', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaults.listTest;
    const queryParams1 = { limit: '1' };
    const headers1 = generateHeaders('GET', path, {}, queryParams1);
    const response1 = await request.get(`${CONFIG.baseUrl}${path}`, {
      headers: headers1,
      params: queryParams1
    });
    const body1 = await response1.json();
    expect(response1.status()).toBe(200);

    if (body1.data.hasMore) {
      const firstId = body1.data.items[0].id;
      const queryParams2 = { limit: '1', startingAfter: firstId };
      const headers2 = generateHeaders('GET', path, {}, queryParams2);
      const response2 = await request.get(`${CONFIG.baseUrl}${path}`, {
        headers: headers2,
        params: queryParams2
      });
      const body2 = await response2.json();
      expect(response2.status()).toBe(200);
      expect(body2.data.items[0].id).not.toBe(firstId);
    } else {
      console.log('Only one page of vaults exists - skipping startingAfter test');
    }
  });

});