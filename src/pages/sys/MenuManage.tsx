import React from 'react';
import { Space } from 'antd';
import PageContainer from '../../components/PageContainer';

const MenuManage: React.FC = () => {
  const columns = [
    { title: '菜单名称', dataIndex: 'name', key: 'name' },
    { title: '路由路径', dataIndex: 'path', key: 'path' },
    { title: '组件路径', dataIndex: 'component', key: 'component' },
    { title: '权限标识', dataIndex: 'perms', key: 'perms' },
    { title: '排序', dataIndex: 'sort', key: 'sort' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <a>编辑</a>
          <a>新增</a>
          <a style={{ color: 'red' }}>删除</a>
        </Space>
      ),
    },
  ];

  const data = [
    { 
      id: '1', name: '系统管理', path: '/sys', component: 'Layout', sort: 1,
      children: [
        { id: '11', name: '用户管理', path: 'user', component: 'sys/UserManage', sort: 1 },
        { id: '12', name: '角色管理', path: 'role', component: 'sys/RoleManage', sort: 2 },
        { id: '13', name: '菜单管理', path: 'menu', component: 'sys/MenuManage', sort: 3 },
      ]
    },
    { id: '2', name: '数据产品', path: '/products', component: 'Layout', sort: 2 },
  ];

  return <PageContainer columns={columns} dataSource={data} />;
};

export default MenuManage;
