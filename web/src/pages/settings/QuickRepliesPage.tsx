import { Form, Input, Select } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import api from '../../api/client';

export default function QuickRepliesPage() {
  return (
    <CrudPage
      title="快捷回复管理"
      searchable
      fetchData={() => api.get('/quick-replies')}
      onCreate={(data) => api.post('/quick-replies', data)}
      onUpdate={(id, data) => api.put(`/quick-replies/${id}`, data)}
      onDelete={(id) => api.delete(`/quick-replies/${id}`)}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '标题', dataIndex: 'title' },
        { title: '内容', dataIndex: 'content', ellipsis: true },
        { title: '范围', dataIndex: 'scope' },
        { title: '分类', dataIndex: 'category' },
      ]}
      formItems={
        <>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="scope" label="范围" initialValue="global">
            <Select options={[{ value: 'global', label: '全局' }, { value: 'skill_group', label: '技能组' }, { value: 'agent', label: '坐席' }]} />
          </Form.Item>
          <Form.Item name="category" label="分类"><Input /></Form.Item>
        </>
      }
    />
  );
}
