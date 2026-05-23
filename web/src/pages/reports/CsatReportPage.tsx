import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Statistic, Row, Col } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { csatApi } from '../../api/endpoints';

interface CsatResult {
  id: number;
  call_id: number;
  score: number;
  created_at: string;
}

export default function CsatReportPage() {
  const [results, setResults] = useState<CsatResult[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await csatApi.listResults();
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const avg = results.length > 0 ? (results.reduce((s, r) => s + r.score, 0) / results.length).toFixed(1) : '-';
  const satisfied = results.filter((r) => r.score >= 4).length;

  return (
    <Card title="满意度报表" extra={<Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Statistic title="总评价数" value={results.length} /></Col>
        <Col span={6}><Statistic title="平均分" value={avg} suffix="/5" /></Col>
        <Col span={6}><Statistic title="满意(4-5分)" value={satisfied} valueStyle={{ color: '#3f8600' }} /></Col>
        <Col span={6}><Statistic title="满意率" value={results.length ? `${((satisfied / results.length) * 100).toFixed(1)}%` : '-'} /></Col>
      </Row>
      <Table<CsatResult> dataSource={results} rowKey="id" loading={loading} size="small" columns={[
        { title: '通话ID', dataIndex: 'call_id' },
        { title: '评分', dataIndex: 'score', render: (s: number) => <Tag color={s >= 4 ? 'green' : s >= 3 ? 'orange' : 'red'}>{s}</Tag> },
        { title: '时间', dataIndex: 'created_at' },
      ]} />
    </Card>
  );
}
