import React from 'react';
import { Tag, Space } from 'antd';
import PageContainer from '../../components/PageContainer';

const RoleManage: React.FC = () => {
  const columns = [
    { title: '角色名称', dataIndex: 'name', key: 'name' },
    { title: '角色标识', dataIndex: 'key', key: 'key' },
    { title: '显示顺序', dataIndex: 'sort', key: 'sort' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <a>编辑</a>
          <a>分配权限</a>
          <a style={{ color: 'red' }}>删除</a>
        </Space>
      ),
    },
  ];

  const data = [
    { id: '1', name: '超级管理员', key: 'admin', sort: 1, status: '正常', createTime: '2023-01-01' },
    { id: '2', name: '普通角色', key: 'common', sort: 2, status: '正常', createTime: '2023-01-02' },
  ];

  return <PageContainer columns={columns} dataSource={data} />;
};

export default RoleManage;
