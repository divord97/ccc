import { Form, Input, Select, Tag } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import { phoneNumberApi } from '../../api/endpoints';

export default function PhoneNumberPage() {
  return (
    <CrudPage
      title="号码管理"
      searchable
      fetchData={phoneNumberApi.list}
      onCreate={phoneNumberApi.create}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '号码', dataIndex: 'number' },
        { title: '用途', dataIndex: 'usage', render: (u: string) => <Tag color={u === 'inbound' ? 'green' : u === 'outbound' ? 'blue' : 'purple'}>{u}</Tag> },
        { title: '绑定IVR', dataIndex: 'inbound_ivr_id' },
        { title: '运营商', dataIndex: 'carrier_name' },
        { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag> },
      ]}
      formItems={
        <>
          <Form.Item name="number" label="号码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="usage" label="用途" initialValue="bidirectional">
            <Select options={[{ value: 'inbound', label: '呼入' }, { value: 'outbound', label: '呼出' }, { value: 'bidirectional', label: '双向' }]} />
          </Form.Item>
          <Form.Item name="inbound_ivr_id" label="绑定IVR流程ID"><Input /></Form.Item>
        </>
      }
    />
  );
}
