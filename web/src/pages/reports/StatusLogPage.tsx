import { useState } from 'react';
import { Card, Table, DatePicker, Button, Space, Select, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { reportApi } from '../../api/endpoints';

export default function StatusLogPage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try { const res = await reportApi.statusLog(params); setData(Array.isArray(res.data) ? res.data : []); } catch { /* */ }
    setLoading(false);
  };

  const statusColors: Record<string, string> = { READY: 'green', BUSY: 'orange', BREAK: 'blue', OFFLINE: 'default', DIALING: 'purple' };

  return (
    <Card title="坐席状态日志">
      <Space style={{ marginBottom: 16 }}>
        <DatePicker.RangePicker onChange={(_, dates) => setParams({ ...params, start_date: dates[0], end_date: dates[1] })} />
        <Select placeholder="状态筛选" allowClear style={{ width: 120 }} onChange={(v) => setParams({ ...params, status: v })} options={Object.keys(statusColors).map((k) => ({ value: k, label: k }))} />
        <Select placeholder="小休码" allowClear style={{ width: 140 }} onChange={(v) => setParams({ ...params, break_code: v })} options={['LUNCH', 'RESTROOM', 'TRAINING', 'MEETING'].map((v) => ({ value: v, label: v }))} />
        <Button icon={<ReloadOutlined />} onClick={load}>查询</Button>
      </Space>
      <Table dataSource={data} rowKey="id" loading={loading} size="small" columns={[
        { title: '坐席', dataIndex: 'agent_name' },
        { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
        { title: '子状态', dataIndex: 'sub_state' },
        { title: '小休码', dataIndex: 'break_code' },
        { title: '开始时间', dataIndex: 'started_at' },
        { title: '结束时间', dataIndex: 'ended_at' },
        { title: '时长(秒)', dataIndex: 'duration_sec' },
      ]} />
    </Card>
  );
}
