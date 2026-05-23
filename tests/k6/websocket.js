// k6 load test: WebSocket pressure test
// Target: 500 agents + 10 admin dashboards simultaneously connected
import ws from 'k6/ws';
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const WS_URL = __ENV.WS_URL || 'ws://localhost:8080/ws';
const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8080/api/v1';
const TOKEN = __ENV.AUTH_TOKEN || '';

const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    agents: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '2m', target: 300 },
        { duration: '3m', target: 500 },
        { duration: '5m', target: 500 },
        { duration: '1m', target: 0 },
      ],
      exec: 'agentWs',
    },
    admins: {
      executor: 'constant-vus',
      vus: 10,
      duration: '12m',
      exec: 'adminDashboard',
    },
  },
  thresholds: {
    errors: ['rate<0.05'],
  },
};

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
};

export function agentWs() {
  const res = ws.connect(`${WS_URL}/agent?token=${TOKEN}`, {}, function (socket) {
    socket.on('open', () => {
      socket.send(JSON.stringify({ type: 'heartbeat', agent_id: __VU }));
    });

    socket.on('message', (data) => {
      const msg = JSON.parse(data);
      check(msg, { 'received message': (m) => m.type !== undefined });
    });

    socket.on('error', () => {
      errorRate.add(1);
    });

    // Keep connection open for 30s, send periodic heartbeats
    for (let i = 0; i < 6; i++) {
      sleep(5);
      socket.send(JSON.stringify({ type: 'heartbeat', agent_id: __VU }));
    }

    socket.close();
  });

  check(res, { 'ws connected': (r) => r && r.status === 101 }) || errorRate.add(1);
}

export function adminDashboard() {
  // Simulate admin polling dashboard every 5s
  for (let i = 0; i < 24; i++) {
    const res = http.get(`${BASE_URL}/dashboard/metrics`, { headers });
    check(res, { 'dashboard ok': (r) => r.status === 200 }) || errorRate.add(1);

    const agentRes = http.get(`${BASE_URL}/dashboard/agents`, { headers });
    check(agentRes, { 'agent status ok': (r) => r.status === 200 }) || errorRate.add(1);

    const funnelRes = http.get(`${BASE_URL}/dashboard/funnel`, { headers });
    check(funnelRes, { 'funnel ok': (r) => r.status === 200 }) || errorRate.add(1);

    sleep(5);
  }
}
