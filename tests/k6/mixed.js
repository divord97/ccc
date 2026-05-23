// k6 load test: Mixed workload — 500 inbound + 500 outbound simultaneous
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8080/api/v1';
const TOKEN = __ENV.AUTH_TOKEN || '';

const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    inbound: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '2m', target: 300 },
        { duration: '3m', target: 500 },
        { duration: '5m', target: 500 },
        { duration: '2m', target: 0 },
      ],
      exec: 'inbound',
    },
    outbound: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '2m', target: 300 },
        { duration: '3m', target: 500 },
        { duration: '5m', target: 500 },
        { duration: '2m', target: 0 },
      ],
      exec: 'outbound',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    errors: ['rate<0.03'],
  },
};

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`,
};

export function inbound() {
  const res = http.post(`${BASE_URL}/calls`, JSON.stringify({
    call_type: 'INBOUND',
    caller: `+861380000${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    callee: '+862112345678',
    tenant_id: 1,
  }), { headers });

  check(res, { 'inbound call created': (r) => r.status === 201 || r.status === 200 })
    || errorRate.add(1);

  http.get(`${BASE_URL}/dashboard/metrics`, { headers });
  sleep(0.5);
}

export function outbound() {
  const res = http.post(`${BASE_URL}/calls/dial`, JSON.stringify({
    call_type: 'OUTBOUND',
    caller: '+862112345678',
    callee: `+861390000${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    agent_id: Math.floor(Math.random() * 100) + 1,
    tenant_id: 1,
  }), { headers });

  check(res, { 'outbound call created': (r) => r.status === 201 || r.status === 200 })
    || errorRate.add(1);

  http.get(`${BASE_URL}/calls?page=1&page_size=10`, { headers });
  sleep(0.5);
}
