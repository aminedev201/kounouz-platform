"use client"
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { Package, ShoppingCart, TrendingUp, DollarSign, Users, Clock, Eye, Star, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { commandService, productService } from '@/services/apis';
import Link from 'next/link';
import Loader from '@/components/loader/dashboardLoader';

const Home = () => {
    const { user, token, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [commands, setCommands] = useState([]);
    const [productCount, setProductCount] = useState(0);
    const [commandCount, setCommandCount] = useState(0);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        avgOrderValue: 0,
        confirmedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        revenueGrowth: 0,
        orderGrowth: 0
    });
    const [chartData, setChartData] = useState({
        salesChart: [],
        statusChart: [],
        revenueChart: [],
        topProducts: []
    });

    useEffect(() => {
        if (!authLoading && token) {
            fetchDashboardData();
        }
    }, [user, token, authLoading]);

    const fetchDashboardData = async () => {
        if (authLoading || !token) return;
        
        setLoading(true);
        try {
            const [productsRes, productCountRes, commandsRes, commandCountRes] = await Promise.all([
                productService.getVendorProducts(token),
                productService.vendorProductCount(token),
                commandService.vendorCommandList(token),
                commandService.vendorCommandCount(token)
            ]);

            // Safely extract data with fallbacks
            const productsData = productsRes?.data || [];
            const productCountData = productCountRes?.data?.count || 0;
            const commandsData = commandsRes?.data || [];
            const commandCountData = commandCountRes?.data?.count || 0;

            setProducts(productsData);
            setProductCount(productCountData);
            setCommands(commandsData);
            setCommandCount(commandCountData);

            // Process data for charts and statistics
            processChartData(productsData, commandsData);
            calculateStats(commandsData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processChartData = (productsData, commandsData) => {
        if (!Array.isArray(commandsData) || commandsData.length === 0) {
            setChartData({
                salesChart: [],
                statusChart: [
                    { name: 'Pending', value: 0, color: '#fbbf24' },
                    { name: 'Confirmed', value: 0, color: '#10b981' },
                    { name: 'Cancelled', value: 0, color: '#ef4444' }
                ],
                revenueChart: [],
                topProducts: []
            });
            return;
        }

        // Sales by date - Only count Confirmed orders (status === 1)
        const salesByDate = {};
        commandsData.forEach(command => {
            if (command?.status === 1 && command?.createdAt && command?.product?.price && command?.quantity) {
                const date = new Date(command.createdAt);
                // Format date consistently (YYYY-MM-DD for proper sorting)
                const dateKey = date.toISOString().split('T')[0];
                const displayDate = date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
                const revenue = parseFloat(command.product.price) * parseInt(command.quantity);
                
                if (!salesByDate[dateKey]) {
                    salesByDate[dateKey] = {
                        date: displayDate,
                        revenue: 0,
                        sortDate: dateKey
                    };
                }
                salesByDate[dateKey].revenue += revenue;
            }
        });

        // Convert to array and sort by date
        const salesChart = Object.values(salesByDate)
            .sort((a, b) => new Date(a.sortDate) - new Date(b.sortDate))
            .slice(-7) // Last 7 days
            .map(({ date, revenue }) => ({ date, revenue: Math.round(revenue * 100) / 100 }));

        // Order status distribution
        const statusCounts = { pending: 0, Confirmed: 0, cancelled: 0 };
        commandsData.forEach(command => {
            if (command?.status !== undefined) {
                if (command.status === 2) statusCounts.pending++;
                else if (command.status === 1) statusCounts.Confirmed++;
                else if (command.status === 0) statusCounts.cancelled++;
            }
        });

        const statusChart = [
            { name: 'Pending', value: statusCounts.pending, color: '#fbbf24' },
            { name: 'Confirmed', value: statusCounts.Confirmed, color: '#10b981' },
            { name: 'Cancelled', value: statusCounts.cancelled, color: '#ef4444' }
        ];

        // Revenue by month - Fixed month grouping
        const revenueByMonth = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        commandsData.forEach(command => {
            if (command?.status === 1 && command?.createdAt && command?.product?.price && command?.quantity) {
                const date = new Date(command.createdAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthName = monthNames[date.getMonth()];
                const revenue = parseFloat(command.product.price) * parseInt(command.quantity);
                
                if (!revenueByMonth[monthKey]) {
                    revenueByMonth[monthKey] = {
                        month: monthName,
                        revenue: 0,
                        sortKey: monthKey
                    };
                }
                revenueByMonth[monthKey].revenue += revenue;
            }
        });

        const revenueChart = Object.values(revenueByMonth)
            .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
            .map(({ month, revenue }) => ({ 
                month, 
                revenue: Math.round(revenue * 100) / 100 
            }));

        // Top products by sales
        const productSales = {};
        commandsData.forEach(command => {
            if (command?.status === 1 && command?.product?.name && command?.quantity) {
                const productName = command.product.name;
                productSales[productName] = (productSales[productName] || 0) + parseInt(command.quantity);
            }
        });

        const topProducts = Object.entries(productSales)
            .map(([product, sales]) => ({ 
                product: product.length > 20 ? product.substring(0, 20) + '...' : product, 
                sales 
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        setChartData({
            salesChart,
            statusChart,
            revenueChart,
            topProducts
        });
    };

    const calculateStats = (commandsData) => {
        if (!Array.isArray(commandsData)) {
            setStats({
                totalRevenue: 0,
                avgOrderValue: 0,
                confirmedOrders: 0,
                pendingOrders: 0,
                cancelledOrders: 0,
                revenueGrowth: 0,
                orderGrowth: 0
            });
            return;
        }

        const confirmedOrders = commandsData.filter(cmd => cmd?.status === 1);
        const pendingOrders = commandsData.filter(cmd => cmd?.status === 2);
        const cancelledOrders = commandsData.filter(cmd => cmd?.status === 0);

        const totalRevenue = confirmedOrders.reduce((sum, cmd) => {
            if (cmd?.product?.price && cmd?.quantity) {
                return sum + (parseFloat(cmd.product.price) * parseInt(cmd.quantity));
            }
            return sum;
        }, 0);

        const avgOrderValue = confirmedOrders.length > 0 
            ? totalRevenue / confirmedOrders.length 
            : 0;

        // Calculate growth rates (you can implement real calculation based on previous period data)
        const revenueGrowth = 12.5;
        const orderGrowth = 8.3;

        setStats({
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            avgOrderValue: Math.round(avgOrderValue * 100) / 100,
            confirmedOrders: confirmedOrders.length,
            pendingOrders: pendingOrders.length,
            cancelledOrders: cancelledOrders.length,
            revenueGrowth,
            orderGrowth
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 2: return 'bg-yellow-100 text-yellow-800';
            case 1: return 'bg-green-100 text-green-800';
            case 0: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 2: return 'Pending';
            case 1: return 'Confirmed';
            case 0: return 'Cancelled';
            default: return 'Unknown';
        }
    };

    // Custom tooltip for revenue chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-gray-600 text-sm">{`Date: ${label}`}</p>
                    <p className="text-blue-600 font-semibold">
                        {`Revenue: ${formatCurrency(payload[0].value)}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (<Loader />);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 text-center sm:text-start">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Home</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Welcome back! Here's what's happening with your store.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="text-sm text-gray-500">
                                Last updated: {new Date().toLocaleString()}
                            </div>
                            <button 
                                onClick={fetchDashboardData}
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Revenue */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                                <div className="flex items-center mt-2">
                                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-600 ml-1">+{stats.revenueGrowth}%</span>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{commandCount}</p>
                                <div className="flex items-center mt-2">
                                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-600 ml-1">+{stats.orderGrowth}%</span>
                                </div>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <ShoppingCart className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Products */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900">{productCount}</p>
                                <div className="flex items-center mt-2">
                                    <Eye className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm text-blue-600 ml-1">Active</span>
                                </div>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Package className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    {/* Average Order Value */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgOrderValue)}</p>
                                <div className="flex items-center mt-2">
                                    <TrendingUp className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm text-orange-600 ml-1">Trending</span>
                                </div>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <Star className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Revenue Chart - CORRECTED */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend - Confirmed Orders (Last 7 Days)</h3>
                        {chartData.salesChart.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData.salesChart}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fontSize: 12 }}
                                        axisLine={{ stroke: '#e0e0e0' }}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 12 }}
                                        axisLine={{ stroke: '#e0e0e0' }}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fill="#3b82f6"
                                        fillOpacity={0.1}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">
                                <div className="text-center">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No Confirmed orders with revenue data available</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Status Distribution */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
                        {chartData.statusChart.some(item => item.value > 0) ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData.statusChart.filter(item => item.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.statusChart.filter(item => item.value > 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">
                                <div className="text-center">
                                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No orders data available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Monthly Revenue & Top Products */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Monthly Revenue */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
                        {chartData.revenueChart.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData.revenueChart}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">
                                <div className="text-center">
                                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No monthly revenue data available</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                        {chartData.topProducts.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData.topProducts} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 12 }} />
                                    <YAxis 
                                        dataKey="product" 
                                        type="category" 
                                        width={100} 
                                        tick={{ fontSize: 10 }}
                                    />
                                    <Tooltip formatter={(value) => [value, 'Sales']} />
                                    <Bar dataKey="sales" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">
                                <div className="text-center">
                                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No product sales data available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                    </div>
                    {commands.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Quantity
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {commands.slice(0, 10).map((command) => (
                                            <tr key={command?.id || Math.random()} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{command?.id || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {command?.user?.name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {command?.product?.name || 'Unknown Product'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {command?.quantity || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency((command?.product?.price || 0) * (command?.quantity || 0))}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(command?.status)}`}>
                                                        {getStatusText(command?.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {command?.createdAt ? new Date(command.createdAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {commands.length > 10 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <Link href='/dashboard/orders' className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        View all orders →
                                    </Link>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center text-gray-500">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No recent orders found</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;