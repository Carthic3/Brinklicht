import { useState } from 'react';
import { ArrowLeft, Filter, RefreshCw, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    dateRange: 'last-30-days',
    estimator: 'all',
    status: 'all'
  });

  // Sample data for the dashboard
  const kpiData = {
    totalOpenQuotes: 23,
    potentialValue: 487650,
    avgTurnaround: 3.2,
    winRate: 68
  };

  const quoteRequests = [
    {
      id: 1,
      projectName: "Warehouse LED Retrofit",
      clientName: "TechCorp Industries",
      status: "New",
      deadline: "2025-01-20",
      potentialValue: 45250,
      assignedTo: "Marcus Weber",
      urgent: false
    },
    {
      id: 2,
      projectName: "Office Building Modernization",
      clientName: "BuildMax Solutions",
      status: "Assigned",
      deadline: "2025-01-15",
      potentialValue: 78900,
      assignedTo: "Sarah Klein",
      urgent: true
    },
    {
      id: 3,
      projectName: "Restaurant Chain Lighting",
      clientName: "Gastro Group",
      status: "Quoted",
      deadline: "2025-01-25",
      potentialValue: 32100,
      assignedTo: "Tom Mueller",
      urgent: false
    },
    {
      id: 4,
      projectName: "Hospital Emergency Wing",
      clientName: "MedCenter AG",
      status: "Won",
      deadline: "2025-01-18",
      potentialValue: 156700,
      assignedTo: "Anna Fischer",
      urgent: false
    },
    {
      id: 5,
      projectName: "Shopping Mall Renovation",
      clientName: "Retail Spaces Ltd",
      status: "New",
      deadline: "2025-01-22",
      potentialValue: 89400,
      assignedTo: "Marcus Weber",
      urgent: false
    },
    {
      id: 6,
      projectName: "Factory Floor Upgrade",
      clientName: "ManufacturingCo",
      status: "Assigned",
      deadline: "2025-01-16",
      potentialValue: 67200,
      assignedTo: "Sarah Klein",
      urgent: true
    },
    {
      id: 7,
      projectName: "Hotel Lobby Redesign",
      clientName: "Luxury Hotels",
      status: "Lost",
      deadline: "2025-01-14",
      potentialValue: 28500,
      assignedTo: "Tom Mueller",
      urgent: false
    },
    {
      id: 8,
      projectName: "School Classroom Lighting",
      clientName: "Education Board",
      status: "Quoted",
      deadline: "2025-01-28",
      potentialValue: 41300,
      assignedTo: "Anna Fischer",
      urgent: false
    }
  ];

  const estimatorWorkload = [
    { name: "Marcus Weber", quotes: 6 },
    { name: "Sarah Klein", quotes: 4 },
    { name: "Tom Mueller", quotes: 5 },
    { name: "Anna Fischer", quotes: 3 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Assigned': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Quoted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Won': return 'bg-green-100 text-green-800 border-green-200';
      case 'Lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isDeadlineUrgent = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Intake
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Brinklicht - Live Quote Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Last Refreshed: {new Date().toLocaleString('de-DE')}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filters.dateRange} onValueChange={(value) => setFilters({...filters, dateRange: value})}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.estimator} onValueChange={(value) => setFilters({...filters, estimator: value})}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estimator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Estimators</SelectItem>
                  <SelectItem value="marcus">Marcus Weber</SelectItem>
                  <SelectItem value="sarah">Sarah Klein</SelectItem>
                  <SelectItem value="tom">Tom Mueller</SelectItem>
                  <SelectItem value="anna">Anna Fischer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* KPI Scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Open Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{kpiData.totalOpenQuotes}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-success">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Potential Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(kpiData.potentialValue)}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-warning">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Turnaround</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{kpiData.avgTurnaround} Days</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{kpiData.winRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Operational Queue */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Incoming Quote Requests</CardTitle>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Potential Value</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Quote Sheet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quoteRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.projectName}</TableCell>
                    <TableCell>{request.clientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={isDeadlineUrgent(request.deadline) ? 'text-red-600 font-semibold' : ''}>
                        {formatDate(request.deadline)}
                        {isDeadlineUrgent(request.deadline) && ' ⚠️'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(request.potentialValue)}</TableCell>
                    <TableCell>{request.assignedTo}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Analytical Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estimator Workload */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Quotes by Estimator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estimatorWorkload.map((estimator, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{estimator.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(estimator.quotes / 8) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-6">{estimator.quotes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Conversion */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Pipeline Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">New (100%)</span>
                  <span className="text-sm font-semibold">34</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quoted (65%)</span>
                  <span className="text-sm font-semibold">22</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Won (43%)</span>
                  <span className="text-sm font-semibold">15</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '43%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Requests by Client Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm">Existing Clients</span>
                  </div>
                  <span className="text-sm font-semibold">72%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span className="text-sm">New Clients</span>
                  </div>
                  <span className="text-sm font-semibold">28%</span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-primary h-3 rounded-l-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;