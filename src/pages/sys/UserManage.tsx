import React, { useState } from 'react';
import { Tag, Space, Modal, message } from 'antd';
import PageContainer from '../../components/PageContainer';

interface User {
  id: string;
  username: string;
  nickname: string;
  dept: string;
  role: string;
  status: string;
  createTime: string;
}

const mockData: User[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `${i + 1}`,
  username: `user${i + 1}`,
  nickname: `User ${i + 1}`,
  dept: '研发部',
  role: i % 2 === 0 ? '管理员' : '普通用户',
  status: i % 3 === 0 ? 'disabled' : 'enabled',
  createTime: '2023-01-01',
}));

const UserManage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data] = useState<User[]>(mockData);

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '部门',
      dataIndex: 'dept',
      key: 'dept',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'enabled' ? 'green' : 'red'}>
          {status === 'enabled' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <a>编辑</a>
          <a style={{ color: 'red' }}>删除</a>
        </Space>
      ),
    },
  ];

  const handleSearch = (values: Record<string, unknown>) => {
    setLoading(true);
    console.log('Search:', values);
    setTimeout(() => {
      setLoading(false);
      message.success('查询成功');
    }, 500);
  };

  const handleAdd = () => {
    Modal.info({ title: '新增用户', content: '这里是新增用户表单...' });
  };

  return (
    <PageContainer
      columns={columns}
      dataSource={data}
      onSearch={handleSearch}
      onAdd={handleAdd}
      loading={loading}
    />
  );
};

export default UserManage;
