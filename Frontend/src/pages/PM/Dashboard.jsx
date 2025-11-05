import { useState, useEffect } from "react";
import { getManagerDashboard } from "../../services/dashboard.service";

export default function PMDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getManagerDashboard();
        console.log('Manager dashboard data:', response);
        setDashboardData(response); // Remove .data as the service already returns the data
        setLoading(false);
      } catch (error) {
        console.error('Error fetching manager dashboard:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Data untuk statistik cards
  const stats = dashboardData?.data ? [
    { 
      title: "Total Projects", 
      value: dashboardData.data.statistics.totalProjects || 0,
      subtitle: "Projects" 
    },
    { 
      title: "Projects Complete", 
      value: dashboardData.data.statistics.projectsComplete || 0, 
      subtitle: "Projects" 
    },
    { 
      title: "Projects On Going", 
      value: dashboardData.data.statistics.projectsOnGoing || 0, 
      subtitle: "Projects" 
    },
  ] : [];

  // Data untuk team status
  const teamMembers = dashboardData?.data ? (dashboardData.data.team || []).map(member => ({
      name: member.name,
      position: member.position?.name || '-',
      email: member.email,
      projects: member.projectCount || 0,
      // generate initials like HR dashboard employee list (all initials)
      avatar: (member.name || '').split(' ').map(n => n[0] || '').join('').toUpperCase()
  })) : [];  const getProjectColor = (projects) => {
    if (projects === 0) return "bg-green-100 text-green-800";
    if (projects >= 7) return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
              {stat.change && (
                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-600">
                  {stat.change}
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Team Status Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Team Status</h3>
          <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 border rounded-lg hover:bg-gray-50" style={{ color: '#2C3F48' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter & Short
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Employee Name</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Position</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Project Count</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                        {member.avatar}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{member.email}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{member.position}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-4 py-1.5 rounded-lg text-sm font-semibold ${getProjectColor(member.projects)}`}>
                      {member.projects} Projects
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}