import { useState, useEffect, useCallback } from 'react';
import { Card, Select, Form, Input, InputNumber, Button, Space, Row, Col, message, Tag, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { ivrFlowApi } from '../../api/endpoints';

const NODE_TYPES = [
  { value: 'start', label: '开始', color: 'green' },
  { value: 'play', label: '播放语音', color: 'blue' },
  { value: 'collect_dtmf', label: '按键收集', color: 'blue' },
  { value: 'condition', label: '条件分支', color: 'orange' },
  { value: 'time_condition', label: '时间条件', color: 'orange' },
  { value: 'variable_assign', label: '变量赋值', color: 'purple' },
  { value: 'transfer_to_skill_group', label: '转技能组', color: 'cyan' },
  { value: 'transfer_to_agent', label: '转坐席', color: 'cyan' },
  { value: 'transfer_to_external', label: '转外线', color: 'cyan' },
  { value: 'blind_transfer', label: '直接转接', color: 'cyan' },
  { value: 'voicemail', label: '语音信箱', color: 'gold' },
  { value: 'callback', label: '排队回呼', color: 'gold' },
  { value: 'hangup', label: '挂机', color: 'red' },
  { value: 'http_request', label: 'HTTP请求', color: 'geekblue' },
  { value: 'json_parser', label: 'JSON解析', color: 'geekblue' },
  { value: 'sms', label: '发短信', color: 'lime' },
  { value: 'satisfaction_rating', label: '满意度', color: 'magenta' },
  { value: 'asr', label: '语音识别', color: 'volcano' },
  { value: 'tts', label: '语音合成', color: 'volcano' },
  { value: 'end', label: '结束', color: 'red' },
];

interface IvrNode {
  id: string;
  type: string;
  label: string;
  config: Record<string, unknown>;
  next: string[];
}

export default function IvrFlowEditor({ flowId }: { flowId: number }) {
  const [nodes, setNodes] = useState<IvrNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [form] = Form.useForm();

  const loadFlow = useCallback(async () => {
    try {
      const res = await ivrFlowApi.get(flowId);
      const graph = res.data.graph || res.data.flow_graph;
      if (graph?.nodes) {
        setNodes(graph.nodes);
      }
    } catch { /* */ }
  }, [flowId]);

  useEffect(() => { loadFlow(); }, [loadFlow]);

  const addNode = (type: string) => {
    const id = `node_${Date.now()}`;
    const typeDef = NODE_TYPES.find((t) => t.value === type);
    setNodes([...nodes, { id, type, label: typeDef?.label || type, config: {}, next: [] }]);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id).map((n) => ({ ...n, next: n.next.filter((nid) => nid !== id) })));
    if (selectedNode === id) setSelectedNode(null);
  };

  const updateNodeConfig = (id: string, config: Record<string, unknown>) => {
    setNodes(nodes.map((n) => n.id === id ? { ...n, config } : n));
  };

  const handleSave = async () => {
    try {
      await ivrFlowApi.update(flowId, { graph: { nodes } });
      message.success('保存成功');
    } catch {
      message.error('保存失败');
    }
  };

  const selected = nodes.find((n) => n.id === selectedNode);

  return (
    <Row gutter={16} style={{ minHeight: 500 }}>
      <Col span={6}>
        <Card title="节点面板" size="small">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {NODE_TYPES.map((t) => (
              <Tag key={t.value} color={t.color} style={{ cursor: 'pointer', marginBottom: 4 }} onClick={() => addNode(t.value)}>
                <PlusOutlined /> {t.label}
              </Tag>
            ))}
          </div>
        </Card>
      </Col>
      <Col span={10}>
        <Card title="流程图" size="small" extra={<Button icon={<SaveOutlined />} type="primary" onClick={handleSave}>保存</Button>}>
          {nodes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>点击左侧节点添加到流程</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {nodes.map((node) => {
                const typeDef = NODE_TYPES.find((t) => t.value === node.type);
                return (
                  <Card
                    key={node.id}
                    size="small"
                    style={{ cursor: 'pointer', border: selectedNode === node.id ? '2px solid #1677ff' : undefined }}
                    onClick={() => { setSelectedNode(node.id); form.setFieldsValue(node.config); }}
                  >
                    <Space>
                      <Tag color={typeDef?.color}>{typeDef?.label || node.type}</Tag>
                      <span>{node.label}</span>
                      {node.next.length > 0 && <Tag>→ {node.next.join(', ')}</Tag>}
                      <Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); removeNode(node.id); }} />
                    </Space>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </Col>
      <Col span={8}>
        <Card title={selected ? `配置: ${selected.label}` : '选择节点'} size="small">
          {selected ? (
            <Form form={form} layout="vertical" onValuesChange={(_, all) => updateNodeConfig(selected.id, all)}>
              <Form.Item name="label" label="标签"><Input placeholder="节点标签" /></Form.Item>
              {(selected.type === 'play' || selected.type === 'tts') && (
                <Form.Item name="audio_file_id" label="音频/文本"><Input placeholder="音频文件ID或TTS文本" /></Form.Item>
              )}
              {selected.type === 'collect_dtmf' && (
                <>
                  <Form.Item name="max_digits" label="最大位数"><InputNumber min={1} max={20} /></Form.Item>
                  <Form.Item name="timeout_sec" label="超时(秒)"><InputNumber min={1} max={30} /></Form.Item>
                </>
              )}
              {selected.type === 'transfer_to_skill_group' && (
                <Form.Item name="skill_group_id" label="技能组ID"><InputNumber /></Form.Item>
              )}
              {selected.type === 'http_request' && (
                <>
                  <Form.Item name="url" label="URL"><Input /></Form.Item>
                  <Form.Item name="method" label="方法"><Select options={[{ value: 'GET' }, { value: 'POST' }]} /></Form.Item>
                </>
              )}
              {selected.type === 'condition' && (
                <Form.Item name="expression" label="条件表达式"><Input placeholder="e.g. ${dtmf} == 1" /></Form.Item>
              )}
              {selected.type === 'sms' && (
                <Form.Item name="template_id" label="短信模板ID"><Input /></Form.Item>
              )}
              <Divider>连线</Divider>
              <Form.Item label="连接到">
                <Select
                  mode="multiple"
                  value={selected.next}
                  onChange={(vals: string[]) => setNodes(nodes.map((n) => n.id === selected.id ? { ...n, next: vals } : n))}
                  options={nodes.filter((n) => n.id !== selected.id).map((n) => ({ value: n.id, label: `${n.label} (${n.type})` }))}
                />
              </Form.Item>
            </Form>
          ) : (
            <div style={{ color: '#999', textAlign: 'center', padding: 40 }}>点击流程图中的节点进行配置</div>
          )}
        </Card>
      </Col>
    </Row>
  );
}
