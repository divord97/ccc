import { Form, Input, Tag } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import api from '../../api/client';

export default function CallTagsPage() {
  return (
    <CrudPage
      title="号码标签管理"
      fetchData={() => api.get('/call-tags')}
      onCreate={(data) => api.post('/call-tags', data)}
      onUpdate={(id, data) => api.put(`/call-tags/${id}`, data)}
      onDelete={(id) => api.delete(`/call-tags/${id}`)}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '标签名', dataIndex: 'name', render: (n: string) => <Tag color="blue">{n}</Tag> },
        { title: '描述', dataIndex: 'description' },
      ]}
      formItems={
        <>
          <Form.Item name="name" label="标签名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
        </>
      }
    />
  );
}
