import { Form, Input, Tag } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import api from '../../api/client';

export default function BreakReasonsPage() {
  return (
    <CrudPage
      title="小休原因管理"
      fetchData={() => api.get('/break-reasons')}
      onCreate={(data) => api.post('/break-reasons', data)}
      onUpdate={(id, data) => api.put(`/break-reasons/${id}`, data)}
      onDelete={(id) => api.delete(`/break-reasons/${id}`)}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '编码', dataIndex: 'code' },
        { title: '名称', dataIndex: 'name' },
        { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color={t === 'system' ? 'red' : 'blue'}>{t === 'system' ? '系统' : '自定义'}</Tag> },
      ]}
      formItems={
        <>
          <Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
        </>
      }
    />
  );
}
