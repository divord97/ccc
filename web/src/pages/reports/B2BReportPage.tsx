import { useState } from 'react';
import { Card, Table, DatePicker, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { reportApi } from '../../api/endpoints';

export default function B2BReportPage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try { const res = await reportApi.b2b(params); setData(Array.isArray(res.data) ? res.data : []); } catch { /* */ }
    setLoading(false);
  };

  return (
    <Card title="双呼报表">
      <Space style={{ marginBottom: 16 }}>
        <DatePicker.RangePicker onChange={(_, dates) => setParams({ ...params, start_date: dates[0], end_date: dates[1] })} />
        <Button icon={<ReloadOutlined />} onClick={load}>查询</Button>
      </Space>
      <Table dataSource={data} rowKey="id" loading={loading} size="small" columns={[
        { title: '日期', dataIndex: 'date' },
        { title: '双呼总量', dataIndex: 'total' },
        { title: '接通量', dataIndex: 'answered' },
        { title: '接通率', dataIndex: 'answer_rate', render: (v: number) => `${(v * 100).toFixed(1)}%` },
        { title: '平均时长(秒)', dataIndex: 'avg_duration' },
        { title: '总时长(秒)', dataIndex: 'total_duration' },
      ]} />
    </Card>
  );
}
