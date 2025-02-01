import React, { useEffect, useState } from 'react';
import { supabase, signOut } from '../lib/supabase';
import { StatCard } from '../components/StatCard';
import { Users, Code, Ticket, Music, Calendar, Share2, DoorOpen, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalRegistrations: number;
  passTypes: {
    General: number;
    Hackathon: number;
    Signature: number;
  };
  concertPayments: number;
  day4Events: {
    [key: string]: number;
  };
  referralSources: {
    [key: string]: number;
  };
  gateEntryCount: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    passTypes: { General: 0, Hackathon: 0, Signature: 0 },
    concertPayments: 0,
    day4Events: {},
    referralSources: {},
    gateEntryCount: 0
  });

  const handleSignOut = async () => {
    window.location.reload();
  };

  useEffect(() => {
async function fetchStats() {
  try {
    // Get total registrations
    const { count: totalRegistrations, error: totalError } = await supabase
      .from('Participants')
      .select('*', { count: 'exact' });

    if (totalError) throw totalError;

    // Get pass type distribution directly using SQL queries
    const { count: generalCount, error: generalError } = await supabase
      .from('Participants')
      .select('*', { count: 'exact' })
      .eq('Pass', 'General');

    if (generalError) throw generalError;

    const { count: hackathonCount, error: hackathonError } = await supabase
      .from('Participants')
      .select('*', { count: 'exact' })
      .eq('Pass', 'Hackathon');

    if (hackathonError) throw hackathonError;

    const { count: signatureCount, error: signatureError } = await supabase
      .from('Participants')
      .select('*', { count: 'exact' })
      .eq('Pass', 'Signature');

    if (signatureError) throw signatureError;

    // Format the pass types
    const passTypes = {
      General: generalCount || 0,
      Hackathon: hackathonCount || 0,
      Signature: signatureCount || 0,
    };

    return { totalRegistrations, passTypes };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { totalRegistrations: 0, passTypes: { General: 0, Hackathon: 0, Signature: 0 } };
  }
}


      // Get concert payments
     // const { count: concertPayments } = await supabase
       // .from('Participants')
        //.select('*', { count: 'exact' })
        //.eq('Concert_Payment', 'Successful') - passTypes[1];
      const { data: concertData, error } = supabase
        .from('Participants')
        .select('Pass') // Fetch only the Pass column to minimize payload
        .eq('Concert_Payment', 'Successful');
      const totalSuccessfulPayments = concertData?.length || 0;
      const concertPayments = totalSuccessfulPayments - passTypes.Hackathon;
      
      // Get Day 4 event counts with workshop breakdown
      const { data: day4Data } =  supabase
        .from('Participants')
        .select('Event_1_Day4');

      const day4Events: { [key: string]: number } = {};

day4Data?.forEach(participant => {
  const eventName = participant.Event_1_Day4;
  
  if (eventName && eventName.startsWith("W -")) {
    day4Events[eventName] = (day4Events[eventName] || 0) + 1;
  }
});


      // Get referral sources for successful payments, including null values as "Others"
      const { data: referralData } =  supabase
        .from('Participants')
        .select('Reference')
        .eq('Payment', 'Successful');

      const referralSources: { [key: string]: number } = {};
      referralData?.forEach(participant => {
        const reference = participant.Reference || 'Others';
        referralSources[reference] = (referralSources[reference] || 0) + 1;
      });

      // Gate entry count
      const { count: gateEntryCount } = supabase
        .from('Participants')
        .select('*', { count: 'exact' })
        .not('Entry_Time', 'is', null);

      setStats({
        totalRegistrations: totalRegistrations || 0,
        passTypes,
        concertPayments: concertPayments || 0,
        day4Events,
        referralSources,
        gateEntryCount: gateEntryCount || 0
      });
    }

    //fetchStats();
  }, []);

  const referralData = Object.entries(stats.referralSources)
    .map(([name, value]) => ({
      name,
      value
    }))
    .sort((a, b) => {
      if (a.name === 'Others') return 1;
      if (b.name === 'Others') return -1;
      return b.value - a.value;
    });

  const workshopData = Object.entries(stats.day4Events)
    .map(([name, value]) => ({
      name,
      value
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Registrations"
            value={stats.totalRegistrations}
            icon={<Users size={24} />}
          />
          <StatCard
            title="General Pass"
            value={stats.passTypes.General}
            icon={<Ticket size={24} />}
          />
          <StatCard
            title="Hackathon Pass"
            value={stats.passTypes.Hackathon}
            icon={<Code size={24} />}
          />
          <StatCard
            title="Signature Pass"
            value={stats.passTypes.Signature}
            icon={<Ticket size={24} />}
          />
          <StatCard
            title="Concert Registrations"
            value={stats.concertPayments}
            icon={<Music size={24} />}
          />
          <StatCard
            title="Total Day 4 Events"
            value={Object.values(stats.day4Events).reduce((a, b) => a + b, 0)}
            icon={<Calendar size={24} />}
          />
          <StatCard
            title="Successful Referrals"
            value={Object.values(stats.referralSources).reduce((a, b) => a + b, 0)}
            icon={<Share2 size={24} />}
          />
          <StatCard
            title="Gate Entries"
            value={stats.gateEntryCount}
            icon={<DoorOpen size={24} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Pass Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(stats.passTypes).map(([name, value]) => ({
                    name,
                    value,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Successful Payment Referral Sources</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={referralData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name} (${value}, ${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {referralData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Day 4 Workshop Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workshopData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
