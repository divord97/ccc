import { useState } from 'react';
import { Form, Input, Select, Tag, Modal, Table, Button, message } from 'antd';
import { PlusOutlined, ExperimentOutlined } from '@ant-design/icons';
import CrudPage from '../../components/common/CrudPage';
import { digitalEmployeeApi } from '../../api/endpoints';

export default function DigitalEmployeePage() {
  const [sceneModal, setSceneModal] = useState<{ id: number; name: string } | null>(null);
  const [scenes, setScenes] = useState<{ id: number; name: string; type: string; status: string }[]>([]);
  const [sceneForm] = Form.useForm();

  const loadScenes = async (id: number) => {
    try { const res = await digitalEmployeeApi.listScenes(id); setScenes(Array.isArray(res.data) ? res.data : []); } catch { /* */ }
  };

  const addScene = async () => {
    if (!sceneModal) return;
    const values = await sceneForm.validateFields();
    await digitalEmployeeApi.createScene(sceneModal.id, values);
    message.success('场景创建成功');
    sceneForm.resetFields();
    loadScenes(sceneModal.id);
  };

  return (
    <>
      <CrudPage
        title="数字员工"
        searchable
        fetchData={digitalEmployeeApi.list}
        onCreate={digitalEmployeeApi.create}
        onUpdate={digitalEmployeeApi.update}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '名称', dataIndex: 'name' },
          { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color="purple">{t}</Tag> },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s}</Tag> },
          {
            title: '场景', key: 'scenes',
            render: (_, r: { id: number; name: string }) => (
              <Button size="small" icon={<ExperimentOutlined />} onClick={() => { setSceneModal({ id: r.id, name: r.name }); loadScenes(r.id); }}>管理场景</Button>
            ),
          },
        ]}
        formItems={
          <>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="type" label="类型" initialValue="ivr_bot">
              <Select options={[{ value: 'ivr_bot', label: 'IVR 机器人' }, { value: 'im_bot', label: 'IM 机器人' }, { value: 'outbound_bot', label: '外呼机器人' }]} />
            </Form.Item>
            <Form.Item name="llm_model" label="LLM 模型"><Input placeholder="tongyi / openai" /></Form.Item>
          </>
        }
      />
      <Modal title={`场景管理 — ${sceneModal?.name}`} open={!!sceneModal} onCancel={() => setSceneModal(null)} footer={null} width={600}>
        <Form form={sceneForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="name" rules={[{ required: true }]}><Input placeholder="场景名称" /></Form.Item>
          <Form.Item name="type" initialValue="faq"><Select style={{ width: 120 }} options={[{ value: 'faq', label: 'FAQ' }, { value: 'intent', label: '意图' }, { value: 'dialog_flow', label: '对话流' }]} /></Form.Item>
          <Button icon={<PlusOutlined />} type="primary" onClick={addScene}>添加</Button>
        </Form>
        <Table dataSource={scenes} rowKey="id" size="small" pagination={false} columns={[
          { title: '场景', dataIndex: 'name' },
          { title: '类型', dataIndex: 'type', render: (t: string) => <Tag>{t}</Tag> },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s}</Tag> },
        ]} />
      </Modal>
    </>
  );
}
