import React, { useMemo } from 'react';
import { CheckCircle, Clock, FileText, DollarSign } from 'lucide-react';
import { GR, Work } from '../data/mockData';
import { StageCard } from '../components/StageCard';

interface DashboardProps {
  grs: GR[];
  onStageClick: (stage: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ grs, onStageClick }) => {
  const stageData = useMemo(() => {
    const allWorks: Work[] = grs.flatMap(gr => gr.works);
    
    // Technical Sanctions - works that have spills with technical sanctions
    const technicalSanctionWorks = allWorks.filter(work => 
      work.spills.some(spill => spill.technicalSanctions.length > 0)
    );
    
    // Work Orders - works that have tenders with work orders
    const workOrderWorks = allWorks.filter(work =>
      work.spills.some(spill =>
        spill.technicalSanctions.some(ts =>
          ts.tenders.some(tender => tender.workOrder)
        )
      )
    );
    
    // Bills - works that have bills
    const billWorks = allWorks.filter(work =>
      work.spills.some(spill =>
        spill.technicalSanctions.some(ts =>
          ts.tenders.some(tender => tender.bills.length > 0)
        )
      )
    );
    
    // Final Bills - works that have final bills
    const finalBillWorks = allWorks.filter(work =>
      work.spills.some(spill =>
        spill.technicalSanctions.some(ts =>
          ts.tenders.some(tender => 
            tender.bills.some(bill => bill.billType === 'Final')
          )
        )
      )
    );

    return {
      allWorks,
      technicalSanctions: {
        count: technicalSanctionWorks.length,
        works: technicalSanctionWorks
      },
      workOrders: {
        count: workOrderWorks.length,
        works: workOrderWorks
      },
      bills: {
        count: billWorks.length,
        works: billWorks
      },
      finalBills: {
        count: finalBillWorks.length,
        works: finalBillWorks
      }
    };
  }, [grs]);

  const totalWorks = grs.reduce((sum, gr) => sum + gr.works.length, 0);
  const totalValue = grs.reduce((sum, gr) => 
    sum + gr.works.reduce((workSum, work) => workSum + work.AA, 0), 0
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Government Works Dashboard
        </h1>
        <p className="text-gray-600">
          Overview of all government works and their current status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Works</p>
              <p className="text-2xl font-bold text-gray-900">{totalWorks}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(totalValue / 10000000).toFixed(1)}Cr
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active GRs</p>
              <p className="text-2xl font-bold text-gray-900">{grs.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalWorks - stageData.finalBills.count}
              </p>
            </div>
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Stage-wise Progress */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Work Progress by Stage
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StageCard
            title="All Works"
            count={totalWorks}
            works={stageData.allWorks}
            icon={<FileText className="w-6 h-6" />}
            color="blue"
            onClick={() => onStageClick('work-list')}
          />
          
          <StageCard
            title="Technical Sanctions"
            count={stageData.technicalSanctions.count}
            works={stageData.technicalSanctions.works}
            icon={<FileText className="w-6 h-6" />}
            color="blue"
            onClick={() => onStageClick('technical-sanctions')}
          />
          
          <StageCard
            title="Work Orders"
            count={stageData.workOrders.count}
            works={stageData.workOrders.works}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
            onClick={() => onStageClick('work-orders')}
          />
          
          <StageCard
            title="Bills"
            count={stageData.bills.count}
            works={stageData.bills.works}
            icon={<DollarSign className="w-6 h-6" />}
            color="yellow"
            onClick={() => onStageClick('bills')}
          />
          
          <StageCard
            title="Final Bills"
            count={stageData.finalBills.count}
            works={stageData.finalBills.works}
            icon={<CheckCircle className="w-6 h-6" />}
            color="purple"
            onClick={() => onStageClick('final-bills')}
          />
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Work order approved for Project #{item}
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};