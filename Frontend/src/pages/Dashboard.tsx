import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, TrendingUp, Clock, CheckCircle, Loader } from 'lucide-react';
import { StageCard } from '../components/StageCard';
import { grService } from '../services/grService';
import { workService } from '../services/workService';

// ✅ CORRECT interfaces
interface GR {
  id: number;
  grNumber: string;
  grDate: string;
}

interface Work {
  id: number;
  workName: string;
  AA: number;
  RA: number;
}

const Dashboard: React.FC = () => {
  const [grs, setGrs] = useState<GR[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ✅ FIXED: Fetch real data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch GRs and Works in parallel
      const [grsData, worksData] = await Promise.all([
        grService.fetchAllGRs(),
        workService.fetchAllWorks()
      ]);

      setGrs(grsData);
      setWorks(worksData);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Calculate real statistics
  const totalWorks = works.length;
  const totalValue = works.reduce((sum, work) => sum + (work.AA || 0), 0);

  // ✅ FIXED: Mock stage data (replace with real data when available)
  const stageData = {
    technical: { count: Math.floor(totalWorks * 0.3), value: totalValue * 0.3 },
    tender: { count: Math.floor(totalWorks * 0.25), value: totalValue * 0.25 },
    work: { count: Math.floor(totalWorks * 0.2), value: totalValue * 0.2 },
    finalBills: { count: Math.floor(totalWorks * 0.15), value: totalValue * 0.15 },
  };

  // ✅ Mock recent activities (replace with real API when available)
  const recentActivities = [
    { id: 1, text: 'New GR created', time: '2 hours ago' },
    { id: 2, text: 'Work order approved', time: '5 hours ago' },
    { id: 3, text: 'Technical sanction completed', time: '1 day ago' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of all government works and their current status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Works */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Works</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalWorks}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{(totalValue / 10000000).toFixed(1)}Cr
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Active GRs */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active GRs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{grs.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalWorks - stageData.finalBills.count}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Stage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StageCard
          title="Technical Sanctions"
          count={stageData.technical.count}
          works={[]}
          icon={<FileText />}
          color="blue"
          onClick={() => navigate('/technical-sanctions')}
        />
        <StageCard
          title="Tenders"
          count={stageData.tender.count}
          works={[]}
          icon={<FileText />}
          color="green"
          onClick={() => navigate('/tenders')}
        />
        <StageCard
          title="Work Orders"
          count={stageData.work.count}
          works={[]}
          icon={<FileText />}
          color="purple"
          onClick={() => navigate('/works')}
        />
        <StageCard
          title="Final Bills"
          count={stageData.finalBills.count}
          works={[]}
          icon={<CheckCircle />}
          color="blue"
          onClick={() => navigate('/bills')}
        />
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-gray-700">{activity.text}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
