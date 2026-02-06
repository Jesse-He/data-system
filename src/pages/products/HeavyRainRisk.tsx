import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Card, Statistic, Tag, Progress, Space, message } from 'antd';
import PageContainer from '../../components/PageContainer';

type City = {
  id: string;
  name: string;
  rainfall: number; // mm/h
  level: '正常' | '注意' | '预警' | '警报';
};

const initialCities: City[] = [
  { id: 'gz', name: '广州', rainfall: 8, level: '正常' },
  { id: 'sz', name: '深圳', rainfall: 12, level: '注意' },
  { id: 'fs', name: '佛山', rainfall: 5, level: '正常' },
  { id: 'dg', name: '东莞', rainfall: 10, level: '注意' },
  { id: 'hz', name: '惠州', rainfall: 6, level: '正常' },
  { id: 'zs', name: '中山', rainfall: 9, level: '正常' },
  { id: 'zh', name: '珠海', rainfall: 7, level: '正常' },
  { id: 'jm', name: '江门', rainfall: 11, level: '注意' },
  { id: 'zq', name: '肇庆', rainfall: 4, level: '正常' },
  { id: 'hk', name: '香港', rainfall: 15, level: '预警' },
  { id: 'mo', name: '澳门', rainfall: 13, level: '注意' },
];

function calcLevel(mmPerHour: number): City['level'] {
  if (mmPerHour >= 30) return '警报';
  if (mmPerHour >= 20) return '预警';
  if (mmPerHour >= 10) return '注意';
  return '正常';
}

const levelColor: Record<City['level'], string> = {
  正常: 'default',
  注意: 'processing',
  预警: 'orange',
  警报: 'red',
};

const HeavyRainRisk: React.FC = () => {
  const [cities, setCities] = useState<City[]>(initialCities);
  const timerRef = useRef<number | null>(null);

  // 动态更新降雨量（模拟数据流）
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setCities((prev) =>
        prev.map((c) => {
          const delta = (Math.random() - 0.5) * 6; // -3 ~ +3
          const next = Math.max(0, Math.min(60, Math.round((c.rainfall + delta) * 10) / 10)); // 保留 1 位小数
          return { ...c, rainfall: next, level: calcLevel(next) };
        }),
      );
    }, 2000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const avgRainfall = useMemo(() => {
    return Math.round((cities.reduce((s, c) => s + c.rainfall, 0) / cities.length) * 10) / 10;
  }, [cities]);

  const tableColumns = [
    { title: '城市', dataIndex: 'name', key: 'name' },
    {
      title: '降雨量 (mm/h)',
      dataIndex: 'rainfall',
      key: 'rainfall',
      render: (v: number) => (
        <Space>
          <span>{v}</span>
          <Progress
            percent={Math.max(0, Math.min(100, Math.round((v / 60) * 100)))}
            size="small"
            status={v >= 30 ? 'exception' : v >= 20 ? 'active' : 'normal'}
            style={{ width: 120 }}
          />
        </Space>
      ),
    },
    {
      title: '预警等级',
      dataIndex: 'level',
      key: 'level',
      render: (l: City['level']) => <Tag color={levelColor[l]}>{l}</Tag>,
    },
  ];

  const handleSearch = (values: Record<string, unknown>) => {
    const kw = String(values.keyword || '').trim();
    if (kw) {
      message.success(`已按关键字筛选：${kw}`);
    } else {
      message.info('已重置筛选');
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="大湾区平均降雨量 (mm/h)" value={avgRainfall} precision={1} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="高风险城市数量"
              value={cities.filter((c) => c.level === '警报' || c.level === '预警').length}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="监测城市数" value={cities.length} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {cities.slice(0, 6).map((c) => (
          <Col key={c.id} xs={24} sm={12} md={8} lg={8}>
            <Card title={c.name} size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space align="center">
                  <Statistic title="降雨量 (mm/h)" value={c.rainfall} precision={1} />
                  <Tag color={levelColor[c.level]} style={{ marginLeft: 8 }}>
                    {c.level}
                  </Tag>
                </Space>
                <Progress
                  percent={Math.max(0, Math.min(100, Math.round((c.rainfall / 60) * 100)))}
                  status={c.rainfall >= 30 ? 'exception' : c.rainfall >= 20 ? 'active' : 'normal'}
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <PageContainer
        columns={tableColumns}
        dataSource={cities}
        onSearch={handleSearch}
        onReset={() => message.info('已重置筛选')}
      />
    </div>
  );
};

export default HeavyRainRisk;

