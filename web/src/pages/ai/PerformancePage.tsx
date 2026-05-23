import { useState } from 'react';
import { Card, Table, DatePicker, Button, Space, message } from 'antd';
import { ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { performanceApi } from '../../api/endpoints';

export default function PerformancePage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try { const res = await performanceApi.list(params); setData(Array.isArray(res.data) ? res.data : []); } catch { /* */ }
    setLoading(false);
  };

  return (
    <Card title="绩效管理">
      <Space style={{ marginBottom: 16 }}>
        <DatePicker.RangePicker onChange={(_, dates) => setParams({ start_date: dates[0], end_date: dates[1] })} />
        <Button icon={<ReloadOutlined />} onClick={load}>查询</Button>
        <Button icon={<ThunderboltOutlined />} type="primary" onClick={async () => { await performanceApi.generate(params); message.success('绩效计算已触发'); }}>生成记分卡</Button>
      </Space>
      <Table dataSource={data} rowKey="id" loading={loading} size="small" columns={[
        { title: '坐席', dataIndex: 'agent_name' },
        { title: '综合得分', dataIndex: 'total_score' },
        { title: '通话量', dataIndex: 'call_count' },
        { title: '平均通话时长', dataIndex: 'avg_duration' },
        { title: '满意度', dataIndex: 'satisfaction_score' },
        { title: '质检得分', dataIndex: 'qa_score' },
        { title: '首解率', dataIndex: 'fcr_rate', render: (v: number) => v ? `${(v * 100).toFixed(1)}%` : '-' },
        { title: '生成时间', dataIndex: 'created_at' },
      ]} />
    </Card>
  );
}
