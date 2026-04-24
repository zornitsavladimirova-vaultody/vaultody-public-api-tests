const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../auth/auth.js');

test.beforeEach(async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
});

test.describe('Vaults API - GET /vaults/test', () => {

  test('should return status 200', async ({ request }) => {
    const path = '/vaults/test';
    const headers = generateHeaders('GET', path);
    const response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    expect(response.status()).toBe(200);
  });

  test('response should contain data field', async ({ request }) => {
    const path = '/vaults/test';
    const headers = generateHeaders('GET', path);
    const response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const body = await response.json();
    expect(body).toHaveProperty('data');
  });

  test('data should contain items field', async ({ request }) => {
    const path = '/vaults/test';
    const headers = generateHeaders('GET', path);
    const response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const body = await response.json();
    expect(body.data).toHaveProperty('items');
  });

  test('items should be an array', async ({ request }) => {
    const path = '/vaults/test';
    const headers = generateHeaders('GET', path);
    const response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const body = await response.json();
    expect(Array.isArray(body.data.items)).toBeTruthy();
  });

  test('each vault should have id, name and type fields', async ({ request }) => {
    const path = '/vaults/test';
    const headers = generateHeaders('GET', path);
    const response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const body = await response.json();
    for (const vault of body.data.items) {
      expect(vault).toHaveProperty('id');
      expect(vault).toHaveProperty('name');
      expect(vault).toHaveProperty('type');
    }
  });

  test('each vault type should equal test', async ({ request }) => {
    const path = '/vaults/test';
    const headers = generateHeaders('GET', path);
    const response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const body = await response.json();
    console.log('Response body:', JSON.stringify(body, null, 2));
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('items');
    for (const vault of body.data.items) {
      expect(vault.type).toBe('test');
    }
  });

  test('should return default limit of 50 in response', async ({ request }) => {
    const path = '/vaults/test';
    const headers = generateHeaders('GET', path);
    const response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const body = await response.json();
    expect(body.data).toHaveProperty('limit');
    expect(body.data.limit).toBe(50);
  });

test('should return correct number of items when limit is set to 2', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const path = '/vaults/test';
    const queryParams = { limit: '2' };
    const headers = generateHeaders('GET', path, {}, queryParams);
    const response = await request.get(`${CONFIG.baseUrl}${path}`, {
      headers,
      params: queryParams
    });
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.data.items.length).toBeLessThanOrEqual(2);
  });

  test('should return hasMore field in response', async ({ request }) => {
    const path = '/vaults/test';
    const headers = generateHeaders('GET', path);
    const response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const body = await response.json();
    expect(body.data).toHaveProperty('hasMore');
    expect(typeof body.data.hasMore).toBe('boolean');
  });

  test('should paginate correctly using startingAfter', async ({ request }) => {
    const path = '/vaults/test';

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