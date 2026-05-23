import { Form, Input, Select, Tag } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import api from '../../api/client';

export default function CustomFieldsPage() {
  return (
    <CrudPage
      title="自定义字段管理"
      searchable
      fetchData={() => api.get('/custom-fields')}
      onCreate={(data) => api.post('/custom-fields', data)}
      onUpdate={(id, data) => api.put(`/custom-fields/${id}`, data)}
      onDelete={(id) => api.delete(`/custom-fields/${id}`)}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '字段名', dataIndex: 'field_name' },
        { title: '标签', dataIndex: 'label' },
        { title: '类型', dataIndex: 'field_type', render: (t: string) => <Tag>{t}</Tag> },
        { title: '适用范围', dataIndex: 'scope', render: (s: string) => <Tag color="blue">{s}</Tag> },
        { title: '必填', dataIndex: 'required', render: (r: boolean) => r ? <Tag color="red">必填</Tag> : '-' },
      ]}
      formItems={
        <>
          <Form.Item name="field_name" label="字段名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="label" label="显示标签" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="field_type" label="字段类型" initialValue="string">
            <Select options={[
              { value: 'string', label: '文本' }, { value: 'number', label: '数字' },
              { value: 'boolean', label: '布尔' }, { value: 'date', label: '日期' },
              { value: 'select', label: '下拉选择' }, { value: 'multiselect', label: '多选' },
            ]} />
          </Form.Item>
          <Form.Item name="scope" label="适用范围" initialValue="customer">
            <Select options={[{ value: 'customer', label: '客户' }, { value: 'session_info', label: '会话信息' }, { value: 'ticket', label: '工单' }]} />
          </Form.Item>
          <Form.Item name="options" label="选项(逗号分隔)"><Input placeholder="选项1,选项2,选项3" /></Form.Item>
        </>
      }
    />
  );
}
