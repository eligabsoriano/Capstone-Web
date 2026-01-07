import { createBrowserRouter } from 'react-router-dom';

// Placeholder pages - replace with actual implementations
const Dashboard = () => <div>Dashboard</div>;
const Login = () => <div>Login</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/login',
    element: <Login />,
  },
]);
