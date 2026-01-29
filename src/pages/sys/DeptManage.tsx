import React from 'react';
import { Space } from 'antd';
import PageContainer from '../../components/PageContainer';

const DeptManage: React.FC = () => {
  const columns = [
    { title: '部门名称', dataIndex: 'name', key: 'name' },
    { title: '负责人', dataIndex: 'leader', key: 'leader' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    {
      title: '操作',
      key: 'action',
      render: () => <Space><a>编辑</a><a style={{color:'red'}}>删除</a></Space>,
    },
  ];
  const data = [{ id: '1', name: '总公司', children: [{ id: '11', name: '研发部门', leader: '张三' }] }];
  return <PageContainer columns={columns} dataSource={data} />;
};
export default DeptManage;
