import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Space, message, Popconfirm, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface CrudPageProps<T extends { id: number }> {
  title: string;
  columns: ColumnsType<T>;
  fetchData: () => Promise<{ data: T[] }>;
  onCreate?: (values: Record<string, unknown>) => Promise<unknown>;
  onUpdate?: (id: number, values: Record<string, unknown>) => Promise<unknown>;
  onDelete?: (id: number) => Promise<unknown>;
  formItems?: React.ReactNode;
  searchable?: boolean;
  extra?: React.ReactNode;
}

export default function CrudPage<T extends { id: number }>({
  title, columns, fetchData, onCreate, onUpdate, onDelete, formItems, searchable, extra,
}: CrudPageProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchData();
      setData(Array.isArray(res.data) ? res.data : (res.data as Record<string, unknown>)?.items as T[] || []);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => { load(); }, [load]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing && onUpdate) {
        await onUpdate(editing.id, values);
        message.success('更新成功');
      } else if (onCreate) {
        await onCreate(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      load();
    } catch {
      // validation failed
    }
  };

  const handleDelete = async (id: number) => {
    if (!onDelete) return;
    try {
      await onDelete(id);
      message.success('删除成功');
      load();
    } catch {
      message.error('删除失败');
    }
  };

  const actionColumn: ColumnsType<T> = (onUpdate || onDelete) ? [{
    title: '操作',
    key: 'action',
    width: 160,
    render: (_, record) => (
      <Space>
        {onUpdate && <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); }}>编辑</Button>}
        {onDelete && (
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        )}
      </Space>
    ),
  }] : [];

  const filtered = searchable && search
    ? data.filter((item) => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()))
    : data;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <Space>
          {searchable && (
            <Input prefix={<SearchOutlined />} placeholder="搜索" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 200 }} allowClear />
          )}
          {extra}
          <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
          {onCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新建</Button>}
        </Space>
      </div>
      <Table<T> columns={[...columns, ...actionColumn]} dataSource={filtered} rowKey="id" loading={loading} size="middle" pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }} />
      {formItems && (
        <Modal title={editing ? '编辑' : '新建'} open={modalOpen} onOk={handleOk} onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }} destroyOnClose>
          <Form form={form} layout="vertical" preserve={false}>
            {formItems}
          </Form>
        </Modal>
      )}
    </>
  );
}
