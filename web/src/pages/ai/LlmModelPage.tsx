import { Form, Input, Select, Switch, Tag } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import { llmModelApi } from '../../api/endpoints';

export default function LlmModelPage() {
  return (
    <CrudPage
      title="LLM 网关 — 模型管理"
      fetchData={llmModelApi.list}
      onCreate={llmModelApi.create}
      onUpdate={llmModelApi.update}
      onDelete={llmModelApi.delete}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '名称', dataIndex: 'name' },
        { title: '提供商', dataIndex: 'provider', render: (p: string) => <Tag color="purple">{p}</Tag> },
        { title: '模型', dataIndex: 'model_name' },
        { title: '默认', dataIndex: 'is_default', render: (d: boolean) => d ? <Tag color="green">默认</Tag> : '-' },
        { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag> },
      ]}
      formItems={
        <>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="provider" label="提供商" initialValue="tongyi">
            <Select options={[{ value: 'tongyi', label: '阿里通义' }, { value: 'openai', label: 'OpenAI' }, { value: 'bailian', label: '百炼' }, { value: 'self_hosted', label: '自部署' }]} />
          </Form.Item>
          <Form.Item name="model_name" label="模型名称"><Input placeholder="qwen-max / gpt-4" /></Form.Item>
          <Form.Item name="api_key" label="API Key"><Input.Password /></Form.Item>
          <Form.Item name="endpoint" label="Endpoint URL"><Input /></Form.Item>
          <Form.Item name="is_default" label="设为默认" valuePropName="checked"><Switch /></Form.Item>
        </>
      }
    />
  );
}
