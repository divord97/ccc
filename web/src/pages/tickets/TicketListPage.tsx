import { useState } from 'react';
import { Form, Input, Select, Tag, Drawer, Descriptions, List, Button, message } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import CrudPage from '../../components/common/CrudPage';
import { ticketApi } from '../../api/endpoints';

const statusColors: Record<string, string> = { open: 'blue', in_progress: 'orange', pending: 'gold', resolved: 'green', closed: 'default' };
const priorityColors: Record<string, string> = { low: 'default', medium: 'blue', high: 'orange', urgent: 'red' };

interface Ticket {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignee_name: string;
  customer_name: string;
  category: string;
  created_at: string;
  description: string;
  comments: { id: number; author: string; content: string; created_at: string }[];
}

export default function TicketListPage() {
  const [detail, setDetail] = useState<Ticket | null>(null);
  const [commentForm] = Form.useForm();

  const addComment = async () => {
    if (!detail) return;
    const values = await commentForm.validateFields();
    await ticketApi.addComment(detail.id, values);
    message.success('评论成功');
    commentForm.resetFields();
    const res = await ticketApi.get(detail.id);
    setDetail(res.data);
  };

  return (
    <>
      <CrudPage<Ticket>
        title="工单管理"
        searchable
        fetchData={ticketApi.list as () => Promise<{ data: Ticket[] }>}
        onCreate={ticketApi.create}
        onUpdate={ticketApi.update}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '标题', dataIndex: 'title', render: (t: string, r: Ticket) => <a onClick={() => { ticketApi.get(r.id).then((res) => setDetail(res.data)); }}>{t}</a> },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
          { title: '优先级', dataIndex: 'priority', render: (p: string) => <Tag color={priorityColors[p]}>{p}</Tag> },
          { title: '处理人', dataIndex: 'assignee_name' },
          { title: '客户', dataIndex: 'customer_name' },
          { title: '分类', dataIndex: 'category' },
          { title: '创建时间', dataIndex: 'created_at' },
        ]}
        formItems={
          <>
            <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="描述"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="priority" label="优先级" initialValue="medium">
              <Select options={Object.entries(priorityColors).map(([k]) => ({ value: k, label: k }))} />
            </Form.Item>
            <Form.Item name="status" label="状态" initialValue="open">
              <Select options={Object.keys(statusColors).map((k) => ({ value: k, label: k }))} />
            </Form.Item>
            <Form.Item name="customer_id" label="客户ID"><Input /></Form.Item>
          </>
        }
      />
      <Drawer title="工单详情" open={!!detail} onClose={() => setDetail(null)} width={600}>
        {detail && (
          <>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="标题" span={2}>{detail.title}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={statusColors[detail.status]}>{detail.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="优先级"><Tag color={priorityColors[detail.priority]}>{detail.priority}</Tag></Descriptions.Item>
              <Descriptions.Item label="处理人">{detail.assignee_name}</Descriptions.Item>
              <Descriptions.Item label="客户">{detail.customer_name}</Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>{detail.description}</Descriptions.Item>
            </Descriptions>
            <h4 style={{ marginTop: 16 }}>评论</h4>
            <List dataSource={detail.comments || []} renderItem={(c) => (
              <List.Item><List.Item.Meta title={c.author} description={c.content} /><span>{c.created_at}</span></List.Item>
            )} />
            <Form form={commentForm} layout="inline" style={{ marginTop: 8 }}>
              <Form.Item name="content" rules={[{ required: true }]} style={{ flex: 1 }}><Input placeholder="添加评论" /></Form.Item>
              <Button icon={<CommentOutlined />} onClick={addComment}>提交</Button>
            </Form>
          </>
        )}
      </Drawer>
    </>
  );
}
