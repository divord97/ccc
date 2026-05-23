import { Form, Input, Select, InputNumber, Tag } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import { agentApi } from '../../api/endpoints';

const statusColors: Record<string, string> = { READY: 'green', BUSY: 'orange', BREAK: 'blue', OFFLINE: 'default', DIALING: 'purple' };

export default function AgentListPage() {
  return (
    <CrudPage
      title="坐席管理"
      searchable
      fetchData={agentApi.list}
      onCreate={agentApi.create}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '姓名', dataIndex: 'display_name' },
        { title: '工号', dataIndex: 'work_number' },
        { title: '邮箱', dataIndex: 'email' },
        { title: '分机号', dataIndex: 'extension' },
        { title: '角色', dataIndex: 'role', render: (r: string) => <Tag>{r}</Tag> },
        { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
        { title: '工作模式', dataIndex: 'work_mode' },
      ]}
      formItems={
        <>
          <Form.Item name="display_name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="work_number" label="工号">
            <Input />
          </Form.Item>
          <Form.Item name="extension" label="分机号">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" initialValue="agent">
            <Select options={[{ value: 'admin', label: '管理员' }, { value: 'manager', label: '主管' }, { value: 'agent', label: '坐席' }]} />
          </Form.Item>
          <Form.Item name="max_concurrent_chats" label="最大并发会话" initialValue={1}>
            <InputNumber min={1} max={20} />
          </Form.Item>
        </>
      }
    />
  );
}
