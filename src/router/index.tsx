import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import UserManage from '../pages/sys/UserManage';
import RoleManage from '../pages/sys/RoleManage';
import MenuManage from '../pages/sys/MenuManage';
import DeptManage from '../pages/sys/DeptManage';
import PostManage from '../pages/sys/PostManage';
import DictManage from '../pages/sys/DictManage';
import ParamManage from '../pages/sys/ParamManage';
import NoticeManage from '../pages/sys/NoticeManage';
import LogManage from '../pages/sys/LogManage';
import ProductList from '../pages/products/ProductList';
import HeavyRainRisk from '../pages/products/HeavyRainRisk';
import RainMap from '../pages/products/RainMap';
import WindSpeedMap from '../pages/products/WindSpeedMap';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Navigate to="/products" replace /> },
      { path: 'products', element: <ProductList /> },
      { path: 'products/rain', element: <HeavyRainRisk /> },
      { path: 'products/rain-map', element: <RainMap /> },
      { path: 'products/wind-map', element: <WindSpeedMap /> },
      {
        path: 'sys',
        children: [
          { path: '', element: <Navigate to="user" replace /> },
          { path: 'user', element: <UserManage /> },
          { path: 'role', element: <RoleManage /> },
          { path: 'menu', element: <MenuManage /> },
          { path: 'dept', element: <DeptManage /> },
          { path: 'post', element: <PostManage /> },
          { path: 'dict', element: <DictManage /> },
          { path: 'param', element: <ParamManage /> },
          { path: 'notice', element: <NoticeManage /> },
          { path: 'log', element: <LogManage /> },
        ]
      }
    ]
  }
]);

export default router;
