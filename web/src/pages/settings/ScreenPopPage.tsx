import { Form, Input, InputNumber, Switch } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import api from '../../api/client';

export default function ScreenPopPage() {
  return (
    <CrudPage
      title="来电弹屏配置"
      fetchData={() => api.get('/screen-pop-configs')}
      onCreate={(data) => api.post('/screen-pop-configs', data)}
      onUpdate={(id, data) => api.put(`/screen-pop-configs/${id}`, data)}
      onDelete={(id) => api.delete(`/screen-pop-configs/${id}`)}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '名称', dataIndex: 'name' },
        { title: 'URL模板', dataIndex: 'url_template', ellipsis: true },
        { title: '排序', dataIndex: 'sort_order' },
        { title: '启用', dataIndex: 'enabled', render: (e: boolean) => e ? '是' : '否' },
      ]}
      formItems={
        <>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="url_template" label="URL模板" rules={[{ required: true }]}><Input placeholder="https://crm.example.com/pop?phone=${caller}&callId=${callId}" /></Form.Item>
          <Form.Item name="sort_order" label="排序" initialValue={0}><InputNumber /></Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </>
      }
    />
  );
}
