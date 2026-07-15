import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shops from './pages/Shops';
import Products from './pages/Products';
import Compare from './pages/Compare';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// VyaparSetu Pages
import UploadRequirement from './pages/UploadRequirement';
import CompareQuotations from './pages/CompareQuotations';
import OrdersList from './pages/OrdersList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="shops" element={<Shops />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="compare" element={<Compare />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />

            {/* Protected Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="requirements/upload"
              element={
                <ProtectedRoute>
                  <UploadRequirement />
                </ProtectedRoute>
              }
            />
            <Route
              path="compare/:id"
              element={
                <ProtectedRoute>
                  <CompareQuotations />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders"
              element={
                <ProtectedRoute>
                  <OrdersList />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
