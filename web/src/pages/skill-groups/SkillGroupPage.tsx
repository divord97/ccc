import { useState } from 'react';
import { Form, Input, Select, InputNumber, Modal, Table, Button, message, Tag } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import CrudPage from '../../components/common/CrudPage';
import { skillGroupApi, agentApi } from '../../api/endpoints';

export default function SkillGroupPage() {
  const [memberModal, setMemberModal] = useState<{ groupId: number; name: string } | null>(null);
  const [members, setMembers] = useState<{ agent_id: number; display_name: string; priority: number }[]>([]);
  const [agents, setAgents] = useState<{ id: number; display_name: string }[]>([]);
  const [addForm] = Form.useForm();

  const loadMembers = async (groupId: number) => {
    try {
      const [m, a] = await Promise.all([skillGroupApi.getMembers(groupId), agentApi.list()]);
      setMembers(Array.isArray(m.data) ? m.data : []);
      setAgents(Array.isArray(a.data) ? a.data : []);
    } catch { /* */ }
  };

  const handleAddMember = async () => {
    if (!memberModal) return;
    try {
      const values = await addForm.validateFields();
      await skillGroupApi.addMember(memberModal.groupId, values);
      message.success('添加成功');
      addForm.resetFields();
      loadMembers(memberModal.groupId);
    } catch { /* */ }
  };

  const handleRemoveMember = async (agentId: number) => {
    if (!memberModal) return;
    await skillGroupApi.removeMember(memberModal.groupId, agentId);
    message.success('移除成功');
    loadMembers(memberModal.groupId);
  };

  return (
    <>
      <CrudPage
        title="技能组管理"
        searchable
        fetchData={skillGroupApi.list}
        onCreate={skillGroupApi.create}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '名称', dataIndex: 'name' },
          { title: '路由策略', dataIndex: 'routing_strategy', render: (s: string) => <Tag color="blue">{s}</Tag> },
          { title: '最大排队', dataIndex: 'max_queue_size' },
          { title: '排队超时(秒)', dataIndex: 'queue_timeout_sec' },
          { title: '溢出目标', dataIndex: 'overflow_target' },
          {
            title: '成员管理',
            key: 'members',
            render: (_, record: { id: number; name: string }) => (
              <Button size="small" icon={<TeamOutlined />} onClick={() => { setMemberModal({ groupId: record.id, name: record.name }); loadMembers(record.id); }}>
                管理成员
              </Button>
            ),
          },
        ]}
        formItems={
          <>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="routing_strategy" label="路由策略" initialValue="ROUND_ROBIN">
              <Select options={[
                { value: 'ROUND_ROBIN', label: '轮询' },
                { value: 'LEAST_RECENT', label: '最久未接' },
                { value: 'MOST_IDLE', label: '最长空闲' },
                { value: 'FAMILIAR', label: '熟人模式' },
              ]} />
            </Form.Item>
            <Form.Item name="max_queue_size" label="最大排队数" initialValue={50}><InputNumber min={1} max={1000} /></Form.Item>
            <Form.Item name="queue_timeout_sec" label="排队超时(秒)" initialValue={60}><InputNumber min={10} max={600} /></Form.Item>
            <Form.Item name="overflow_target" label="溢出目标" initialValue="reject">
              <Select options={[{ value: 'reject', label: '挂机' }, { value: 'voicemail', label: '语音信箱' }, { value: 'transfer', label: '转接' }]} />
            </Form.Item>
          </>
        }
      />
      <Modal title={`成员管理 — ${memberModal?.name}`} open={!!memberModal} onCancel={() => setMemberModal(null)} footer={null} width={600}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <Form form={addForm} layout="inline">
            <Form.Item name="agent_id" rules={[{ required: true }]}>
              <Select placeholder="选择坐席" style={{ width: 200 }} options={agents.map((a) => ({ value: a.id, label: a.display_name }))} />
            </Form.Item>
            <Form.Item name="priority" initialValue={10}><InputNumber min={1} max={100} placeholder="优先级" /></Form.Item>
          </Form>
          <Button type="primary" onClick={handleAddMember}>添加</Button>
        </div>
        <Table dataSource={members} rowKey="agent_id" size="small" pagination={false} columns={[
          { title: '坐席', dataIndex: 'display_name' },
          { title: '优先级', dataIndex: 'priority' },
          { title: '操作', key: 'action', render: (_, r: { agent_id: number }) => <Button size="small" danger onClick={() => handleRemoveMember(r.agent_id)}>移除</Button> },
        ]} />
      </Modal>
    </>
  );
}
