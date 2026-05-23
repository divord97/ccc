import { Form, Input } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import api from '../../api/client';

export default function DispositionCodesPage() {
  return (
    <CrudPage
      title="结案代码管理"
      fetchData={() => api.get('/disposition-codes')}
      onCreate={(data) => api.post('/disposition-codes', data)}
      onUpdate={(id, data) => api.put(`/disposition-codes/${id}`, data)}
      onDelete={(id) => api.delete(`/disposition-codes/${id}`)}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '编码', dataIndex: 'code' },
        { title: '名称', dataIndex: 'name' },
        { title: '分类', dataIndex: 'category' },
      ]}
      formItems={
        <>
          <Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="分类"><Input /></Form.Item>
        </>
      }
    />
  );
}
