import React, { useState } from 'react';
import { Layout, Menu, Breadcrumb, theme, Grid, Drawer, Button } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  AppstoreOutlined,
  TeamOutlined,
  MenuOutlined,
  ApartmentOutlined,
  IdcardOutlined,
  BookOutlined,
  ToolOutlined,
  NotificationOutlined,
  FileTextOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import { CloudOutlined, HeatMapOutlined, DashboardOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header, Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('数据产品', '/products', <AppstoreOutlined />, [
    getItem('暴雨风险', '/products/rain', <CloudOutlined />),
    getItem('降雨地图', '/products/rain-map', <HeatMapOutlined />),
    getItem('风速监控', '/products/wind-map', <DashboardOutlined />),
    getItem('粤港澳大湾区', '/products/gba-map', <EnvironmentOutlined />),
  ]),
  getItem('系统管理', '/sys', <SettingOutlined />, [
    getItem('用户管理', '/sys/user', <UserOutlined />),
    getItem('角色管理', '/sys/role', <TeamOutlined />),
    getItem('菜单管理', '/sys/menu', <MenuOutlined />),
    getItem('部门管理', '/sys/dept', <ApartmentOutlined />),
    getItem('岗位管理', '/sys/post', <IdcardOutlined />),
    getItem('字典管理', '/sys/dict', <BookOutlined />),
    getItem('参数设置', '/sys/param', <ToolOutlined />),
    getItem('通知公告', '/sys/notice', <NotificationOutlined />),
    getItem('日志管理', '/sys/log', <FileTextOutlined />),
  ]),
];

const breadcrumbNameMap: Record<string, string> = {
  '/products': '数据产品',
  '/products/rain': '暴雨风险',
  '/products/rain-map': '降雨地图',
  '/products/wind-map': '风速监控',
  '/products/gba-map': '粤港澳大湾区',
  '/sys': '系统管理',
  '/sys/user': '用户管理',
  '/sys/role': '角色管理',
  '/sys/menu': '菜单管理',
  '/sys/dept': '部门管理',
  '/sys/post': '岗位管理',
  '/sys/dict': '字典管理',
  '/sys/param': '参数设置',
  '/sys/notice': '通知公告',
  '/sys/log': '日志管理',
};

const { useBreakpoint } = Grid;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const screens = useBreakpoint();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = !screens.md; // Consider mobile if screen width is less than md (768px)

  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    return {
      key: url,
      title: breadcrumbNameMap[url] || url,
    };
  });

  const breadcrumbItems = [
    {
      key: '/',
      title: <Link to="/">首页</Link>,
    },
    ...extraBreadcrumbItems,
  ];

  // Determine selected keys and open keys
  const selectedKeys = [location.pathname];

  // Find the open key based on the current path
  const rootSubmenuKeys = ['/sys', '/products'];
  const currentOpenKey = rootSubmenuKeys.find(key => location.pathname.startsWith(key));
  const defaultOpenKeys = currentOpenKey ? [currentOpenKey] : ['/sys'];

  const menuContent = (
    <Menu
      theme="dark"
      defaultSelectedKeys={selectedKeys}
      selectedKeys={selectedKeys}
      defaultOpenKeys={defaultOpenKeys}
      mode="inline"
      items={items}
      onClick={({ key }) => {
        navigate(String(key));
        if (isMobile) setDrawerVisible(false);
      }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
          {menuContent}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          styles={{ body: { padding: 0, backgroundColor: '#001529' } }}
          size="default"
        >
          <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
          {menuContent}
        </Drawer>
      )}

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <Button
              type="text"
              icon={drawerVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setDrawerVisible(!drawerVisible)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
          )}
        </Header>
        <Content style={{
          margin: '0 16px', minHeight: 280,
        }}>
          <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
