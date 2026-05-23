import { useEffect } from 'react';
import { Card, Form, Input, InputNumber, Switch, Select, Button, message } from 'antd';
import api from '../../api/client';

export default function TenantSettingsPage() {
  const [form] = Form.useForm();

  useEffect(() => {
    api.get('/tenant-settings').then((res) => form.setFieldsValue(res.data)).catch(() => {});
  }, [form]);

  const handleSave = async () => {
    const values = await form.validateFields();
    await api.put('/tenant-settings', values);
    message.success('保存成功');
  };

  return (
    <Card title="租户设置" extra={<Button type="primary" onClick={handleSave}>保存</Button>}>
      <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item name="recording_retention_days" label="录音保留天数" initialValue={365}><InputNumber min={30} max={3650} /></Form.Item>
        <Form.Item name="recording_storage_type" label="录音存储" initialValue="minio">
          <Select options={[{ value: 'local', label: '本地磁盘' }, { value: 'minio', label: 'MinIO' }]} />
        </Form.Item>
        <Form.Item name="max_ring_timeout_sec" label="振铃超时(秒)" initialValue={30}><InputNumber min={10} max={120} /></Form.Item>
        <Form.Item name="after_call_work_sec" label="话后处理时间(秒)" initialValue={30}><InputNumber min={0} max={600} /></Form.Item>
        <Form.Item name="auto_answer" label="自动接听" valuePropName="checked"><Switch /></Form.Item>
        <Form.Item name="announcement_enabled" label="录音告知提示" valuePropName="checked"><Switch /></Form.Item>
        <Form.Item name="announcement_audio_id" label="录音告知音频ID"><Input /></Form.Item>
      </Form>
    </Card>
  );
}
