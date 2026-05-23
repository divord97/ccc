import { useState } from 'react';
import { Form, Input, InputNumber, Select, Tag, Button, Modal, Table, message, Space } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import { annotationApi } from '../../api/endpoints';

const statusColors: Record<string, string> = { pending: 'default', in_progress: 'blue', completed: 'green', cancelled: 'red' };

export default function AnnotationPage() {
  const [annotateModal, setAnnotateModal] = useState<{ taskId: number; name: string } | null>(null);
  const [annotations, setAnnotations] = useState<{ id: number; label: string; annotator: string; created_at: string }[]>([]);
  const [annotateForm] = Form.useForm();

  const loadAnnotations = async (taskId: number) => {
    try { const res = await annotationApi.listResults(taskId); setAnnotations(Array.isArray(res.data) ? res.data : []); } catch { /* */ }
  };

  return (
    <>
      <CrudPage
        title="标注管理"
        fetchData={annotationApi.listTasks}
        onCreate={annotationApi.createTask}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '任务名', dataIndex: 'name' },
          { title: '类型', dataIndex: 'task_type', render: (t: string) => <Tag>{t}</Tag> },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
          { title: '总量', dataIndex: 'total_count' },
          { title: '已完成', dataIndex: 'completed_count' },
          {
            title: '操作', key: 'actions', width: 280,
            render: (_, r: { id: number; name: string; status: string }) => (
              <Space size="small">
                {r.status === 'pending' && <Button size="small" onClick={async () => { await annotationApi.startTask(r.id); message.success('已开始'); }}>开始</Button>}
                {r.status === 'in_progress' && <Button size="small" type="primary" onClick={async () => { await annotationApi.completeTask(r.id); message.success('已完成'); }}>完成</Button>}
                {['pending', 'in_progress'].includes(r.status) && <Button size="small" danger onClick={async () => { await annotationApi.cancelTask(r.id); message.success('已取消'); }}>取消</Button>}
                <Button size="small" onClick={() => { setAnnotateModal({ taskId: r.id, name: r.name }); loadAnnotations(r.id); }}>标注</Button>
              </Space>
            ),
          },
        ]}
        formItems={
          <>
            <Form.Item name="name" label="任务名" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="task_type" label="类型" initialValue="intent">
              <Select options={[{ value: 'intent', label: '意图标注' }, { value: 'sentiment', label: '情绪标注' }, { value: 'entity', label: '实体标注' }]} />
            </Form.Item>
            <Form.Item name="total_count" label="数据总量"><InputNumber min={1} /></Form.Item>
          </>
        }
      />
      <Modal title={`标注工作台 — ${annotateModal?.name}`} open={!!annotateModal} onCancel={() => setAnnotateModal(null)} footer={null} width={600}>
        <Form form={annotateForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="label" rules={[{ required: true }]}><Input placeholder="标注标签" /></Form.Item>
          <Form.Item name="data_reference" rules={[{ required: true }]}><Input placeholder="数据引用ID" /></Form.Item>
          <Button type="primary" onClick={async () => {
            const v = await annotateForm.validateFields();
            await annotationApi.submitAnnotation(annotateModal!.taskId, v);
            message.success('标注提交成功');
            annotateForm.resetFields();
            loadAnnotations(annotateModal!.taskId);
          }}>提交标注</Button>
        </Form>
        <Table dataSource={annotations} rowKey="id" size="small" pagination={false} columns={[
          { title: '标签', dataIndex: 'label' },
          { title: '标注人', dataIndex: 'annotator' },
          { title: '时间', dataIndex: 'created_at' },
        ]} />
      </Modal>
    </>
  );
}
