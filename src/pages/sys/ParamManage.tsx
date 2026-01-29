import React from 'react';
import { Space } from 'antd';
import PageContainer from '../../components/PageContainer';

const ParamManage: React.FC = () => {
  const columns = [
    { title: '参数名称', dataIndex: 'name', key: 'name' },
    { title: '参数键名', dataIndex: 'key', key: 'key' },
    { title: '参数键值', dataIndex: 'value', key: 'value' },
    { title: '系统内置', dataIndex: 'isSystem', key: 'isSystem' },
    { title: '操作', key: 'action', render: () => <Space><a>编辑</a><a style={{color:'red'}}>删除</a></Space> },
  ];
  const data = [{ id: '1', name: '系统主题', key: 'sys.theme', value: 'light', isSystem: '是' }];
  return <PageContainer columns={columns} dataSource={data} />;
};
export default ParamManage;
