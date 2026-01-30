import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Row, Col, Statistic, Radio, Switch, Space } from 'antd';
import * as echarts from 'echarts';

type RegionWind = { name: string; speed: number; dir: number };

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

function dirText(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(((deg % 360) / 45)) % 8;
  return dirs[idx];
}

const WindSpeedMap: React.FC = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const zoomRef = useRef<number>(1);
  const [layoutTick, setLayoutTick] = useState(0);
  const [data, setData] = useState<RegionWind[]>(
    GBA_REGIONS.map((r, idx) => ({ name: r.name, speed: (idx * 1.5) % 10, dir: (idx * 40) % 360 }))
  );
  const [selected, setSelected] = useState<RegionWind | null>(null);
  const [layer, setLayer] = useState<'wind' | 'temp' | 'pressure' | 'precip' | 'cloud'>('wind');
  const [particles, setParticles] = useState(true);
  const rafRef = useRef<number | null>(null);
  const particleFieldSeedRef = useRef<number>(0);
  useEffect(() => {
    if (particleFieldSeedRef.current === 0) {
      particleFieldSeedRef.current = 789; // deterministic initial seed
    }
  }, []);

  const avgSpeed = useMemo(() => {
    return Math.round((data.reduce((s, d) => s + d.speed, 0) / data.length) * 10) / 10;
  }, [data]);

  useEffect(() => {
    let timer: number | undefined;

    const init = async () => {
      const urls = GBA_REGIONS.map(
        (r) => `https://geo.datav.aliyun.com/areas_v3/bound/${r.code}.json`
      );
      const collections: Array<{ type: string; features: unknown[] }> = await Promise.all(
        urls.map((u) => fetch(u).then((res) => res.json()))
      );
      const combined: { type: 'FeatureCollection'; features: unknown[] } = {
        type: 'FeatureCollection',
        features: collections.flatMap((c) => c.features || []),
      };
      (echarts as unknown as { registerMap: (name: string, geoJson: unknown) => void }).registerMap('gba', combined);

      if (chartRef.current) {
        chartInstanceRef.current = echarts.init(chartRef.current);
        const option: echarts.EChartsOption = {
          title: { text: '中国大湾区风速 (m/s)', left: 'center' },
          tooltip: {
            trigger: 'item',
            formatter: '{b}<br/>风速: {c} m/s',
          },
          visualMap: {
            min: 0,
            max: 20,
            left: 'left',
            bottom: '5%',
            text: ['高', '低'],
            inRange: { color: ['#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'] },
          },
          series: [
            {
              name: '风速',
              type: 'map',
              map: 'gba',
              roam: true,
              label: { show: false },
              data: data.map((d) => ({ name: d.name, value: d.speed })),
            },
          ],
        };
        chartInstanceRef.current.setOption(option);
        chartInstanceRef.current.on('mouseover', (p: { name?: string }) => {
          const n = p?.name;
          const found = data.find((d) => d.name === n) || null;
          setSelected(found);
        });
        chartInstanceRef.current.on('click', (p: { name?: string }) => {
          const n = p?.name;
          const found = data.find((d) => d.name === n) || null;
          setSelected(found);
        });
        chartInstanceRef.current.on('georoam', () => {
          const opt = chartInstanceRef.current?.getOption() as unknown as { series?: Array<{ zoom?: number }> };
          const z = opt?.series?.[0]?.zoom;
          zoomRef.current = typeof z === 'number' ? z : 1;
          setLayoutTick((t) => t + 1);
        });
      }

      timer = window.setInterval(() => {
        setData((prev) =>
          prev.map((d) => {
            const dv = (Math.random() - 0.5) * 1.2; // -0.6 ~ 0.6 m/s
            const dd = (Math.random() - 0.5) * 30;  // -15 ~ 15 deg
            const nextV = Math.max(0, Math.min(20, Math.round((d.speed + dv) * 10) / 10));
            const nextD = (d.dir + dd + 360) % 360;
            return { ...d, speed: nextV, dir: nextD };
          })
        );
      }, 2000);
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
      chartInstanceRef.current.setOption({
        series: [{ data: data.map((d) => ({ name: d.name, value: d.speed })) }],
      });
    }
  }, [data]);

  useEffect(() => {
    const resize = () => chartInstanceRef.current?.resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => setLayoutTick((t) => t + 1));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Wind particles rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const cw = Math.max(1, Math.floor(rect.width * dpr));
    const ch = Math.max(1, Math.floor(rect.height * dpr));
    (canvas as HTMLCanvasElement).width = cw;
    (canvas as HTMLCanvasElement).height = ch;

    const avgDir = Math.round(
      (data.reduce((s, d) => s + d.dir, 0) / Math.max(1, data.length)) % 360
    );
    const avgSpd = data.reduce((s, d) => s + d.speed, 0) / Math.max(1, data.length);

    type Particle = { x: number; y: number; life: number };
    const particlesList: Particle[] = [];
    const area = (canvas as HTMLCanvasElement).width * (canvas as HTMLCanvasElement).height;
    const density = Math.max(50, Math.floor(area / (3600 * dpr)));
    for (let i = 0; i < density; i++) {
      particlesList.push({
        x: Math.random() * cw,
        y: Math.random() * ch,
        life: Math.random() * 120 + 60,
      });
    }

    const seed = particleFieldSeedRef.current;
    const baseAngle = (avgDir * Math.PI) / 180;
    let baseSpeed = Math.max(0.2, Math.min(3, avgSpd / 3));
    const zf = Math.max(zoomRef.current || 1, 1);
    baseSpeed = baseSpeed / zf;

    let stroke = 'rgba(255,255,255,1)';
    const echCanvas = chartRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (echCanvas) {
      const ecCtx = echCanvas.getContext('2d');
      if (ecCtx) {
        const sx = Math.floor(echCanvas.width / 2);
        const sy = Math.floor(echCanvas.height / 2);
        try {
          const pix = ecCtx.getImageData(sx, sy, 1, 1).data;
          const lum = (0.2126 * pix[0] + 0.7152 * pix[1] + 0.0722 * pix[2]) / 255;
          if (lum >= 0.5) {
            stroke = 'rgba(0,0,0,1)';
          }
        } catch { void 0; }
      }
    }
    const lineW = (window.devicePixelRatio || 1) * Math.max(0.6, 1 / zf);

    function vectorAt(x: number, y: number): { vx: number; vy: number } {
      const nx = (x / cw) * 2 - 1;
      const ny = (y / ch) * 2 - 1;
      const swirl = Math.sin(nx * 3 + seed) * Math.cos(ny * 3 + seed * 0.7);
      let vx = Math.cos(baseAngle) * baseSpeed + swirl * 0.6;
      let vy = Math.sin(baseAngle) * baseSpeed + swirl * 0.6;
      const r0 = Math.min(cw, ch);
      const vortices: Array<{ cx: number; cy: number; radius: number; strength: number }> = [
        { cx: cw * 0.38, cy: ch * 0.46, radius: r0 * 0.28, strength: 1.1 },
        { cx: cw * 0.72, cy: ch * 0.56, radius: r0 * 0.22, strength: 0.9 },
      ];
      const eps = 1e-6;
      for (let i = 0; i < vortices.length; i++) {
        const v = vortices[i];
        const dx = x - v.cx;
        const dy = y - v.cy;
        const rad = Math.sqrt(dx * dx + dy * dy) + eps;
        const fall = Math.exp(-((rad / v.radius) * (rad / v.radius)));
        const tnx = -dy / rad;
        const tny = dx / rad;
        vx += tnx * v.strength * fall;
        vy += tny * v.strength * fall;
      }
      return { vx, vy };
    }

    function step(): void {
      if (!ctx) return;
      ctx.globalAlpha = 0.8;
      ctx.clearRect(0, 0, cw, ch);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineW * 1.25;
      ctx.beginPath();

      for (let i = 0; i < particlesList.length; i++) {
        const p = particlesList[i];
        const { vx, vy } = vectorAt(p.x, p.y);
        const nx = p.x + vx * 1.5 * dpr;
        const ny = p.y + vy * 1.5 * dpr;

        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);

        p.x = nx;
        p.y = ny;
        p.life -= 1;
        if (p.life <= 0 || p.x < 0 || p.y < 0 || p.x >= cw || p.y >= ch) {
          p.x = Math.random() * cw;
          p.y = Math.random() * ch;
          p.life = Math.random() * 120 + 60;
        }
      }
      ctx.stroke();
      rafRef.current = window.requestAnimationFrame(step);
    }

    if (particles) {
      // start
      ctx.clearRect(0, 0, cw, ch);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = window.requestAnimationFrame(step);
    } else {
      // stop
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      ctx.clearRect(0, 0, cw, ch);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [particles, data, layoutTick]);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="平均风速 (m/s)" value={avgSpeed} precision={1} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="监测区域数" value={data.length} />
          </Card>
        </Col>
      </Row>

      <div style={{ position: 'relative' }}>
        <Card style={{ position: 'absolute', left: 12, top: 12, zIndex: 10, width: 220 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio.Group value={layer} onChange={(e) => setLayer(e.target.value)} style={{ width: '100%' }}>
              <Space direction="vertical">
                <Radio.Button value="temp" disabled>Temperature</Radio.Button>
                <Radio.Button value="pressure" disabled>Pressure</Radio.Button>
                <Radio.Button value="wind">Wind speed</Radio.Button>
                <Radio.Button value="precip" disabled>Precipitation</Radio.Button>
                <Radio.Button value="cloud" disabled>Clouds</Radio.Button>
              </Space>
            </Radio.Group>
            <Space align="center">
              <span>Wind particles</span>
              <Switch checked={particles} onChange={setParticles} />
            </Space>
          </Space>
        </Card>

        <Card style={{ position: 'absolute', right: 12, top: 12, zIndex: 10, width: 260 }}>
          {selected ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{selected.name}</div>
              <Statistic title="风速 (m/s)" value={selected.speed} precision={1} />
              <Statistic title="风向" value={`${Math.round(selected.dir)}° ${dirText(selected.dir)}`} />
            </Space>
          ) : (
            <div>悬停或点击地图查看具体城市风速</div>
          )}
        </Card>

        <Card>
          <div ref={containerRef} style={{ position: 'relative', width: '100%', height: 560 }}>
            <div ref={chartRef} style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }} />
            <canvas
              ref={canvasRef}
              style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WindSpeedMap;
