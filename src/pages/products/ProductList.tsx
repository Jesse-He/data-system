import React from 'react';
import PageContainer from '../../components/PageContainer';

const ProductList: React.FC = () => {
  const columns = [
    { title: '产品名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'desc', key: 'desc' },
  ];
  const data = [{ id: '1', name: '数据分析平台', desc: '用于数据分析' }];
  return <PageContainer columns={columns} dataSource={data} />;
};
export default ProductList;
