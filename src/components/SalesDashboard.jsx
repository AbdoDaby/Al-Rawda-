
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../contexts/StoreContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';

const SalesDashboard = () => {
    const { t } = useTranslation();
    const { orders, products } = useStore();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Filter orders by selected date
    const dailyOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDate = new Date(order.created_at || order.date).toISOString().split('T')[0];
            return orderDate === selectedDate;
        });
    }, [orders, selectedDate]);

    // Calculate metrics
    const metrics = useMemo(() => {
        return dailyOrders.reduce((acc, order) => {
            acc.sales += order.total || 0;
            acc.profit += order.totalProfit || 0;
            acc.count += 1;
            return acc;
        }, { sales: 0, profit: 0, count: 0 });
    }, [dailyOrders]);

    const margin = metrics.sales > 0 ? (metrics.profit / metrics.sales) * 100 : 0;

    // Product Performance Data
    const productStats = useMemo(() => {
        const stats = {};

        products.forEach(p => {
            stats[p.id] = {
                id: p.id,
                name: p.name,
                stock: p.stock || 0,
                cost: p.cost || 0,
                price: p.price,
                sold: 0,
                revenue: 0,
                profit: 0
            };
        });

        orders.forEach(order => {
            order.items.forEach(item => {
                if (!stats[item.id]) {
                    stats[item.id] = {
                        id: item.id,
                        name: item.name,
                        stock: 0,
                        cost: item.cost || 0,
                        price: item.price,
                        sold: 0,
                        revenue: 0,
                        profit: 0
                    };
                }
                stats[item.id].sold += item.quantity;
                stats[item.id].revenue += item.total;
                const profit = (item.price - (item.cost || 0)) * item.quantity;
                stats[item.id].profit += profit;
            });
        });

        return Object.values(stats);
    }, [orders, products]);

    const topProducts = [...productStats].sort((a, b) => b.profit - a.profit).slice(0, 5);

    return (
        <div className="sales-dashboard fade-in">
            <div className="dashboard-header">
                <h2>{t('analytics.title')}</h2>
                <div className="date-picker-wrapper">
                    <label>{t('analytics.dailyView')}</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="date-input"
                    />
                </div>
            </div>

            <div className="metrics-grid">
                <div className="metric-card sales">
                    <h3>{t('analytics.dailySales')}</h3>
                    <div className="value">{metrics.sales.toFixed(2)} {t('common.egp')}</div>
                    <div className="subtitle">{t('analytics.ordersToday', { count: metrics.count })}</div>
                </div>
                <div className="metric-card profit">
                    <h3>{t('analytics.dailyProfit')}</h3>
                    <div className="value text-success">{metrics.profit.toFixed(2)} {t('common.egp')}</div>
                    <div className="subtitle">{t('analytics.netProfit')}</div>
                </div>
                <div className="metric-card margin">
                    <h3>{t('analytics.profitMargin')}</h3>
                    <div className="value">{margin.toFixed(1)}%</div>
                    <div className="subtitle">{t('analytics.ofRevenue')}</div>
                </div>
                <div className="metric-card stock">
                    <h3>{t('analytics.inventoryValue')}</h3>
                    <div className="value">
                        {products.reduce((acc, p) => acc + ((p.stock || 0) * (p.cost || 0)), 0).toFixed(2)} {t('common.egp')}
                    </div>
                    <div className="subtitle">{t('analytics.costBasis')}</div>
                </div>
            </div>

            <div className="charts-container">
                <div className="card">
                    <h3>{t('analytics.topProducts')}</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis type="number" stroke="#94A3B8" />
                                <YAxis dataKey="name" type="category" width={100} stroke="#94A3B8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="profit" fill="url(#colorProfit)" name={t('analytics.netProfit')} radius={[0, 4, 4, 0]} />
                                <defs>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="5%" stopColor="#00E676" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#00B09B" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3>{t('analytics.salesTrends')}</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" hide />
                                <YAxis stroke="#94A3B8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Legend wrapperStyle={{ color: '#fff' }} />
                                <Bar dataKey="revenue" fill="url(#colorRev)" name={t('analytics.revenue')} />
                                <Bar dataKey="sold" fill="url(#colorSold)" name={t('analytics.unitsSold')} />
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3A7BD5" stopOpacity={0.8} />
                                    </linearGradient>
                                    <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F80759" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#BC4E9C" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>{t('analytics.detailedPerformance')}</h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('products.name')}</th>
                                <th>{t('products.cost')}</th>
                                <th>{t('products.price')}</th>
                                <th>{t('products.stock')}</th>
                                <th>{t('analytics.unitsSold')}</th>
                                <th>{t('analytics.revenue')}</th>
                                <th>{t('analytics.netProfit')}</th>
                                <th>{t('analytics.profitMargin')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productStats.map(stat => (
                                <tr key={stat.id}>
                                    <td>
                                        <div className="font-bold">{stat.name}</div>
                                        {stat.stock < 5 && <span className="badge-warning">{t('products.lowStock')}</span>}
                                    </td>
                                    <td>{stat.cost.toFixed(2)}</td>
                                    <td>{stat.price.toFixed(2)}</td>
                                    <td className={stat.stock < 5 ? 'text-danger fw-bold' : ''}>{stat.stock}</td>
                                    <td>{stat.sold}</td>
                                    <td>{stat.revenue.toFixed(2)}</td>
                                    <td className="text-success">{stat.profit.toFixed(2)}</td>
                                    <td>
                                        {stat.price > 0
                                            ? (((stat.price - stat.cost) / stat.price) * 100).toFixed(1)
                                            : 0}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
