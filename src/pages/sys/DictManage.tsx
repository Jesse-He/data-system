import React from 'react';
import { Space, Tag } from 'antd';
import PageContainer from '../../components/PageContainer';

const DictManage: React.FC = () => {
  const columns = [
    { title: '字典名称', dataIndex: 'name', key: 'name' },
    { title: '字典类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag>{t}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    { title: '操作', key: 'action', render: () => <Space><a>编辑</a><a>列表</a><a style={{color:'red'}}>删除</a></Space> },
  ];
  const data = [{ id: '1', name: '用户性别', type: 'sys_user_sex', status: '正常' }];
  return <PageContainer columns={columns} dataSource={data} />;
};
export default DictManage;
