import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Row, Col, Statistic, message } from 'antd';
import * as echarts from 'echarts';

type RegionData = { name: string; value: number };

const GBA_REGIONS: { code: string; name: string }[] = [
  { code: '440100', name: '广州市' },
  { code: '440300', name: '深圳市' },
  { code: '440400', name: '珠海市' },
  { code: '440600', name: '佛山市' },
  { code: '441300', name: '惠州市' },
  { code: '441900', name: '东莞市' },
  { code: '442000', name: '中山市' },
  { code: '440700', name: '江门市' },
  { code: '441200', name: '肇庆市' },
  { code: '810000', name: '香港特别行政区' },
  { code: '820000', name: '澳门特别行政区' },
];

const RainMap: React.FC = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const [data, setData] = useState<RegionData[]>(
    GBA_REGIONS.map((r, idx) => ({ name: r.name, value: (idx * 4) % 35 }))
  );

  const avgRainfall = useMemo(() => {
    return Math.round((data.reduce((s, d) => s + d.value, 0) / data.length) * 10) / 10;
  }, [data]);

  useEffect(() => {
    let timer: number | undefined;

    const init = async () => {
      try {
        const urls = GBA_REGIONS.map(
          (r) => `https://geo.datav.aliyun.com/areas_v3/bound/${r.code}.json`
        );
        const collections: Array<{ type: string; features: unknown[] }> = await Promise.all(
          urls.map((u) =>
            fetch(u)
              .then((res) => res.json())
          )
        );
        const combined: { type: 'FeatureCollection'; features: unknown[] } = {
          type: 'FeatureCollection',
          features: collections.flatMap((c) => c.features || []),
        };
        (echarts as unknown as { registerMap: (name: string, geoJson: unknown) => void }).registerMap('gba', combined);

        if (chartRef.current) {
          chartInstanceRef.current = echarts.init(chartRef.current);
          const option: echarts.EChartsOption = {
            title: { text: '中国大湾区降雨量 (mm/h)', left: 'center' },
            tooltip: { trigger: 'item', formatter: '{b}<br/>降雨量: {c} mm/h' },
            visualMap: {
              min: 0,
              max: 60,
              left: 'left',
              bottom: '5%',
              text: ['高', '低'],
              inRange: { color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'] },
            },
            series: [
              {
                name: '降雨量',
                type: 'map',
                map: 'gba',
                roam: true,
                label: { show: false },
                data,
              },
            ],
          };
          chartInstanceRef.current.setOption(option);
        }

        timer = window.setInterval(() => {
          setData((prev) =>
            prev.map((d) => {
              const delta = Math.round((Math.random() - 0.5) * 6); // -3~+3
              const next = Math.max(0, Math.min(60, d.value + delta));
              return { ...d, value: next };
            })
          );
        }, 2000);
      } catch {
        message.error('地图数据加载失败');
      }
    };
    init();

    return () => {
      if (timer) window.clearInterval(timer);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.setOption({ series: [{ data }] });
    }
  }, [data]);

  useEffect(() => {
    const resize = () => chartInstanceRef.current?.resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="平均降雨量 (mm/h)" value={avgRainfall} precision={1} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="监测区域数" value={data.length} />
          </Card>
        </Col>
      </Row>
      <Card>
        <div ref={chartRef} style={{ width: '100%', height: 560 }} />
      </Card>
    </div>
  );
};

export default RainMap;
