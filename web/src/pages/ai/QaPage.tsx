import { useState } from 'react';
import { Card, Tabs, Table, Button, Form, Input, Select, Tag, Modal, message, Space, Descriptions } from 'antd';
import { PlusOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { qaApi } from '../../api/endpoints';

export default function QaPage() {
  const [rules, setRules] = useState<{ id: number; name: string; type: string; condition: string }[]>([]);
  const [schemes, setSchemes] = useState<{ id: number; name: string; status: string }[]>([]);
  const [results, setResults] = useState<{ id: number; call_id: number; score: number; status: string; created_at: string }[]>([]);
  const [ruleModal, setRuleModal] = useState(false);
  const [schemeModal, setSchemeModal] = useState(false);
  const [detailModal, setDetailModal] = useState<Record<string, unknown> | null>(null);
  const [ruleForm] = Form.useForm();
  const [schemeForm] = Form.useForm();

  const loadRules = async () => { try { const res = await qaApi.listRules(); setRules(Array.isArray(res.data) ? res.data : []); } catch { /* */ } };
  const loadSchemes = async () => { try { const res = await qaApi.listSchemes(); setSchemes(Array.isArray(res.data) ? res.data : []); } catch { /* */ } };
  const loadResults = async () => { try { const res = await qaApi.listResults(); setResults(Array.isArray(res.data) ? res.data : []); } catch { /* */ } };

  const statusColors: Record<string, string> = { pending: 'default', passed: 'green', failed: 'red', appealed: 'orange', reviewed: 'blue' };

  return (
    <Tabs defaultActiveKey="rules" onChange={(k) => { if (k === 'rules') loadRules(); if (k === 'schemes') loadSchemes(); if (k === 'results') loadResults(); }}
      items={[
        {
          key: 'rules', label: '质检规则',
          children: (
            <Card extra={<Button icon={<PlusOutlined />} type="primary" onClick={() => setRuleModal(true)}>新建规则</Button>}>
              <Table dataSource={rules} rowKey="id" size="small" columns={[
                { title: 'ID', dataIndex: 'id', width: 80 },
                { title: '规则名', dataIndex: 'name' },
                { title: '类型', dataIndex: 'type', render: (t: string) => <Tag>{t}</Tag> },
                { title: '条件', dataIndex: 'condition', ellipsis: true },
                { title: '操作', key: 'action', render: (_, r: { id: number }) => <Button size="small" danger onClick={async () => { await qaApi.deleteRule(r.id); message.success('已删除'); loadRules(); }}>删除</Button> },
              ]} />
              <Modal title="新建质检规则" open={ruleModal} onCancel={() => setRuleModal(false)} onOk={async () => {
                const v = await ruleForm.validateFields(); await qaApi.createRule(v); message.success('创建成功'); setRuleModal(false); ruleForm.resetFields(); loadRules();
              }}>
                <Form form={ruleForm} layout="vertical">
                  <Form.Item name="name" label="规则名" rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="type" label="类型" initialValue="keyword"><Select options={[{ value: 'keyword', label: '关键词' }, { value: 'silence', label: '静音检测' }, { value: 'speed', label: '语速' }, { value: 'emotion', label: '情绪' }, { value: 'llm', label: '大模型' }]} /></Form.Item>
                  <Form.Item name="condition" label="规则条件(JSON)"><Input.TextArea rows={3} /></Form.Item>
                  <Form.Item name="score_impact" label="扣分值"><Input type="number" /></Form.Item>
                </Form>
              </Modal>
            </Card>
          ),
        },
        {
          key: 'schemes', label: '质检方案',
          children: (
            <Card extra={<Button icon={<PlusOutlined />} type="primary" onClick={() => setSchemeModal(true)}>新建方案</Button>}>
              <Table dataSource={schemes} rowKey="id" size="small" columns={[
                { title: 'ID', dataIndex: 'id', width: 80 },
                { title: '方案名', dataIndex: 'name' },
                { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s}</Tag> },
              ]} />
              <Modal title="新建质检方案" open={schemeModal} onCancel={() => setSchemeModal(false)} onOk={async () => {
                const v = await schemeForm.validateFields(); await qaApi.createScheme(v); message.success('创建成功'); setSchemeModal(false); schemeForm.resetFields(); loadSchemes();
              }}>
                <Form form={schemeForm} layout="vertical">
                  <Form.Item name="name" label="方案名" rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="rule_ids" label="规则ID(逗号分隔)"><Input placeholder="1,2,3" /></Form.Item>
                </Form>
              </Modal>
            </Card>
          ),
        },
        {
          key: 'results', label: '质检结果',
          children: (
            <Card extra={<Button icon={<PlayCircleOutlined />} type="primary" onClick={async () => { await qaApi.runInspection({}); message.success('质检任务已触发'); }}>手动质检</Button>}>
              <Table dataSource={results} rowKey="id" size="small" onRow={(r) => ({ onClick: async () => { const res = await qaApi.getResult(r.id); setDetailModal(res.data); }, style: { cursor: 'pointer' } })} columns={[
                { title: 'ID', dataIndex: 'id', width: 80 },
                { title: '通话ID', dataIndex: 'call_id' },
                { title: '得分', dataIndex: 'score' },
                { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
                { title: '时间', dataIndex: 'created_at' },
                { title: '操作', key: 'action', render: (_, r: { id: number; status: string }) => (
                  <Space>
                    {r.status === 'failed' && <Button size="small" onClick={async () => { await qaApi.appeal(r.id, { reason: '申诉' }); message.success('已申诉'); loadResults(); }}>申诉</Button>}
                    {r.status === 'appealed' && <Button size="small" onClick={async () => { await qaApi.review(r.id, { approved: true }); message.success('已复核'); loadResults(); }}>复核通过</Button>}
                  </Space>
                )},
              ]} />
              <Modal title="质检详情" open={!!detailModal} onCancel={() => setDetailModal(null)} footer={null}>
                {detailModal && <Descriptions bordered size="small" column={1}>
                  {Object.entries(detailModal).map(([k, v]) => <Descriptions.Item key={k} label={k}>{String(v)}</Descriptions.Item>)}
                </Descriptions>}
              </Modal>
            </Card>
          ),
        },
      ]}
    />
  );
}
