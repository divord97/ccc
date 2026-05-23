import { Form, Input, InputNumber, Tag } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import { tenantApi } from '../../api/endpoints';

export default function TenantListPage() {
  return (
    <CrudPage
      title="实例管理"
      searchable
      fetchData={tenantApi.list}
      onCreate={tenantApi.create}
      onUpdate={tenantApi.update}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '名称', dataIndex: 'name' },
        { title: '域名', dataIndex: 'domain' },
        { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag> },
        { title: '最大坐席数', dataIndex: 'max_agents' },
        { title: '最大并发通话', dataIndex: 'max_concurrent_calls' },
        { title: '创建时间', dataIndex: 'created_at' },
      ]}
      formItems={
        <>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="domain" label="域名"><Input /></Form.Item>
          <Form.Item name="max_agents" label="最大坐席数" initialValue={50}><InputNumber min={1} max={10000} /></Form.Item>
          <Form.Item name="max_concurrent_calls" label="最大并发通话" initialValue={100}><InputNumber min={1} max={10000} /></Form.Item>
        </>
      }
    />
  );
}
