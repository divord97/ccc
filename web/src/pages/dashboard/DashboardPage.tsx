import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Spin } from 'antd';
import {
  PhoneOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { dashboardApi } from '../../api/endpoints';

interface Overview {
  total_calls_today: number;
  answered_calls: number;
  abandoned_calls: number;
  active_calls: number;
  agents_online: number;
  agents_busy: number;
  agents_idle: number;
  avg_wait_time_sec: number;
  avg_handle_time_sec: number;
  service_level_20s: number;
  queue_count: number;
  ivr_count: number;
  satisfaction_avg: number;
  callback_pending: number;
  ai_served: number;
  ai_transferred: number;
  total_im_sessions: number;
  im_active: number;
}

interface AgentStatus {
  agent_id: number;
  name: string;
  status: string;
  sub_state: string;
  current_call_duration: number;
  calls_handled: number;
}

interface FunnelData {
  total_inbound: number;
  ivr_completed: number;
  to_agent: number;
  to_bot: number;
  answered: number;
  abandoned: number;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, ag, fn] = await Promise.all([
          dashboardApi.overview(),
          dashboardApi.agents(),
          dashboardApi.funnel(),
        ]);
        setOverview(ov.data);
        setAgents(Array.isArray(ag.data) ? ag.data : []);
        setFunnel(fn.data);
      } catch { /* API not connected yet */ }
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const ov = overview || {} as Overview;

  return (
    <>
      <h2>实时概览</h2>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="今日总呼叫" value={ov.total_calls_today || 0} prefix={<PhoneOutlined />} /></Card></Col>
        <Col span={4}><Card><Statistic title="已接听" value={ov.answered_calls || 0} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#3f8600' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="放弃" value={ov.abandoned_calls || 0} prefix={<WarningOutlined />} valueStyle={{ color: '#cf1322' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="进行中" value={ov.active_calls || 0} prefix={<PhoneOutlined />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="排队中" value={ov.queue_count || 0} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={4}><Card><Statistic title="IVR中" value={ov.ivr_count || 0} prefix={<RiseOutlined />} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={4}><Card><Statistic title="在线坐席" value={ov.agents_online || 0} prefix={<TeamOutlined />} /></Card></Col>
        <Col span={4}><Card><Statistic title="忙碌" value={ov.agents_busy || 0} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="空闲" value={ov.agents_idle || 0} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="平均等待(秒)" value={ov.avg_wait_time_sec || 0} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={4}><Card><Statistic title="20s服务水平" value={ov.service_level_20s || 0} suffix="%" prefix={<RiseOutlined />} /></Card></Col>
        <Col span={4}><Card><Statistic title="满意度" value={ov.satisfaction_avg || 0} suffix="/5" prefix={<FallOutlined />} /></Card></Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card title="坐席实时状态">
            <Table<AgentStatus>
              dataSource={agents}
              rowKey="agent_id"
              size="small"
              pagination={false}
              columns={[
                { title: '坐席', dataIndex: 'name' },
                { title: '状态', dataIndex: 'status', render: (s: string) => {
                  const colors: Record<string, string> = { READY: 'green', BUSY: 'orange', BREAK: 'blue', OFFLINE: 'default', DIALING: 'purple' };
                  return <Tag color={colors[s] || 'default'}>{s}</Tag>;
                }},
                { title: '子状态', dataIndex: 'sub_state' },
                { title: '当前通话(秒)', dataIndex: 'current_call_duration' },
                { title: '今日处理', dataIndex: 'calls_handled' },
              ]}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="呼叫漏斗">
            {funnel && (
              <div>
                <Statistic title="总呼入" value={funnel.total_inbound} />
                <Statistic title="IVR 完成" value={funnel.ivr_completed} style={{ marginTop: 8 }} />
                <Statistic title="转人工" value={funnel.to_agent} style={{ marginTop: 8 }} />
                <Statistic title="转机器人" value={funnel.to_bot} style={{ marginTop: 8 }} />
                <Statistic title="已接听" value={funnel.answered} style={{ marginTop: 8 }} valueStyle={{ color: '#3f8600' }} />
                <Statistic title="放弃" value={funnel.abandoned} style={{ marginTop: 8 }} valueStyle={{ color: '#cf1322' }} />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
}
