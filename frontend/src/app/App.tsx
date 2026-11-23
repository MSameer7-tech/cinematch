import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers/index';
import { router } from './router';
import { Toaster } from 'sonner';

function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <Toaster theme="dark" closeButton richColors position="top-right" />
    </AppProviders>
  );
}

export default App;
