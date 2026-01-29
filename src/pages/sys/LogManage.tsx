import React from 'react';
import { Tag } from 'antd';
import PageContainer from '../../components/PageContainer';

const LogManage: React.FC = () => {
  const columns = [
    { title: '日志编号', dataIndex: 'id', key: 'id' },
    { title: '系统模块', dataIndex: 'module', key: 'module' },
    { title: '操作类型', dataIndex: 'type', key: 'type' },
    { title: '操作人员', dataIndex: 'user', key: 'user' },
    { title: '主机', dataIndex: 'ip', key: 'ip' },
    { title: '操作状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s==='成功'?'green':'red'}>{s}</Tag> },
    { title: '操作时间', dataIndex: 'time', key: 'time' },
  ];
  const data = [{ id: '1001', module: '用户管理', type: '新增', user: 'admin', ip: '127.0.0.1', status: '成功', time: '2023-06-01 12:00:00' }];
  return <PageContainer columns={columns} dataSource={data} />;
};
export default LogManage;
