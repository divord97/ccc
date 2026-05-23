import { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Input, Select, Tag, Modal, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { knowledgeApi } from '../../api/endpoints';

export default function KnowledgePage() {
  const [categories, setCategories] = useState<{ id: number; name: string; parent_id: number }[]>([]);
  const [articles, setArticles] = useState<{ id: number; title: string; category_name: string; status: string; created_at: string }[]>([]);
  const [catModal, setCatModal] = useState(false);
  const [artModal, setArtModal] = useState(false);
  const [search, setSearch] = useState('');
  const [catForm] = Form.useForm();
  const [artForm] = Form.useForm();

  const loadAll = async () => {
    try {
      const [c, a] = await Promise.all([knowledgeApi.listCategories(), knowledgeApi.listArticles({ q: search })]);
      setCategories(Array.isArray(c.data) ? c.data : []);
      setArticles(Array.isArray(a.data) ? a.data : []);
    } catch { /* */ }
  };

  useEffect(() => { loadAll(); }, [search]);

  return (
    <>
      <Card title="知识库" extra={<>
        <Input prefix={<SearchOutlined />} placeholder="搜索文章" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 200, marginRight: 8 }} allowClear />
        <Button onClick={() => setCatModal(true)} style={{ marginRight: 8 }}>新建分类</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setArtModal(true)}>新建文章</Button>
      </>}>
        <Table dataSource={articles} rowKey="id" size="small" columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '标题', dataIndex: 'title' },
          { title: '分类', dataIndex: 'category_name', render: (n: string) => <Tag>{n}</Tag> },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'published' ? 'green' : 'default'}>{s}</Tag> },
          { title: '创建时间', dataIndex: 'created_at' },
        ]} />
      </Card>
      <Modal title="新建分类" open={catModal} onCancel={() => setCatModal(false)} onOk={async () => {
        const v = await catForm.validateFields(); await knowledgeApi.createCategory(v); message.success('创建成功'); setCatModal(false); catForm.resetFields(); loadAll();
      }}>
        <Form form={catForm} layout="vertical">
          <Form.Item name="name" label="分类名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="parent_id" label="父分类"><Select allowClear options={categories.map((c) => ({ value: c.id, label: c.name }))} /></Form.Item>
        </Form>
      </Modal>
      <Modal title="新建文章" open={artModal} onCancel={() => setArtModal(false)} onOk={async () => {
        const v = await artForm.validateFields(); await knowledgeApi.createArticle(v); message.success('创建成功'); setArtModal(false); artForm.resetFields(); loadAll();
      }} width={600}>
        <Form form={artForm} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category_id" label="分类"><Select options={categories.map((c) => ({ value: c.id, label: c.name }))} /></Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}><Input.TextArea rows={8} /></Form.Item>
          <Form.Item name="tags" label="标签(逗号分隔)"><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
