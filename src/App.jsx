import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import POS from './components/POS';
import ProductList from './components/ProductList';
import Settings from './components/Settings';
import OrderList from './components/OrderList';
import SalesDashboard from './components/SalesDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('pos');

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'pos' && <POS />}
        {activeTab === 'orders' && <OrderList setActiveTab={setActiveTab} />}
        {activeTab === 'analytics' && <SalesDashboard />}
        {activeTab === 'products' && <ProductList />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App;
