import React from 'react';
import { Space } from 'antd';
import PageContainer from '../../components/PageContainer';

const PostManage: React.FC = () => {
  const columns = [
    { title: '岗位名称', dataIndex: 'name', key: 'name' },
    { title: '岗位编码', dataIndex: 'code', key: 'code' },
    { title: '排序', dataIndex: 'sort', key: 'sort' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '操作', key: 'action', render: () => <Space><a>编辑</a><a style={{color:'red'}}>删除</a></Space> },
  ];
  const data = [{ id: '1', name: '董事长', code: 'ceo', sort: 1, status: '正常' }];
  return <PageContainer columns={columns} dataSource={data} />;
};
export default PostManage;
