import { useState, useEffect } from 'react';
import { Card, Table, DatePicker, Button, Space } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { reportApi } from '../../api/endpoints';
import dayjs from 'dayjs';

export default function AgentReportPage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await reportApi.agents(params);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleExport = async () => {
    const res = await reportApi.exportAgents(params);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-report-${dayjs().format('YYYYMMDD')}.csv`;
    a.click();
  };

  return (
    <Card title="坐席报表">
      <Space style={{ marginBottom: 16 }}>
        <DatePicker.RangePicker onChange={(_, dates) => setParams({ ...params, start_date: dates[0], end_date: dates[1] })} />
        <Button icon={<ReloadOutlined />} onClick={load}>查询</Button>
        <Button icon={<DownloadOutlined />} onClick={handleExport}>导出CSV</Button>
      </Space>
      <Table dataSource={data} rowKey="agent_id" loading={loading} size="small" scroll={{ x: 2000 }} columns={[
        { title: '坐席', dataIndex: 'agent_name', fixed: 'left', width: 100 },
        { title: '呼入总量', dataIndex: 'inbound_total' },
        { title: '呼入接听', dataIndex: 'inbound_answered' },
        { title: '呼入接听率', dataIndex: 'inbound_answer_rate', render: (v: number) => `${(v * 100).toFixed(1)}%` },
        { title: '呼出总量', dataIndex: 'outbound_total' },
        { title: '呼出接通', dataIndex: 'outbound_answered' },
        { title: '平均通话(秒)', dataIndex: 'avg_talk_duration' },
        { title: '平均振铃(秒)', dataIndex: 'avg_ring_duration' },
        { title: '平均后处理(秒)', dataIndex: 'avg_acw_duration' },
        { title: '总通话时长', dataIndex: 'total_talk_duration' },
        { title: '总就绪时长', dataIndex: 'total_ready_duration' },
        { title: '总小休时长', dataIndex: 'total_break_duration' },
        { title: '利用率', dataIndex: 'utilization_rate', render: (v: number) => `${(v * 100).toFixed(1)}%` },
        { title: '满意度', dataIndex: 'satisfaction_avg' },
        { title: '首次解决率', dataIndex: 'fcr_rate', render: (v: number) => v ? `${(v * 100).toFixed(1)}%` : '-' },
      ]} />
    </Card>
  );
}
