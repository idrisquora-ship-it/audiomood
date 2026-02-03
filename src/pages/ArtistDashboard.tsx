import React from 'react';
import { BarChart3, TrendingUp, Users, PlayCircle, Music } from 'lucide-react';
import { mockSongs } from '@/data/mockData';
import { useUser } from '@/contexts/UserContext';
import { formatPlays } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SongCard from '@/components/music/SongCard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const ArtistDashboard: React.FC = () => {
  const { user } = useUser();

  // Mock artist stats
  const artistSongs = mockSongs.filter(s => s.artistId === 'artist-1');
  const totalStreams = artistSongs.reduce((sum, s) => sum + s.plays, 0);
  const monthlyListeners = Math.floor(totalStreams * 0.3);
  const followers = 12500;

  // Mock chart data
  const chartData = [
    { name: 'Mon', streams: 4200 },
    { name: 'Tue', streams: 5100 },
    { name: 'Wed', streams: 4800 },
    { name: 'Thu', streams: 6200 },
    { name: 'Fri', streams: 7500 },
    { name: 'Sat', streams: 8200 },
    { name: 'Sun', streams: 7100 },
  ];

  const stats = [
    {
      title: 'Total Streams',
      value: formatPlays(totalStreams),
      icon: PlayCircle,
      trend: '+12.5%',
      color: 'text-primary',
    },
    {
      title: 'Monthly Listeners',
      value: formatPlays(monthlyListeners),
      icon: Users,
      trend: '+8.2%',
      color: 'text-accent',
    },
    {
      title: 'Followers',
      value: formatPlays(followers),
      icon: TrendingUp,
      trend: '+5.1%',
      color: 'text-green-500',
    },
    {
      title: 'Tracks',
      value: artistSongs.length.toString(),
      icon: Music,
      trend: '+2',
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Artist Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.displayName}. Here's your music performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-500">{stat.trend} this month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2 mb-8">
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Streams Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="fill-muted-foreground" />
                <YAxis className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(240, 10%, 8%)',
                    border: '1px solid hsl(240, 10%, 16%)',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="streams"
                  stroke="hsl(263, 70%, 58%)"
                  fillOpacity={1}
                  fill="url(#colorStreams)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Top Songs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {mockSongs.slice(0, 5).map((song, index) => (
                <div key={song.id} className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <SongCard song={song} variant="row" showPlays />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Uploads */}
      <Card className="bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mockSongs.slice(0, 4).map(song => (
              <SongCard key={song.id} song={song} showArtist={false} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArtistDashboard;
