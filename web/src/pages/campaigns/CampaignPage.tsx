import { useState } from 'react';
import { Form, Input, Select, InputNumber, Tag, Button, Space, Modal, Upload, message, Row, Col, Statistic, Progress } from 'antd';
import { PlayCircleOutlined, PauseOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons';
import CrudPage from '../../components/common/CrudPage';
import { campaignApi } from '../../api/endpoints';

const statusColors: Record<string, string> = { draft: 'default', running: 'green', paused: 'orange', completed: 'blue', aborted: 'red' };
const modeLabels: Record<string, string> = { PREDICTIVE: '预测式', PROGRESSIVE: '渐进式', POWER: '强力', PREVIEW: '预览式' };

export default function CampaignPage() {
  const [statsModal, setStatsModal] = useState<{ id: number; name: string } | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [importModal, setImportModal] = useState<number | null>(null);

  const loadStats = async (id: number) => {
    try { const res = await campaignApi.stats(id); setStats(res.data); } catch { /* */ }
  };

  const handleAction = async (id: number, action: 'start' | 'pause' | 'resume' | 'abort') => {
    try { await campaignApi[action](id); message.success(`${action} 成功`); } catch (e: unknown) { message.error((e as Error).message); }
  };

  return (
    <>
      <CrudPage
        title="批量外呼活动"
        searchable
        fetchData={campaignApi.list}
        onCreate={campaignApi.create}
        onUpdate={campaignApi.update}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '名称', dataIndex: 'name' },
          { title: '模式', dataIndex: 'dialing_mode', render: (m: string) => <Tag color="blue">{modeLabels[m] || m}</Tag> },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
          { title: '总案例', dataIndex: 'total_cases' },
          { title: '已完成', dataIndex: 'completed_cases' },
          {
            title: '操作', key: 'actions', width: 340,
            render: (_, record: { id: number; name: string; status: string }) => (
              <Space size="small">
                {record.status === 'draft' && <Button size="small" icon={<PlayCircleOutlined />} onClick={() => handleAction(record.id, 'start')}>启动</Button>}
                {record.status === 'running' && <Button size="small" icon={<PauseOutlined />} onClick={() => handleAction(record.id, 'pause')}>暂停</Button>}
                {record.status === 'paused' && <Button size="small" icon={<PlayCircleOutlined />} onClick={() => handleAction(record.id, 'resume')}>恢复</Button>}
                {['running', 'paused'].includes(record.status) && <Button size="small" danger icon={<StopOutlined />} onClick={() => handleAction(record.id, 'abort')}>终止</Button>}
                <Button size="small" onClick={() => { setStatsModal({ id: record.id, name: record.name }); loadStats(record.id); }}>统计</Button>
                <Button size="small" icon={<UploadOutlined />} onClick={() => setImportModal(record.id)}>导入</Button>
              </Space>
            ),
          },
        ]}
        formItems={
          <>
            <Form.Item name="name" label="活动名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="dialing_mode" label="外呼模式" initialValue="PROGRESSIVE">
              <Select options={Object.entries(modeLabels).map(([k, v]) => ({ value: k, label: v }))} />
            </Form.Item>
            <Form.Item name="skill_group_id" label="技能组ID"><InputNumber /></Form.Item>
            <Form.Item name="concurrent_limit" label="并发限制" initialValue={10}><InputNumber min={1} max={200} /></Form.Item>
            <Form.Item name="max_abandon_rate" label="最大放弃率(%)" initialValue={3}><InputNumber min={1} max={10} /></Form.Item>
            <Form.Item name="preview_timeout_sec" label="预览超时(秒)" initialValue={30}><InputNumber min={10} max={120} /></Form.Item>
            <Form.Item name="caller_number" label="外显号码"><Input /></Form.Item>
          </>
        }
      />
      <Modal title={`实时统计 — ${statsModal?.name}`} open={!!statsModal} onCancel={() => setStatsModal(null)} footer={null} width={600}>
        <Row gutter={[16, 16]}>
          <Col span={8}><Statistic title="总案例" value={stats.total || 0} /></Col>
          <Col span={8}><Statistic title="已完成" value={stats.completed || 0} valueStyle={{ color: '#3f8600' }} /></Col>
          <Col span={8}><Statistic title="待处理" value={stats.pending || 0} /></Col>
          <Col span={8}><Statistic title="接通数" value={stats.answered || 0} /></Col>
          <Col span={8}><Statistic title="未接通" value={stats.unanswered || 0} /></Col>
          <Col span={8}><Statistic title="放弃率" value={stats.abandon_rate || 0} suffix="%" /></Col>
          <Col span={24}><Progress percent={stats.total ? Math.round((stats.completed || 0) / stats.total * 100) : 0} /></Col>
        </Row>
      </Modal>
      <Modal title="导入案例" open={!!importModal} onCancel={() => setImportModal(null)} footer={null}>
        <Upload.Dragger accept=".csv,.xlsx" customRequest={async ({ file, onSuccess }) => {
          const formData = new FormData();
          formData.append('file', file as File);
          await campaignApi.importCases(importModal!, { file: formData });
          message.success('导入成功');
          onSuccess?.({});
          setImportModal(null);
        }}>
          <p>点击或拖拽上传 CSV/XLSX 文件</p>
        </Upload.Dragger>
      </Modal>
    </>
  );
}
