import React from 'react';
import { Space, Tag } from 'antd';
import PageContainer from '../../components/PageContainer';

const NoticeManage: React.FC = () => {
  const columns = [
    { title: '公告标题', dataIndex: 'title', key: 'title' },
    { title: '公告类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color="orange">{t}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '创建者', dataIndex: 'creator', key: 'creator' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    { title: '操作', key: 'action', render: () => <Space><a>编辑</a><a style={{color:'red'}}>删除</a></Space> },
  ];
  const data = [{ id: '1', title: '系统维护通知', type: '通知', status: '正常', creator: 'admin', createTime: '2023-06-01' }];
  return <PageContainer columns={columns} dataSource={data} />;
};
export default NoticeManage;
