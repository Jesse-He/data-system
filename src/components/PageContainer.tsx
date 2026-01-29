import React from 'react';
import { Form, Input, Button, Table, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

interface PageContainerProps<T> {
  columns: TableProps<T>['columns'];
  dataSource: T[];
  onSearch?: (values: Record<string, unknown>) => void;
  onReset?: () => void;
  onAdd?: () => void;
  loading?: boolean;
}

const PageContainer = <T extends object>({ 
  columns, 
  dataSource, 
  onSearch, 
  onReset,
  onAdd,
  loading
}: PageContainerProps<T>) => {
  const [form] = Form.useForm();

  const handleSearch = (values: Record<string, unknown>) => {
    onSearch?.(values);
  };

  const handleReset = () => {
    form.resetFields();
    onReset?.();
  };

  return (
    <div className="page-container">
      <div className="search-module" style={{ marginBottom: 16, padding: 24, background: '#fff', borderRadius: 8 }}>
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="请输入搜索关键字" allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      <div className="table-module" style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
        <div style={{ marginBottom: 16 }}>
           <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>新增</Button>
        </div>
        <Table 
          columns={columns} 
          dataSource={dataSource} 
          rowKey="id" 
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </div>
    </div>
  );
};

export default PageContainer;
