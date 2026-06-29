import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers/index';
import { router } from './router';

function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default App;
