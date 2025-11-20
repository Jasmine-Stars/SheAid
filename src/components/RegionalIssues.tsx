import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin } from "lucide-react";

interface IssueData {
  region: string;
  issue: string;
  percentage: number;
  count: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

const regionalIssues: IssueData[] = [
  { region: '华北地区', issue: '家暴救助', percentage: 35, count: 142, trend: 'down', color: 'bg-red-500' },
  { region: '华北地区', issue: '职业培训', percentage: 28, count: 114, trend: 'up', color: 'bg-blue-500' },
  { region: '华东地区', issue: '单亲妈妈支持', percentage: 42, count: 189, trend: 'up', color: 'bg-green-500' },
  { region: '华东地区', issue: '法律援助', percentage: 31, count: 139, trend: 'stable', color: 'bg-amber-500' },
  { region: '华南地区', issue: '教育支持', percentage: 38, count: 127, trend: 'up', color: 'bg-blue-500' },
  { region: '华南地区', issue: '创业孵化', percentage: 25, count: 84, trend: 'up', color: 'bg-green-500' },
  { region: '西南地区', issue: '农村女童教育', percentage: 45, count: 156, trend: 'stable', color: 'bg-blue-500' },
  { region: '西南地区', issue: '医疗救助', percentage: 33, count: 114, trend: 'down', color: 'bg-pink-500' },
  { region: '西北地区', issue: '职业培训', percentage: 40, count: 98, trend: 'up', color: 'bg-blue-500' },
  { region: '西北地区', issue: '心理咨询', percentage: 29, count: 71, trend: 'up', color: 'bg-purple-500' },
];

const RegionalIssues = () => {
  const regions = Array.from(new Set(regionalIssues.map(i => i.region)));

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-red-500';
    if (trend === 'down') return 'text-green-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">地区困难分析</h2>
        <p className="text-muted-foreground">
          不同地区女性面临的主要困难及其分布情况
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {regions.map((region) => {
          const issues = regionalIssues.filter(i => i.region === region);
          const totalCount = issues.reduce((sum, i) => sum + i.count, 0);
          
          return (
            <Card key={region} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {region}
                </CardTitle>
                <CardDescription>
                  累计受助 {totalCount} 人
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {issues.map((issue, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{issue.issue}</span>
                        <span className={`text-xs ${getTrendColor(issue.trend)}`}>
                          {getTrendIcon(issue.trend)}
                        </span>
                      </div>
                      <span className="text-muted-foreground">{issue.count} 人</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={issue.percentage} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {issue.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              最需关注
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">农村女童教育</div>
            <div className="text-sm text-muted-foreground mt-1">
              西南地区需求最高 (45%)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              增长最快
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">单亲妈妈支持</div>
            <div className="text-sm text-muted-foreground mt-1">
              华东地区需求上升 (42%)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              新兴需求
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">心理咨询</div>
            <div className="text-sm text-muted-foreground mt-1">
              各地区需求持续增加
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegionalIssues;
