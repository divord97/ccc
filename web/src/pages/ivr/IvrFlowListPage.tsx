import { useState } from 'react';
import { Form, Input, Select, Tag, Button, Modal, message, Descriptions, Space } from 'antd';
import { EditOutlined, CopyOutlined, LockOutlined, UnlockOutlined, SendOutlined } from '@ant-design/icons';
import CrudPage from '../../components/common/CrudPage';
import { ivrFlowApi } from '../../api/endpoints';
import IvrFlowEditor from './IvrFlowEditor';

const statusColors: Record<string, string> = { draft: 'default', published: 'green', editing: 'blue', failed: 'red' };

export default function IvrFlowListPage() {
  const [editorOpen, setEditorOpen] = useState<{ id: number; name: string } | null>(null);
  const [versionModal, setVersionModal] = useState<{ id: number } | null>(null);
  const [versions, setVersions] = useState<{ version: number; created_at: string; status: string }[]>([]);

  const loadVersions = async (id: number) => {
    try {
      const res = await ivrFlowApi.versions(id);
      setVersions(Array.isArray(res.data) ? res.data : []);
    } catch { /* */ }
  };

  const handleAction = async (id: number, action: 'publish' | 'lock' | 'unlock' | 'clone') => {
    try {
      await ivrFlowApi[action](id);
      message.success(`${action} 成功`);
    } catch (e: unknown) {
      message.error(`${action} 失败: ${(e as Error).message}`);
    }
  };

  return (
    <>
      <CrudPage
        title="IVR 流程管理"
        searchable
        fetchData={ivrFlowApi.list}
        onCreate={ivrFlowApi.create}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '名称', dataIndex: 'name' },
          { title: '描述', dataIndex: 'description', ellipsis: true },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
          { title: '版本', dataIndex: 'current_version' },
          {
            title: '操作',
            key: 'actions',
            width: 300,
            render: (_, record: { id: number; name: string; status: string }) => (
              <Space size="small">
                <Button size="small" icon={<EditOutlined />} onClick={() => setEditorOpen({ id: record.id, name: record.name })}>编辑</Button>
                <Button size="small" icon={<SendOutlined />} onClick={() => handleAction(record.id, 'publish')} disabled={record.status === 'published'}>发布</Button>
                <Button size="small" icon={<LockOutlined />} onClick={() => handleAction(record.id, 'lock')}>锁定</Button>
                <Button size="small" icon={<UnlockOutlined />} onClick={() => handleAction(record.id, 'unlock')}>解锁</Button>
                <Button size="small" icon={<CopyOutlined />} onClick={() => handleAction(record.id, 'clone')}>克隆</Button>
                <Button size="small" onClick={() => { setVersionModal({ id: record.id }); loadVersions(record.id); }}>历史</Button>
              </Space>
            ),
          },
        ]}
        formItems={
          <>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
            <Form.Item name="status" label="状态" initialValue="draft">
              <Select options={[{ value: 'draft', label: '草稿' }, { value: 'published', label: '已发布' }]} />
            </Form.Item>
          </>
        }
      />
      <Modal title={`IVR 编辑器 — ${editorOpen?.name}`} open={!!editorOpen} onCancel={() => setEditorOpen(null)} footer={null} width="90%" style={{ top: 20 }}>
        {editorOpen && <IvrFlowEditor flowId={editorOpen.id} />}
      </Modal>
      <Modal title="版本历史" open={!!versionModal} onCancel={() => setVersionModal(null)} footer={null}>
        {versions.map((v) => (
          <Descriptions key={v.version} bordered size="small" style={{ marginBottom: 8 }}>
            <Descriptions.Item label="版本">{v.version}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{v.created_at}</Descriptions.Item>
            <Descriptions.Item label="操作">
              <Button size="small" onClick={async () => { await ivrFlowApi.rollback(versionModal!.id, v.version); message.success('回滚成功'); }}>回滚到此版本</Button>
            </Descriptions.Item>
          </Descriptions>
        ))}
      </Modal>
    </>
  );
}
