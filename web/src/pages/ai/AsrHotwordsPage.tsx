import { Form, Input, InputNumber } from 'antd';
import CrudPage from '../../components/common/CrudPage';
import { asrHotwordsApi } from '../../api/endpoints';

export default function AsrHotwordsPage() {
  return (
    <CrudPage
      title="ASR 热词库管理"
      searchable
      fetchData={asrHotwordsApi.list}
      onCreate={asrHotwordsApi.create}
      onUpdate={asrHotwordsApi.update}
      onDelete={asrHotwordsApi.delete}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '热词', dataIndex: 'word' },
        { title: '权重', dataIndex: 'weight' },
        { title: '分类', dataIndex: 'category' },
      ]}
      formItems={
        <>
          <Form.Item name="word" label="热词" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="weight" label="权重" initialValue={1}><InputNumber min={1} max={100} /></Form.Item>
          <Form.Item name="category" label="分类"><Input /></Form.Item>
        </>
      }
    />
  );
}
