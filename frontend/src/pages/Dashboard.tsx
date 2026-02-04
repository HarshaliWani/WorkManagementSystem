import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Loader, Receipt, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { grService } from '../services/grService';
import { workService } from '../services/workService';
import { tenderService } from '../services/tenderService';
import { billService } from '../services/billService';
import { GRTable } from '../components/GRTable';
import DemoBanner from '../components/DemoBanner';

// ✅ CORRECT interfaces
interface GR {
  id: number;
  grNumber: string;
  grDate: string;
  works?: Work[];
}

interface Tender {
  work_is_cancelled?: boolean;
  [key: string]: any;
}

interface Bill {
  billTotal?: number;
  work_is_cancelled?: boolean;
  [key: string]: any;
}

interface Work {
  id: number;
  workName: string;
  AA: number;
  RA: number;
  spills?: any[];
  isCancelled?: boolean;
}

const Dashboard: React.FC<{
  isEditMode?: boolean;
}> = ({ isEditMode = false }) => {
  const { isDemoMode } = useAuth();
  const [grs, setGrs] = useState<GR[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const formatCurrency = (amount: number): string => {
    // Handle invalid values
    if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
      return '₹0';
    }
    
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    } else {
      return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isDemoMode]);

  // ✅ FIXED: Fetch data from backend (demo or real based on auth status)
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all data in parallel (use demo endpoints if in demo mode)
      const [grsData, worksData, tendersData, billsData] = await Promise.all([
        grService.fetchAllGRs(isDemoMode),
        workService.fetchAllWorks(isDemoMode),
        tenderService.fetchAllTenders(isDemoMode),
        billService.fetchAllBills(isDemoMode)
      ]);

      // ✅ Sort GRs by date (most recent first)
      const sortedGRs = grsData.sort((a: GR, b: GR) =>
        new Date(b.grDate).getTime() - new Date(a.grDate).getTime()
      );

      setGrs(sortedGRs);
      setWorks(worksData);
      setTenders(tendersData);
      setBills(billsData);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely parse number values (handles strings and numbers)
  const parseNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Filter out cancelled works for statistics (cards only - tables still show them)
  const activeWorks = works.filter(work => !work.isCancelled);
  const activeTenders = tenders.filter(tender => !tender.work_is_cancelled);
  const activeBills = bills.filter(bill => !bill.work_is_cancelled);
  
  // ✅ Calculate statistics from non-cancelled works only (for cards)
  const totalGRs = grs.length;
  const totalWorks = activeWorks.length;
  const totalTenders = activeTenders.length;
  
  // Total RA = sum of all non-cancelled work.RA + sum of all spill.ARA
  const totalRA = activeWorks.reduce((sum, work) => {
    const workRA = parseNumber(work.RA);
    const spillsARA = work.spills?.reduce((spillSum, spill) => {
      const spillARA = parseNumber(spill.ARA);
      return spillSum + spillARA;
    }, 0) || 0;
    return sum + workRA + spillsARA;
  }, 0);
  
  // Total AA = sum of all non-cancelled work.AA
  const totalAA = activeWorks.reduce((sum, work) => {
    const workAA = parseNumber(work.AA);
    return sum + workAA;
  }, 0);
  
  // Total Expenditure = sum of all bill total amounts (from non-cancelled works only)
  const totalExpenditure = activeBills.reduce((sum, bill) => {
    const billTotal = parseNumber(bill.billTotal);
    return sum + billTotal;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemoMode && <DemoBanner />}
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of all government works and their current status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total GRs */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total GRs</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{totalGRs}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        {/* Total Works */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Works</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{totalWorks}</p>
            </div>
            <FileText className="w-12 h-12 text-green-500" />
          </div>
        </div>

        {/* Total Tenders */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Tenders</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{totalTenders}</p>
            </div>
            <FileText className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        {/* Total RA */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Total RA</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">
                {formatCurrency(totalRA)}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-500" />
          </div>
        </div>

        {/* Total AA */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">Total AA</p>
              <p className="text-3xl font-bold text-indigo-900 mt-2">
                {formatCurrency(totalAA)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-indigo-500" />
          </div>
        </div>

        {/* Total Expenditure */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Total Expenditure</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                {formatCurrency(totalExpenditure)}
              </p>
            </div>
            <Receipt className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* GR List */}
      <GRTable
        grs={grs}
        isEditMode={isEditMode}
        onDataUpdate={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;


