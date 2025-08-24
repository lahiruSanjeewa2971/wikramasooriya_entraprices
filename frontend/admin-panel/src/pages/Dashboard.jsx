import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Eye,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import adminService from '../services/adminService';

const StatCard = ({ title, value, icon: Icon, change, changeType = 'up' }) => (
  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </dt>
            <dd className="text-lg font-medium text-gray-900 dark:text-white">
              {value}
            </dd>
          </dl>
        </div>
      </div>
    </div>
    {change && (
      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
        <div className="text-sm">
          <span className={`font-medium ${
            changeType === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {changeType === 'up' ? '↗' : '↘'} {change}
          </span>
          <span className="text-gray-500 dark:text-gray-400"> from last month</span>
        </div>
      </div>
    )}
  </div>
);

export default function Dashboard() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: adminService.getDashboardOverview,
  });

  const { data: productAnalytics, isLoading: productAnalyticsLoading } = useQuery({
    queryKey: ['product-analytics'],
    queryFn: adminService.getProductAnalytics,
  });

  if (overviewLoading || productAnalyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Products',
      value: overview?.data?.totalProducts || 0,
      icon: Package,
      change: '+12%',
      changeType: 'up'
    },
    {
      title: 'Total Users',
      value: overview?.data?.totalUsers || 0,
      icon: Users,
      change: '+8%',
      changeType: 'up'
    },
    {
      title: 'Active Carts',
      value: overview?.data?.totalOrders || 0,
      icon: ShoppingCart,
      change: '+15%',
      changeType: 'up'
    },
    {
      title: 'Total Revenue',
      value: `$${overview?.data?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      change: '+22%',
      changeType: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your business performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Product Performance */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Top Products by Stock
          </h3>
          <div className="space-y-3">
            {productAnalytics?.data?.topProducts?.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {product.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Stock: {product.stock_qty}
                  </span>
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    ${product.price}
                  </span>
                </div>
              </div>
            ))}
            {(!productAnalytics?.data?.topProducts || productAnalytics.data.topProducts.length === 0) && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No products found
              </div>
            )}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent User Registrations
          </h3>
          <div className="space-y-3">
            {overview?.data?.recentUsers?.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user.role}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {(!overview?.data?.recentUsers || overview.data.recentUsers.length === 0) && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No users found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {overview?.data?.recentActivity?.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`h-2 w-2 rounded-full ${
                activity.type === 'user' ? 'bg-blue-600' : 'bg-green-600'
              }`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {activity.description}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
          {(!overview?.data?.recentActivity || overview.data.recentActivity.length === 0) && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
