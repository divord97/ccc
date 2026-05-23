// k6 load test: Inbound call pressure test
// Target: 1000 concurrent inbound calls → IVR → ACD → answer → recording
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8080/api/v1';
const TOKEN = __ENV.AUTH_TOKEN || '';

const errorRate = new Rate('errors');
const callDuration = new Trend('call_setup_duration');

export const options = {
  stages: [
    { duration: '1m', target: 200 },
    { duration: '2m', target: 500 },
    { duration: '3m', target: 1000 },
    { duration: '5m', target: 1000 },  // sustain
    { duration: '2m', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.01'],
  },
};

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`,
};

export default function () {
  // 1. Simulate inbound call creation
  const callPayload = JSON.stringify({
    call_type: 'INBOUND',
    caller: `+861380000${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    callee: '+862112345678',
    tenant_id: 1,
  });

  const start = Date.now();
  const createRes = http.post(`${BASE_URL}/calls`, callPayload, { headers });
  callDuration.add(Date.now() - start);

  check(createRes, {
    'call created (201)': (r) => r.status === 201 || r.status === 200,
  }) || errorRate.add(1);

  // 2. Query call records
  const listRes = http.get(`${BASE_URL}/calls?page=1&page_size=20`, { headers });
  check(listRes, {
    'list calls (200)': (r) => r.status === 200,
  }) || errorRate.add(1);

  // 3. Query dashboard metrics
  const dashRes = http.get(`${BASE_URL}/dashboard/metrics`, { headers });
  check(dashRes, {
    'dashboard metrics (200)': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(0.5);
}
