import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Dashboard from './components/Dashboard.jsx';
import Streams from './components/Streams.jsx';
import Analytics from './components/Analytics.jsx';
import Notifications from './components/Notifications.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'streams',
        element: <Streams />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
      {
        path: 'notifications',
        element: <Notifications />,
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
