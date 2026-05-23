import { useState, useEffect } from 'react';
import { Card, Table, DatePicker, Button, Space, Select } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { reportApi, skillGroupApi } from '../../api/endpoints';

export default function GroupAgentReportPage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<Record<string, unknown>>({});

  useEffect(() => {
    skillGroupApi.list().then((res) => setGroups(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await reportApi.groupAgents(params);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch { /* */ }
    setLoading(false);
  };

  return (
    <Card title="分组坐席报表">
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="选择技能组" style={{ width: 200 }} allowClear onChange={(v) => setParams({ ...params, skill_group_id: v })} options={groups.map((g) => ({ value: g.id, label: g.name }))} />
        <DatePicker.RangePicker onChange={(_, dates) => setParams({ ...params, start_date: dates[0], end_date: dates[1] })} />
        <Button icon={<ReloadOutlined />} onClick={load}>查询</Button>
      </Space>
      <Table dataSource={data} rowKey="agent_id" loading={loading} size="small" columns={[
        { title: '技能组', dataIndex: 'skill_group_name' },
        { title: '坐席', dataIndex: 'agent_name' },
        { title: '呼入接听', dataIndex: 'inbound_answered' },
        { title: '呼出接通', dataIndex: 'outbound_answered' },
        { title: '平均通话(秒)', dataIndex: 'avg_talk_duration' },
        { title: '总通话时长', dataIndex: 'total_talk_duration' },
        { title: '满意度', dataIndex: 'satisfaction_avg' },
      ]} />
    </Card>
  );
}
