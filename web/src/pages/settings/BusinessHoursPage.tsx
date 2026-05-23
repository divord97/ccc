import { Form, Input, TimePicker, Checkbox } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import api from '../../api/client';

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function BusinessHoursPage() {
  return (
    <CrudPage
      title="营业时间管理"
      fetchData={() => api.get('/business-hours')}
      onCreate={(data) => api.post('/business-hours', data)}
      onUpdate={(id, data) => api.put(`/business-hours/${id}`, data)}
      onDelete={(id) => api.delete(`/business-hours/${id}`)}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '名称', dataIndex: 'name' },
        { title: '时区', dataIndex: 'timezone' },
        { title: '描述', dataIndex: 'description' },
      ]}
      formItems={
        <>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="timezone" label="时区" initialValue="Asia/Shanghai"><Input /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
          {DAYS.map((day, i) => (
            <Form.Item key={i} label={day} style={{ marginBottom: 8 }}>
              <Checkbox.Group options={[{ label: '启用', value: 'enabled' }]} />
              <TimePicker.RangePicker format="HH:mm" style={{ marginLeft: 8 }} />
            </Form.Item>
          ))}
        </>
      }
    />
  );
}
