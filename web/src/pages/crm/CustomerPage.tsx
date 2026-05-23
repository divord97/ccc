import { Form, Input, Button, Upload, message, Tag } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import CrudPage from '../../components/common/CrudPage';
import { customerApi } from '../../api/endpoints';

export default function CustomerPage() {
  return (
    <CrudPage
      title="客户管理"
      searchable
      fetchData={customerApi.list}
      onCreate={customerApi.create}
      onUpdate={customerApi.update}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '姓名', dataIndex: 'name' },
        { title: '公司', dataIndex: 'company' },
        { title: '邮箱', dataIndex: 'email' },
        { title: '手机', dataIndex: 'phone' },
        { title: '等级', dataIndex: 'level', render: (l: string) => <Tag color={l === 'vip' ? 'gold' : 'default'}>{l || '普通'}</Tag> },
        { title: '创建时间', dataIndex: 'created_at' },
      ]}
      extra={
        <Upload accept=".csv,.xlsx" showUploadList={false} customRequest={async ({ file }) => {
          const formData = new FormData();
          formData.append('file', file as File);
          await customerApi.batchImport(formData);
          message.success('批量导入成功');
        }}>
          <Button icon={<UploadOutlined />}>批量导入</Button>
        </Upload>
      }
      formItems={
        <>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="company" label="公司"><Input /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
          <Form.Item name="phone" label="手机"><Input /></Form.Item>
          <Form.Item name="level" label="等级"><Input placeholder="vip / normal" /></Form.Item>
        </>
      }
    />
  );
}
