import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CheckCircle, Clock, AlertCircle, FileText, MessageSquare } from 'lucide-react';
import { ExaminationStatus, type ExaminationRecord } from '../../utils/examination';
import ApplicationQueue from './ApplicationQueue';
import ExaminationChecklist from './ExaminationChecklist';
import ExaminationNotes from './ExaminationNotes';
import OfficeActions from './OfficeActions';

interface ExaminerDashboardProps {
  examinerData: {
    id: string;
    name: string;
    role: string;
  };
}

export default function ExaminerDashboard({ examinerData }: ExaminerDashboardProps) {
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('queue');

  const statusColors: Record<ExaminationStatus, string> = {
    pending_review: 'bg-yellow-100 text-yellow-800',
    under_examination: 'bg-blue-100 text-blue-800',
    office_action: 'bg-purple-100 text-purple-800',
    response_required: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  };

  const getStatusIcon = (status: ExaminationStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending_review':
      case 'under_examination':
        return <Clock className="w-5 h-5" />;
      case 'rejected':
      case 'withdrawn':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Examiner Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {examinerData.name}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Application Queue */}
          <div className="lg:col-span-4">
            <div className="bg-white shadow rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Application Queue</h2>
              </div>
              <ApplicationQueue
                examinerId={examinerData.id}
                onSelectApplication={setSelectedApplication}
                selectedApplicationId={selectedApplication}
              />
            </div>
          </div>

          {/* Examination Workspace */}
          <div className="lg:col-span-8">
            {selectedApplication ? (
              <div className="bg-white shadow rounded-lg">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="border-b border-gray-200">
                    <TabsList className="flex">
                      <TabsTrigger
                        value="checklist"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Checklist
                      </TabsTrigger>
                      <TabsTrigger
                        value="notes"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Notes & Comments
                      </TabsTrigger>
                      <TabsTrigger
                        value="actions"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Office Actions
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-4">
                    <TabsContent value="checklist">
                      <ExaminationChecklist
                        applicationId={selectedApplication}
                        examinerId={examinerData.id}
                      />
                    </TabsContent>

                    <TabsContent value="notes">
                      <ExaminationNotes
                        applicationId={selectedApplication}
                        examinerId={examinerData.id}
                      />
                    </TabsContent>

                    <TabsContent value="actions">
                      <OfficeActions
                        applicationId={selectedApplication}
                        examinerId={examinerData.id}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No Application Selected
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select an application from the queue to start examination
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Reviews
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">12</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Under Examination
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">5</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Office Actions
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">3</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed Reviews
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">28</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 