import { useState, useEffect } from 'react';
import { Card, Table, DatePicker, Input, Space, Button, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../api/client';

export default function AuditLogPage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/audit-logs', { params }); setData(Array.isArray(res.data) ? res.data : []); } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const methodColors: Record<string, string> = { POST: 'green', PUT: 'blue', DELETE: 'red', PATCH: 'orange' };

  return (
    <Card title="审计日志">
      <Space style={{ marginBottom: 16 }}>
        <Input prefix={<SearchOutlined />} placeholder="操作人" onChange={(e) => setParams({ ...params, user: e.target.value })} style={{ width: 150 }} allowClear />
        <Input prefix={<SearchOutlined />} placeholder="API路径" onChange={(e) => setParams({ ...params, path: e.target.value })} style={{ width: 200 }} allowClear />
        <DatePicker.RangePicker onChange={(_, dates) => setParams({ ...params, start_date: dates[0], end_date: dates[1] })} />
        <Button icon={<ReloadOutlined />} onClick={load}>查询</Button>
      </Space>
      <Table dataSource={data} rowKey="id" loading={loading} size="small" columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '操作人', dataIndex: 'user_name' },
        { title: '方法', dataIndex: 'method', render: (m: string) => <Tag color={methodColors[m]}>{m}</Tag> },
        { title: 'API路径', dataIndex: 'path' },
        { title: '状态码', dataIndex: 'status_code' },
        { title: 'IP', dataIndex: 'ip_address' },
        { title: '时间', dataIndex: 'created_at' },
      ]} />
    </Card>
  );
}
