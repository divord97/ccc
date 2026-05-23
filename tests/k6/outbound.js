// k6 load test: Outbound campaign pressure test
// Target: Predictive Campaign with 500 concurrent outbound calls
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8080/api/v1';
const TOKEN = __ENV.AUTH_TOKEN || '';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 300 },
    { duration: '3m', target: 500 },
    { duration: '5m', target: 500 },  // sustain
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.02'],
  },
};

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`,
};

export function setup() {
  // Create a campaign for testing
  const res = http.post(`${BASE_URL}/campaigns`, JSON.stringify({
    name: `k6-campaign-${Date.now()}`,
    dialing_mode: 'PREDICTIVE',
    skill_group_id: 1,
    concurrent_limit: 50,
    max_abandon_rate: 5,
    caller_number: '+862112345678',
    tenant_id: 1,
  }), { headers });

  return { campaignId: res.json('id') || 1 };
}

export default function (data) {
  // 1. Import case
  const casePayload = JSON.stringify({
    phone: `+861390000${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    name: `Test Customer ${__VU}`,
    priority: Math.floor(Math.random() * 3) + 1,
  });

  const importRes = http.post(
    `${BASE_URL}/campaigns/${data.campaignId}/cases`,
    casePayload,
    { headers }
  );
  check(importRes, {
    'case imported': (r) => r.status === 201 || r.status === 200,
  }) || errorRate.add(1);

  // 2. Get campaign stats
  const statsRes = http.get(
    `${BASE_URL}/campaigns/${data.campaignId}/stats`,
    { headers }
  );
  check(statsRes, {
    'stats fetched': (r) => r.status === 200,
  }) || errorRate.add(1);

  // 3. List campaigns
  const listRes = http.get(`${BASE_URL}/campaigns`, { headers });
  check(listRes, {
    'campaigns listed': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(0.3);
}
