import './App.css';
import Navbar from './components/Navbar';
import DevAuthIndicator from './components/DevAuthIndicator';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Navbar />
        <DevAuthIndicator />
        <h1 style={{ color: 'white' }}>ROUTER TEST</h1>
      </AuthProvider>
    </div>
  );
}

export default App;
