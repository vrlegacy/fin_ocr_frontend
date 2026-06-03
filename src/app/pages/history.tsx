import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar } from '../components/sidebar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';
import { File, Search, Calendar, User, Eye, Hash, Trash2 } from 'lucide-react';

interface UploadRecord {
  id: number;
  fileName: string;
  patient: string;
  testName: string;
  testId: string;
  date: string;
  status: string;
}

export function HistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();

  // Updated mock data according to your requested schema as a React State
  const [uploads, setUploads] = useState<UploadRecord[]>([
    {
      id: 1,
      fileName: 'patient_form_01.pdf',
      patient: 'Darshan Kumar',
      testName: 'Type 2 Diabetes Screening',
      testId: 'TST-2026-001',
      date: '29 May 2026',
      status: 'Done',
    },
    {
      id: 2,
      fileName: 'medical_record_02.pdf',
      patient: 'Sarah Johnson',
      testName: 'Hypertension Panel',
      testId: 'TST-2026-002',
      date: '28 May 2026',
      status: 'Done',
    },
    {
      id: 3,
      fileName: 'lab_results_03.jpg',
      patient: 'Michael Chen',
      testName: 'Annual Lipid Profile',
      testId: 'TST-2026-003',
      date: '27 May 2026',
      status: 'Done',
    },
    {
      id: 4,
      fileName: 'prescription_form_04.pdf',
      patient: 'Emma Williams',
      testName: 'Migraine Assessment',
      testId: 'TST-2026-004',
      date: '26 May 2026',
      status: 'Done',
    },
    {
      id: 5,
      fileName: 'insurance_claim_05.pdf',
      patient: 'James Rodriguez',
      testName: 'Lumbar Spine Evaluation',
      testId: 'TST-2026-005',
      date: '25 May 2026',
      status: 'Done',
    },
    {
      id: 6,
      fileName: 'patient_intake_06.jpg',
      patient: 'Olivia Brown',
      testName: 'Asthma Severity Test',
      testId: 'TST-2026-006',
      date: '24 May 2026',
      status: 'Done',
    },
    {
      id: 7,
      fileName: 'test_results_07.pdf',
      patient: 'Robert Lee',
      testName: 'High Cholesterol Screening',
      testId: 'TST-2026-007',
      date: '23 May 2026',
      status: 'Done',
    },
    {
      id: 8,
      fileName: 'consent_form_08.pdf',
      patient: 'Sophia Martinez',
      testName: 'Allergy Skin Testing',
      testId: 'TST-2026-008',
      date: '22 May 2026',
      status: 'Done',
    },
  ]);

  const handleDeleteRecord = (id: number, testId: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
    toast.warning(`Deleted history record ${testId} successfully`);
  };

  // Filter uploads based on new schema search queries
  const filteredUploads = uploads.filter(
    (upload) =>
      upload.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      upload.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      upload.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      upload.testId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{ background: theme === 'dark' ? '#0F172A' : '#F8FAFC' }}
    >
      <Sidebar />

      {/* Main Content - Retained EXACT layout styles and margins */}
      <div className="flex-1 ml-64 p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1
            className="tracking-tight transition-colors"
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: theme === 'dark' ? '#F1F5F9' : '#0F172A',
              marginBottom: '8px'
            }}
          >
            Upload History
          </h1>
          <p
            className="transition-colors"
            style={{
              fontSize: '14px',
              color: theme === 'dark' ? '#94A3B8' : '#64748B'
            }}
          >
            Review processed medical documentation and verified data indexes.
          </p>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Search Bar */}
          <div
            className="lg:col-span-2 rounded-2xl p-4 border transition-all duration-300"
            style={{
              background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
              borderColor: theme === 'dark' ? '#334155' : 'rgba(226, 232, 240, 0.6)',
              boxShadow: theme === 'dark'
                ? '0 4px 20px -2px rgba(0, 0, 0, 0.3)'
                : '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors"
                style={{ color: theme === 'dark' ? '#64748B' : '#94A3B8' }}
              />
              <Input
                type="text"
                placeholder="Filter by file name, patient, test name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-0 rounded-xl focus-visible:ring-1 transition-all"
                style={{
                  background: theme === 'dark' ? '#0F172A' : '#F8FAFC',
                  fontSize: '14px',
                  color: theme === 'dark' ? '#F1F5F9' : '#0F172A',
                }}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div
            className="rounded-2xl p-4 flex items-center gap-3 border transition-all duration-300"
            style={{
              background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
              borderColor: theme === 'dark' ? '#334155' : 'rgba(226, 232, 240, 0.6)',
              boxShadow: theme === 'dark'
                ? '0 4px 20px -2px rgba(0, 0, 0, 0.3)'
                : '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all"
              style={{
                background: theme === 'dark' ? '#0F172A' : '#F8FAFC',
                color: theme === 'dark' ? '#94A3B8' : '#64748B',
                borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
              }}
            >
              <File size={20} />
            </div>
            <div>
              <div
                className="tracking-tight transition-colors"
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: theme === 'dark' ? '#F1F5F9' : '#0F172A',
                }}
              >
                {uploads.length}
              </div>
              <div
                className="transition-colors"
                style={{
                  fontSize: '13px',
                  color: theme === 'dark' ? '#94A3B8' : '#64748B',
                  fontWeight: '500',
                }}
              >
                Total Records
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-4 flex items-center gap-3 border transition-all duration-300"
            style={{
              background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
              borderColor: theme === 'dark' ? '#334155' : 'rgba(226, 232, 240, 0.6)',
              boxShadow: theme === 'dark'
                ? '0 4px 20px -2px rgba(0, 0, 0, 0.3)'
                : '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all"
              style={{
                background: theme === 'dark' ? '#0F172A' : '#F8FAFC',
                color: theme === 'dark' ? '#94A3B8' : '#64748B',
                borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
              }}
            >
              <User size={20} />
            </div>
            <div>
              <div
                className="tracking-tight transition-colors"
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: theme === 'dark' ? '#F1F5F9' : '#0F172A',
                }}
              >
                {uploads.length}
              </div>
              <div
                className="transition-colors"
                style={{
                  fontSize: '13px',
                  color: theme === 'dark' ? '#94A3B8' : '#64748B',
                  fontWeight: '500',
                }}
              >
                Patients Indexed
              </div>
            </div>
          </div>
        </div>

        {/* Upload History Table */}
        <div
          className="rounded-3xl p-4 md:p-8 border transition-all duration-300"
          style={{
            background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
            borderColor: theme === 'dark' ? '#334155' : 'rgba(226, 232, 240, 0.6)',
            boxShadow: theme === 'dark'
              ? '0 10px 30px rgba(0, 0, 0, 0.3)'
              : '0 10px 30px rgba(0, 0, 0, 0.03)',
          }}
        >
          <h2
            className="mb-6 tracking-tight transition-colors"
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: theme === 'dark' ? '#F1F5F9' : '#0F172A',
            }}
          >
            All Uploads ({filteredUploads.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="transition-colors"
                  style={{ borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0' }}
                >
                  <th
                    className="text-left pb-4 px-4 transition-colors"
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: theme === 'dark' ? '#64748B' : '#94A3B8',
                      textTransform: 'uppercase'
                    }}
                  >
                    ID
                  </th>
                  <th
                    className="text-left pb-4 px-4 transition-colors"
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: theme === 'dark' ? '#64748B' : '#94A3B8',
                      textTransform: 'uppercase'

                    }}
                  >
                    Patient
                  </th>
                  <th
                    className="text-left pb-4 px-4 transition-colors"
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: theme === 'dark' ? '#64748B' : '#94A3B8',
                      textTransform: 'uppercase'
                    }}
                  >
                    Test Name
                  </th>
                  <th
                    className="text-left pb-4 px-4 transition-colors"
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: theme === 'dark' ? '#64748B' : '#94A3B8',
                      textTransform: 'uppercase'
                    }}
                  >
                    Test ID
                  </th>
                  <th
                    className="text-left pb-4 px-4 transition-colors"
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: theme === 'dark' ? '#64748B' : '#94A3B8',
                      textTransform: 'uppercase'
                    }}
                  >
                    Date
                  </th>
                  <th
                    className="text-left pb-4 px-4 transition-colors"
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: theme === 'dark' ? '#64748B' : '#94A3B8',
                      textTransform: 'uppercase'
                    }}
                  >
                    Status
                  </th>
                  <th
                    className="text-left pb-4 px-4 transition-colors"
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: theme === 'dark' ? '#64748B' : '#94A3B8',
                      textTransform: 'uppercase'
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: theme === 'dark' ? '#334155' : '#F1F5F9' }}>
                {filteredUploads.map((upload) => (
                  <tr
                    key={upload.id}
                    className="transition-colors"
                    style={{
                      background: theme === 'dark' ? (upload.id % 2 === 0 ? '#1E293B' : 'transparent') : 'transparent',
                    }}
                  >
                    {/* ID Column */}
                    <td className="py-4 px-4">
                      <span
                        className="transition-colors"
                        style={{
                          fontSize: '14px',
                          color: theme === 'dark' ? '#94A3B8' : '#64748B',
                          fontWeight: '500',
                        }}
                      >
                        #{upload.id}
                      </span>
                    </td>

                    {/* Patient Column */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User
                          size={14}
                          className="transition-colors"
                          style={{ color: theme === 'dark' ? '#64748B' : '#94A3B8' }}
                        />
                        <span
                          className="transition-colors"
                          style={{
                            fontSize: '14px',
                            color: theme === 'dark' ? '#CBD5E1' : '#334155',
                            fontWeight: '500',
                          }}
                        >
                          {upload.patient}
                        </span>
                      </div>
                    </td>

                    {/* Test Name Column */}
                    <td className="py-4 px-4">
                      <div
                        className="transition-colors"
                        style={{
                          fontSize: '14px',
                          color: theme === 'dark' ? '#94A3B8' : '#475569',
                        }}
                      >
                        {upload.testName}
                      </div>
                    </td>

                    {/* Test ID Column */}
                    <td className="py-4 px-4">
                      <div
                        className="flex items-center gap-1.5 transition-colors"
                        style={{
                          fontSize: '14px',
                          color: theme === 'dark' ? '#94A3B8' : '#64748B',
                        }}
                      >
                        <Hash
                          size={13}
                          className="transition-colors"
                          style={{ color: theme === 'dark' ? '#64748B' : '#94A3B8' }}
                        />
                        <span>{upload.testId}</span>
                      </div>
                    </td>

                    {/* Date Column */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar
                          size={14}
                          className="transition-colors"
                          style={{ color: theme === 'dark' ? '#64748B' : '#94A3B8' }}
                        />
                        <span
                          className="transition-colors"
                          style={{
                            fontSize: '14px',
                            color: theme === 'dark' ? '#94A3B8' : '#64748B',
                          }}
                        >
                          {upload.date}
                        </span>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="py-4 px-4">
                      <Badge
                        className="rounded-md px-2.5 py-1 font-medium border border-emerald-200/60 shadow-none pointer-events-none"
                        style={{ background: '#F0FDF4', color: '#166534', fontSize: '12px' }}
                      >
                        {upload.status}
                      </Badge>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => navigate(`/result/${upload.id}`)}
                          variant="outline"
                          className="h-9 px-3 rounded-xl flex items-center gap-2 transition-all shadow-none cursor-pointer"
                          style={{
                            fontSize: '13px',
                            background: theme === 'dark' ? '#10B981' : '#FFFFFF',
                            borderColor: theme === 'dark' ? '#10B981' : '#E2E8F0',
                            color: theme === 'dark' ? '#FFFFFF' : '#64748B',
                          }}
                        >
                          <Eye size={14} />
                          View
                        </Button>
                        <Button
                          onClick={() => handleDeleteRecord(upload.id, upload.testId)}
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUploads.length === 0 && (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border transition-all"
                  style={{
                    background: theme === 'dark' ? '#0F172A' : '#F8FAFC',
                    borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
                  }}
                >
                  <Search
                    size={24}
                    className="transition-colors"
                    style={{ color: theme === 'dark' ? '#64748B' : '#94A3B8' }}
                  />
                </div>
                <p
                  className="transition-colors"
                  style={{
                    fontSize: '15px',
                    color: theme === 'dark' ? '#94A3B8' : '#64748B',
                    fontWeight: '500',
                  }}
                >
                  No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}