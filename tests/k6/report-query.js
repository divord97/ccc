// k6 load test: Report query performance
// Target: 1M CDR records, complex aggregation queries < 5s
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8080/api/v1';
const TOKEN = __ENV.AUTH_TOKEN || '';

const errorRate = new Rate('errors');
const queryDuration = new Trend('report_query_duration');

export const options = {
  scenarios: {
    agent_report: {
      executor: 'constant-vus',
      vus: 20,
      duration: '5m',
      exec: 'agentReport',
    },
    skill_group_report: {
      executor: 'constant-vus',
      vus: 10,
      duration: '5m',
      exec: 'skillGroupReport',
    },
    call_records: {
      executor: 'constant-vus',
      vus: 30,
      duration: '5m',
      exec: 'callRecords',
    },
    export_csv: {
      executor: 'constant-vus',
      vus: 5,
      duration: '5m',
      exec: 'exportCsv',
    },
  },
  thresholds: {
    report_query_duration: ['p(95)<5000'],
    errors: ['rate<0.05'],
  },
};

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
};

export function agentReport() {
  const start = Date.now();
  const res = http.get(
    `${BASE_URL}/reports/agents?start_date=2025-01-01&end_date=2025-12-31`,
    { headers }
  );
  queryDuration.add(Date.now() - start);

  check(res, { 'agent report ok': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(1);
}

export function skillGroupReport() {
  const start = Date.now();
  const res = http.get(
    `${BASE_URL}/reports/skill-groups?start_date=2025-01-01&end_date=2025-12-31`,
    { headers }
  );
  queryDuration.add(Date.now() - start);

  check(res, { 'skill group report ok': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(1);
}

export function callRecords() {
  const page = Math.floor(Math.random() * 100) + 1;
  const start = Date.now();
  const res = http.get(
    `${BASE_URL}/calls?page=${page}&page_size=50&start_date=2025-01-01&end_date=2025-12-31`,
    { headers }
  );
  queryDuration.add(Date.now() - start);

  check(res, { 'call records ok': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(0.5);
}

export function exportCsv() {
  const start = Date.now();
  const res = http.get(
    `${BASE_URL}/reports/agents/export?start_date=2025-06-01&end_date=2025-06-30&format=csv`,
    { headers }
  );
  queryDuration.add(Date.now() - start);

  check(res, { 'csv export ok': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(5);
}
