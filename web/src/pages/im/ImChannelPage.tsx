import { Form, Input, Select, Tag } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import { imChannelApi } from '../../api/endpoints';

export default function ImChannelPage() {
  return (
    <CrudPage
      title="渠道配置"
      fetchData={imChannelApi.list}
      onCreate={imChannelApi.create}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '名称', dataIndex: 'name' },
        { title: '类型', dataIndex: 'channel_type', render: (t: string) => <Tag color="blue">{t}</Tag> },
        { title: '技能组', dataIndex: 'skill_group_name' },
        { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag> },
      ]}
      formItems={
        <>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="channel_type" label="渠道类型" initialValue="web_widget">
            <Select options={[{ value: 'web_widget', label: '网页Widget' }, { value: 'app_sdk', label: 'APP SDK' }, { value: 'wechat_mini', label: '小程序' }, { value: 'email', label: '邮件' }]} />
          </Form.Item>
          <Form.Item name="skill_group_id" label="分配技能组ID"><Input /></Form.Item>
        </>
      }
    />
  );
}
