import { Form, Input, Switch } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import api from '../../api/client';

export default function SmsConfigPage() {
  return (
    <CrudPage
      title="短信配置"
      fetchData={() => api.get('/sms-configs')}
      onCreate={(data) => api.post('/sms-configs', data)}
      onUpdate={(id, data) => api.put(`/sms-configs/${id}`, data)}
      onDelete={(id) => api.delete(`/sms-configs/${id}`)}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '渠道', dataIndex: 'provider' },
        { title: '签名', dataIndex: 'sign_name' },
        { title: '模板ID', dataIndex: 'template_id' },
        { title: '启用', dataIndex: 'enabled', render: (e: boolean) => e ? '是' : '否' },
      ]}
      formItems={
        <>
          <Form.Item name="provider" label="渠道" initialValue="aliyun_sms"><Input /></Form.Item>
          <Form.Item name="sign_name" label="签名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="template_id" label="模板ID" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="access_key_id" label="Access Key ID"><Input /></Form.Item>
          <Form.Item name="access_key_secret" label="Access Key Secret"><Input.Password /></Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </>
      }
    />
  );
}
