import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Home, MapPin, Calendar } from 'lucide-react';

export function MarketIntelligence() {
  const [selectedCity, setSelectedCity] = useState('austin');
  const [selectedTimeframe, setSelectedTimeframe] = useState('12months');

  const priceData = {
    austin: [
      { month: 'Nov 24', price: 485000, sales: 245 },
      { month: 'Dec 24', price: 492000, sales: 198 },
      { month: 'Jan 25', price: 498000, sales: 312 },
      { month: 'Feb 25', price: 505000, sales: 289 },
      { month: 'Mar 25', price: 512000, sales: 367 },
      { month: 'Apr 25', price: 518000, sales: 401 },
      { month: 'May 25', price: 525000, sales: 445 },
      { month: 'Jun 25', price: 532000, sales: 478 },
      { month: 'Jul 25', price: 538000, sales: 423 },
      { month: 'Aug 25', price: 545000, sales: 456 },
      { month: 'Sep 25', price: 551000, sales: 489 },
      { month: 'Oct 25', price: 558000, sales: 412 }
    ],
    seattle: [
      { month: 'Nov 24', price: 725000, sales: 189 },
      { month: 'Dec 24', price: 732000, sales: 145 },
      { month: 'Jan 25', price: 738000, sales: 234 },
      { month: 'Feb 25', price: 745000, sales: 267 },
      { month: 'Mar 25', price: 751000, sales: 298 },
      { month: 'Apr 25', price: 758000, sales: 334 },
      { month: 'May 25', price: 765000, sales: 367 },
      { month: 'Jun 25', price: 771000, sales: 389 },
      { month: 'Jul 25', price: 778000, sales: 356 },
      { month: 'Aug 25', price: 785000, sales: 378 },
      { month: 'Sep 25', price: 791000, sales: 401 },
      { month: 'Oct 25', price: 798000, sales: 367 }
    ],
    portland: [
      { month: 'Nov 24', price: 545000, sales: 156 },
      { month: 'Dec 24', price: 548000, sales: 123 },
      { month: 'Jan 25', price: 552000, sales: 198 },
      { month: 'Feb 25', price: 555000, sales: 212 },
      { month: 'Mar 25', price: 559000, sales: 245 },
      { month: 'Apr 25', price: 562000, sales: 267 },
      { month: 'May 25', price: 566000, sales: 289 },
      { month: 'Jun 25', price: 570000, sales: 301 },
      { month: 'Jul 25', price: 573000, sales: 278 },
      { month: 'Aug 25', price: 577000, sales: 298 },
      { month: 'Sep 25', price: 581000, sales: 312 },
      { month: 'Oct 25', price: 585000, sales: 289 }
    ]
  };

  const investmentData = [
    { neighborhood: 'Downtown', growth: 8.5, rentalYield: 4.2, score: 92 },
    { neighborhood: 'East Side', growth: 12.3, rentalYield: 5.8, score: 95 },
    { neighborhood: 'North Hills', growth: 6.7, rentalYield: 3.9, score: 85 },
    { neighborhood: 'South Point', growth: 9.8, rentalYield: 4.7, score: 89 },
    { neighborhood: 'West End', growth: 7.2, rentalYield: 4.1, score: 87 }
  ];

  const currentData = priceData[selectedCity as keyof typeof priceData];
  const latestPrice = currentData[currentData.length - 1].price;
  const previousPrice = currentData[currentData.length - 2].price;
  const priceChange = ((latestPrice - previousPrice) / previousPrice) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1>Market Intelligence</h1>
          <p className="text-gray-600">Data-driven insights for smarter real estate decisions</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="austin">Austin, TX</SelectItem>
              <SelectItem value="seattle">Seattle, WA</SelectItem>
              <SelectItem value="portland">Portland, OR</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="24months">Last 24 Months</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Median Price</p>
                  <h3>${(latestPrice / 1000).toFixed(0)}K</h3>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Month Change</p>
                  <h3 className={priceChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
                  </h3>
                </div>
                {priceChange >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Properties Sold</p>
                  <h3>{currentData[currentData.length - 1].sales}</h3>
                </div>
                <Home className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Market Status</p>
                  <Badge variant="default">Seller's Market</Badge>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trends">Price Trends</TabsTrigger>
            <TabsTrigger value="investment">Investment Potential</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Price Trends</CardTitle>
                <CardDescription>
                  Historical median home prices in {selectedCity === 'austin' ? 'Austin, TX' : selectedCity === 'seattle' ? 'Seattle, WA' : 'Portland, OR'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={currentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Median Price"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Sales Volume</CardTitle>
                <CardDescription>Number of properties sold per month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8b5cf6" name="Properties Sold" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investment">
            <Card>
              <CardHeader>
                <CardTitle>Investment Potential by Neighborhood</CardTitle>
                <CardDescription>Growth rate, rental yield, and investment score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investmentData.map((area) => (
                    <Card key={area.neighborhood} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          <span>{area.neighborhood}</span>
                        </div>
                        <Badge 
                          variant={area.score >= 90 ? 'default' : 'secondary'}
                        >
                          Score: {area.score}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Annual Growth</p>
                          <p className="text-green-600">+{area.growth}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Rental Yield</p>
                          <p className="text-blue-600">{area.rentalYield}%</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast">
            <Card>
              <CardHeader>
                <CardTitle>Price Forecast</CardTitle>
                <CardDescription>Projected market trends for the next 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3 mb-4">
                      <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h3>Market Outlook: Positive</h3>
                        <p className="text-gray-600 mt-2">
                          Based on current trends and economic indicators, we forecast continued growth in the {selectedCity === 'austin' ? 'Austin' : selectedCity === 'seattle' ? 'Seattle' : 'Portland'} real estate market.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-600 mb-1">3 Month Forecast</p>
                        <p className="text-green-600">+2.5%</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Expected: ${((latestPrice * 1.025) / 1000).toFixed(0)}K
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-600 mb-1">6 Month Forecast</p>
                        <p className="text-green-600">+4.8%</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Expected: ${((latestPrice * 1.048) / 1000).toFixed(0)}K
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-600 mb-1">12 Month Forecast</p>
                        <p className="text-green-600">+8.2%</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Expected: ${((latestPrice * 1.082) / 1000).toFixed(0)}K
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6">
                      <p className="text-sm">
                        <span>⚠️ Disclaimer:</span> Forecasts are based on historical data and market analysis. Actual results may vary due to economic conditions, policy changes, and other factors.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
