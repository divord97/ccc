import { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, message } from 'antd';
import { PlayCircleOutlined, CheckOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../api/client';

interface Voicemail {
  id: number;
  caller: string;
  skill_group_name: string;
  duration_sec: number;
  audio_url: string;
  is_read: boolean;
  created_at: string;
}

export default function VoicemailPage() {
  const [data, setData] = useState<Voicemail[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/voicemails');
      setData(Array.isArray(res.data) ? res.data : []);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await api.put(`/voicemails/${id}/read`);
    message.success('已标记已读');
    load();
  };

  const deleteVm = async (id: number) => {
    await api.delete(`/voicemails/${id}`);
    message.success('已删除');
    load();
  };

  return (
    <Card title="语音信箱" extra={<Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>}>
      <Table<Voicemail>
        dataSource={data} rowKey="id" loading={loading} size="middle"
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '来电号码', dataIndex: 'caller' },
          { title: '技能组', dataIndex: 'skill_group_name' },
          { title: '时长(秒)', dataIndex: 'duration_sec' },
          { title: '状态', dataIndex: 'is_read', render: (r: boolean) => <Tag color={r ? 'default' : 'blue'}>{r ? '已读' : '未读'}</Tag> },
          { title: '时间', dataIndex: 'created_at' },
          {
            title: '操作', key: 'action', render: (_, record) => (
              <Space>
                {record.audio_url && <Button size="small" icon={<PlayCircleOutlined />} onClick={() => { const a = new Audio(record.audio_url); a.play(); }}>播放</Button>}
                {!record.is_read && <Button size="small" icon={<CheckOutlined />} onClick={() => markRead(record.id)}>标记已读</Button>}
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteVm(record.id)}>删除</Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
}
