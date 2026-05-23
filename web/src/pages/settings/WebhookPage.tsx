import { Form, Input, Select, Switch } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import { webhookConfigApi } from '../../api/endpoints';

export default function WebhookPage() {
  return (
    <CrudPage
      title="事件推送 (Webhook)"
      fetchData={webhookConfigApi.list}
      onCreate={webhookConfigApi.create}
      onUpdate={webhookConfigApi.update}
      onDelete={webhookConfigApi.delete}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'URL', dataIndex: 'url', ellipsis: true },
        { title: '事件类型', dataIndex: 'event_types' },
        { title: '启用', dataIndex: 'enabled', render: (e: boolean) => e ? '是' : '否' },
      ]}
      formItems={
        <>
          <Form.Item name="url" label="Webhook URL" rules={[{ required: true, type: 'url' }]}><Input /></Form.Item>
          <Form.Item name="event_types" label="事件类型">
            <Select mode="multiple" options={[
              { value: 'call.created', label: '通话创建' },
              { value: 'call.answered', label: '通话接听' },
              { value: 'call.ended', label: '通话结束' },
              { value: 'agent.status_changed', label: '坐席状态变更' },
              { value: 'ticket.created', label: '工单创建' },
              { value: 'ticket.updated', label: '工单更新' },
            ]} />
          </Form.Item>
          <Form.Item name="secret" label="签名密钥"><Input.Password /></Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </>
      }
    />
  );
}
