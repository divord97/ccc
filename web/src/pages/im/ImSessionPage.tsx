import { useState, useEffect } from 'react';
import { Card, Table, Tag, Drawer, List, Input, Button, Space, Avatar, message } from 'antd';
import { SendOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';
import { imSessionApi } from '../../api/endpoints';

interface Session {
  id: number;
  channel_type: string;
  customer_name: string;
  agent_name: string;
  status: string;
  created_at: string;
}

interface Message {
  id: number;
  sender_type: string;
  content: string;
  created_at: string;
}

export default function ImSessionPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const load = async () => {
    setLoading(true);
    try { const res = await imSessionApi.list(); setSessions(Array.isArray(res.data) ? res.data : []); } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openSession = async (session: Session) => {
    setActiveSession(session);
    try { const res = await imSessionApi.messages(session.id); setMessages(Array.isArray(res.data) ? res.data : []); } catch { /* */ }
  };

  const sendMessage = async () => {
    if (!activeSession || !inputText.trim()) return;
    await imSessionApi.send(activeSession.id, { content: inputText, sender_type: 'agent' });
    setInputText('');
    const res = await imSessionApi.messages(activeSession.id);
    setMessages(Array.isArray(res.data) ? res.data : []);
  };

  const closeSession = async (id: number) => {
    await imSessionApi.close(id);
    message.success('会话已关闭');
    load();
  };

  return (
    <>
      <Card title="在线会话" extra={<Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>}>
        <Table<Session> dataSource={sessions} rowKey="id" loading={loading} size="middle" onRow={(r) => ({ onClick: () => openSession(r), style: { cursor: 'pointer' } })} columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '渠道', dataIndex: 'channel_type', render: (t: string) => <Tag>{t}</Tag> },
          { title: '客户', dataIndex: 'customer_name' },
          { title: '坐席', dataIndex: 'agent_name' },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s}</Tag> },
          { title: '创建时间', dataIndex: 'created_at' },
          { title: '操作', key: 'action', render: (_, r) => r.status === 'active' && <Button size="small" danger onClick={(e) => { e.stopPropagation(); closeSession(r.id); }}>关闭</Button> },
        ]} />
      </Card>
      <Drawer title={`会话 #${activeSession?.id} — ${activeSession?.customer_name}`} open={!!activeSession} onClose={() => setActiveSession(null)} width={500}>
        <div style={{ height: 400, overflow: 'auto', marginBottom: 16 }}>
          <List dataSource={messages} renderItem={(m) => (
            <List.Item style={{ justifyContent: m.sender_type === 'agent' ? 'flex-end' : 'flex-start' }}>
              <Space>
                {m.sender_type !== 'agent' && <Avatar icon={<UserOutlined />} />}
                <div style={{ background: m.sender_type === 'agent' ? '#1677ff' : '#f0f0f0', color: m.sender_type === 'agent' ? '#fff' : '#000', padding: '8px 12px', borderRadius: 8, maxWidth: 300 }}>
                  {m.content}
                </div>
              </Space>
            </List.Item>
          )} />
        </div>
        <Space.Compact style={{ width: '100%' }}>
          <Input value={inputText} onChange={(e) => setInputText(e.target.value)} onPressEnter={sendMessage} placeholder="输入消息..." />
          <Button type="primary" icon={<SendOutlined />} onClick={sendMessage}>发送</Button>
        </Space.Compact>
      </Drawer>
    </>
  );
}
