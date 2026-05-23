import { useState, useEffect } from 'react';
import { Card, Table, Button, Upload, Tag, Space, message } from 'antd';
import { UploadOutlined, PlayCircleOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../api/client';

interface AudioFile {
  id: number;
  name: string;
  category: string;
  duration_sec: number;
  format: string;
  url: string;
  created_at: string;
}

export default function AudioFilesPage() {
  const [data, setData] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/audio-files'); setData(Array.isArray(res.data) ? res.data : []); } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <Card title="音频管理" extra={
      <Space>
        <Upload accept=".wav,.mp3" showUploadList={false} customRequest={async ({ file }) => {
          const formData = new FormData();
          formData.append('file', file as File);
          await api.post('/audio-files', formData);
          message.success('上传成功');
          load();
        }}>
          <Button icon={<UploadOutlined />}>上传音频</Button>
        </Upload>
        <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
      </Space>
    }>
      <Table<AudioFile> dataSource={data} rowKey="id" loading={loading} size="middle" columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '名称', dataIndex: 'name' },
        { title: '分类', dataIndex: 'category', render: (c: string) => <Tag>{c || '默认'}</Tag> },
        { title: '时长(秒)', dataIndex: 'duration_sec' },
        { title: '格式', dataIndex: 'format' },
        { title: '上传时间', dataIndex: 'created_at' },
        {
          title: '操作', key: 'action', render: (_, record) => (
            <Space>
              {record.url && <Button size="small" icon={<PlayCircleOutlined />} onClick={() => { new Audio(record.url).play(); }}>播放</Button>}
              <Button size="small" danger icon={<DeleteOutlined />} onClick={async () => { await api.delete(`/audio-files/${record.id}`); message.success('已删除'); load(); }}>删除</Button>
            </Space>
          ),
        },
      ]} />
    </Card>
  );
}
