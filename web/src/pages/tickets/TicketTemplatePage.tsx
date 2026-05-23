import { Form, Input, Tag, Button, message } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import { ticketTemplateApi } from '../../api/endpoints';

export default function TicketTemplatePage() {
  return (
    <CrudPage
      title="工单模板"
      fetchData={ticketTemplateApi.list}
      onCreate={ticketTemplateApi.create}
      onUpdate={ticketTemplateApi.update}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '名称', dataIndex: 'name' },
        { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'published' ? 'green' : s === 'draft' ? 'default' : 'red'}>{s}</Tag> },
        { title: '分类', dataIndex: 'category_name' },
        {
          title: '操作', key: 'pub', width: 100,
          render: (_, record: { id: number; status: string }) => record.status === 'draft' && (
            <Button size="small" type="link" onClick={async () => { await ticketTemplateApi.publish(record.id); message.success('已发布'); }}>发布</Button>
          ),
        },
      ]}
      formItems={
        <>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="fields" label="字段定义(JSON)"><Input.TextArea rows={4} placeholder='[{"name":"reason","label":"原因","type":"select","options":["退款","投诉"]}]' /></Form.Item>
        </>
      }
    />
  );
}
