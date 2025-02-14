import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import ApplicationQueue from '../../../components/examination/ApplicationQueue';
import ExaminationChecklist from '../../../components/examination/ExaminationChecklist';
import ExaminationNotes from '../../../components/examination/ExaminationNotes';
import OfficeActions from '../../../components/examination/OfficeActions';
import ExaminationDecision from '../../../components/examination/ExaminationDecision';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { CheckCircle, MessageSquare, FileText, Scale } from 'lucide-react';

export default function ApplicationReview() {
  const { id } = useParams();
  const [selectedApplication, setSelectedApplication] = useState<string | null>(id || null);
  const [examinerData, setExaminerData] = useState<{ id: string; name: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState('checklist');

  useEffect(() => {
    const fetchExaminerData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setExaminerData({
          id: user.id,
          name: user.email || 'Admin',
          role: 'admin'
        });
      }
    };

    fetchExaminerData();
  }, []);

  if (!examinerData) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and process trademark applications
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
                      <TabsTrigger
                        value="decision"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                      >
                        <Scale className="w-5 h-5 mr-2" />
                        Decision
                      </TabsTrigger>
                    </TabsList>
                  </div>

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

                  <TabsContent value="decision">
                    <ExaminationDecision
                      applicationId={selectedApplication}
                      examinerId={examinerData.id}
                    />
                  </TabsContent>
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
      </div>
    </div>
  );
} 