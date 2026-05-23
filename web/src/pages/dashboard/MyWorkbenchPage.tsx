import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Form, Input, message, Avatar } from 'antd';
import { UserOutlined, PhoneOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../../api/client';

export default function MyWorkbenchPage() {
  const [overview, setOverview] = useState<Record<string, number>>({});
  const [form] = Form.useForm();

  useEffect(() => {
    api.get('/me/overview').then((res) => setOverview(res.data)).catch(() => {});
    api.get('/me/profile').then((res) => form.setFieldsValue(res.data)).catch(() => {});
  }, [form]);

  const handleSave = async () => {
    const values = await form.validateFields();
    await api.put('/me/profile', values);
    message.success('保存成功');
  };

  const handleResetState = async () => {
    await api.post('/me/reset-state');
    message.success('状态已重置');
  };

  return (
    <>
      <h2>我的工作台</h2>
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="今日接听" value={overview.calls_handled || 0} prefix={<PhoneOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="今日外呼" value={overview.calls_dialed || 0} prefix={<PhoneOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="平均通话(秒)" value={overview.avg_duration || 0} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="满意度" value={overview.satisfaction || 0} suffix="/5" prefix={<CheckCircleOutlined />} /></Card></Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="个人设置" extra={<Button type="primary" onClick={handleSave}>保存</Button>}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}><Avatar size={64} icon={<UserOutlined />} /></div>
            <Form form={form} layout="vertical">
              <Form.Item name="display_name" label="昵称"><Input /></Form.Item>
              <Form.Item name="email" label="邮箱"><Input /></Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="密码修改">
            <Form layout="vertical" onFinish={async (values) => { await api.put('/me/password', values); message.success('密码已修改'); }}>
              <Form.Item name="old_password" label="当前密码" rules={[{ required: true }]}><Input.Password /></Form.Item>
              <Form.Item name="new_password" label="新密码" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item>
              <Button type="primary" htmlType="submit">修改密码</Button>
            </Form>
            <Button style={{ marginTop: 16 }} onClick={handleResetState} danger>重置坐席状态</Button>
          </Card>
        </Col>
      </Row>
    </>
  );
}
