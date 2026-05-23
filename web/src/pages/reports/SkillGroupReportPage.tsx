import { useState } from 'react';
import { Card, Table, DatePicker, Button, Space } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { reportApi } from '../../api/endpoints';
import dayjs from 'dayjs';

export default function SkillGroupReportPage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await reportApi.skillGroups(params);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch { /* */ }
    setLoading(false);
  };

  const handleExport = async () => {
    const res = await reportApi.exportSkillGroups(params);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill-group-report-${dayjs().format('YYYYMMDD')}.csv`;
    a.click();
  };

  return (
    <Card title="技能组报表">
      <Space style={{ marginBottom: 16 }}>
        <DatePicker.RangePicker onChange={(_, dates) => setParams({ ...params, start_date: dates[0], end_date: dates[1] })} />
        <Button icon={<ReloadOutlined />} onClick={load}>查询</Button>
        <Button icon={<DownloadOutlined />} onClick={handleExport}>导出CSV</Button>
      </Space>
      <Table dataSource={data} rowKey="skill_group_id" loading={loading} size="small" columns={[
        { title: '技能组', dataIndex: 'skill_group_name' },
        { title: '呼入总量', dataIndex: 'inbound_total' },
        { title: '接听量', dataIndex: 'answered' },
        { title: '放弃量', dataIndex: 'abandoned' },
        { title: '排队总量', dataIndex: 'queue_total' },
        { title: '排队放弃量', dataIndex: 'queue_abandoned' },
        { title: '振铃放弃量', dataIndex: 'ring_abandoned' },
        { title: '20s应答率', dataIndex: 'service_level_20s', render: (v: number) => `${(v * 100).toFixed(1)}%` },
        { title: '平均等待(秒)', dataIndex: 'avg_wait_time' },
        { title: '平均通话(秒)', dataIndex: 'avg_talk_time' },
      ]} />
    </Card>
  );
}
