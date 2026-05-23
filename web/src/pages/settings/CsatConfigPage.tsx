import { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Switch, Button, message, Table, Tag } from 'antd';
import { csatApi } from '../../api/endpoints';

export default function CsatConfigPage() {
  const [form] = Form.useForm();
  const [results, setResults] = useState<{ id: number; call_id: number; score: number; created_at: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cfg, res] = await Promise.all([csatApi.getConfig(), csatApi.listResults()]);
        form.setFieldsValue(cfg.data);
        setResults(Array.isArray(res.data) ? res.data : []);
      } catch { /* */ }
    };
    load();
  }, [form]);

  const handleSave = async () => {
    const values = await form.validateFields();
    await csatApi.updateConfig(values);
    message.success('保存成功');
  };

  return (
    <>
      <Card title="满意度调查配置" extra={<Button type="primary" onClick={handleSave}>保存</Button>}>
        <Form form={form} layout="vertical" style={{ maxWidth: 500 }}>
          <Form.Item name="enabled" label="启用满意度调查" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="ivr_prompt_audio_id" label="IVR提示音频ID"><Input /></Form.Item>
          <Form.Item name="sms_template" label="短信模板"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="max_score" label="最高分" initialValue={5}><InputNumber min={1} max={10} /></Form.Item>
        </Form>
      </Card>
      <Card title="满意度结果" style={{ marginTop: 16 }}>
        <Table dataSource={results} rowKey="id" size="small" columns={[
          { title: '通话ID', dataIndex: 'call_id' },
          { title: '评分', dataIndex: 'score', render: (s: number) => <Tag color={s >= 4 ? 'green' : s >= 3 ? 'orange' : 'red'}>{s}</Tag> },
          { title: '时间', dataIndex: 'created_at' },
        ]} />
      </Card>
    </>
  );
}
