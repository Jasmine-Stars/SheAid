import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Story {
  name: string;
  age: number;
  location: string;
  story: string;
}

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  funds: string;
}

interface RegionData {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  beneficiaries: number;
  path: string;
  countries: string[];
  projects: ProjectStats;
  stories: Story[];
}

const regionData: RegionData[] = [
  {
    id: 'asia',
    name: '亚洲',
    coordinates: { x: 600, y: 240 },
    beneficiaries: 1523,
    path: 'M500,180 L520,160 L560,150 L600,140 L650,145 L700,160 L730,180 L750,210 L760,250 L750,290 L720,320 L680,340 L650,350 L620,355 L590,350 L560,340 L540,320 L520,300 L510,280 L500,260 L495,240 L490,220 L485,200 Z',
    countries: ['中国', '印度', '日本', '韩国', '东南亚各国'],
    projects: {
      total: 45,
      active: 28,
      completed: 17,
      funds: '125.8 ETH'
    },
    stories: [
      {
        name: '小美',
        age: 28,
        location: '中国四川',
        story: '在地震中失去了家园，通过平台获得了重建资金和就业培训，现在经营着一家小店，生活逐渐好转。'
      },
      {
        name: 'Priya',
        age: 32,
        location: '印度新德里',
        story: '单亲妈妈，通过平台的教育资助项目，两个孩子得以继续上学，自己也参加了职业技能培训。'
      }
    ]
  },
  {
    id: 'europe',
    name: '欧洲',
    coordinates: { x: 420, y: 180 },
    beneficiaries: 892,
    path: 'M380,160 L400,150 L430,148 L460,155 L485,165 L495,180 L500,200 L495,220 L485,235 L470,245 L450,250 L425,248 L400,240 L380,225 L370,205 L365,185 Z',
    countries: ['德国', '法国', '英国', '意大利', '西班牙'],
    projects: {
      total: 32,
      active: 19,
      completed: 13,
      funds: '89.4 ETH'
    },
    stories: [
      {
        name: 'Anna',
        age: 35,
        location: '德国柏林',
        story: '遭遇家庭暴力后逃离，通过平台获得了紧急庇护所和法律援助，现在重新开始了独立生活。'
      },
      {
        name: 'Maria',
        age: 29,
        location: '西班牙马德里',
        story: '作为难民抵达欧洲，通过平台的语言培训和就业辅导项目，成功找到了稳定工作。'
      }
    ]
  },
  {
    id: 'africa',
    name: '非洲',
    coordinates: { x: 450, y: 320 },
    beneficiaries: 1245,
    path: 'M420,230 L440,220 L465,218 L485,225 L495,245 L500,270 L505,300 L510,330 L510,360 L505,390 L495,420 L480,445 L460,460 L435,465 L410,460 L390,445 L375,420 L365,390 L360,360 L360,330 L365,300 L375,270 L390,250 L405,235 Z',
    countries: ['肯尼亚', '南非', '尼日利亚', '埃塞俄比亚', '坦桑尼亚'],
    projects: {
      total: 58,
      active: 42,
      completed: 16,
      funds: '156.2 ETH'
    },
    stories: [
      {
        name: 'Amara',
        age: 26,
        location: '肯尼亚内罗毕',
        story: '因贫困辍学的女孩，通过平台获得了教育资助和创业培训，现在经营着一家手工艺品店。'
      },
      {
        name: 'Zara',
        age: 31,
        location: '南非开普敦',
        story: '单身母亲，通过医疗援助项目治愈了疾病，并获得了职业培训，现在能够自食其力。'
      }
    ]
  },
  {
    id: 'north-america',
    name: '北美洲',
    coordinates: { x: 180, y: 200 },
    beneficiaries: 678,
    path: 'M100,140 L130,130 L160,125 L190,128 L220,135 L250,145 L275,160 L290,180 L295,205 L290,230 L280,255 L265,275 L245,290 L220,295 L195,290 L170,275 L150,255 L135,230 L125,205 L120,180 L110,160 Z',
    countries: ['美国', '加拿大', '墨西哥'],
    projects: {
      total: 28,
      active: 16,
      completed: 12,
      funds: '78.6 ETH'
    },
    stories: [
      {
        name: 'Sarah',
        age: 30,
        location: '美国纽约',
        story: '无家可归的单亲妈妈，通过紧急住房援助项目找到了稳定住所，并参加了就业培训计划。'
      },
      {
        name: 'Rosa',
        age: 27,
        location: '墨西哥墨西哥城',
        story: '移民工人，通过法律援助和权益保护项目，成功维护了自己的合法权益。'
      }
    ]
  },
  {
    id: 'south-america',
    name: '南美洲',
    coordinates: { x: 240, y: 370 },
    beneficiaries: 534,
    path: 'M220,310 L240,305 L260,308 L275,318 L285,335 L290,360 L290,385 L285,410 L275,435 L260,455 L240,465 L220,468 L200,462 L185,448 L175,428 L170,405 L170,380 L175,355 L185,335 L200,320 Z',
    countries: ['巴西', '阿根廷', '智利', '哥伦比亚', '秘鲁'],
    projects: {
      total: 24,
      active: 15,
      completed: 9,
      funds: '62.3 ETH'
    },
    stories: [
      {
        name: 'Lucia',
        age: 33,
        location: '巴西圣保罗',
        story: '贫民窟居民，通过教育资助项目完成了护理培训，现在在医院工作，改变了家庭命运。'
      },
      {
        name: 'Carmen',
        age: 29,
        location: '阿根廷布宜诺斯艾利斯',
        story: '家庭暴力幸存者，通过心理辅导和经济援助项目，重建了自信和独立生活。'
      }
    ]
  },
  {
    id: 'oceania',
    name: '大洋洲',
    coordinates: { x: 700, y: 390 },
    beneficiaries: 239,
    path: 'M650,370 L680,365 L710,368 L735,378 L750,395 L755,415 L750,435 L735,450 L710,458 L680,460 L655,455 L635,442 L625,422 L623,400 L630,382 Z',
    countries: ['澳大利亚', '新西兰', '太平洋岛国'],
    projects: {
      total: 12,
      active: 8,
      completed: 4,
      funds: '34.7 ETH'
    },
    stories: [
      {
        name: 'Emma',
        age: 34,
        location: '澳大利亚悉尼',
        story: '原住民女性，通过文化保护和经济发展项目，创办了传统手工艺合作社。'
      },
      {
        name: 'Moana',
        age: 28,
        location: '新西兰奥克兰',
        story: '单亲妈妈，通过儿童照护和就业支持项目，实现了工作和育儿的平衡。'
      }
    ]
  },
];

const EnhancedImpactMap = () => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-accent/5 via-background to-accent/10 rounded-xl overflow-hidden border border-border/50">
      {/* SVG Map */}
      <svg
        viewBox="0 0 800 500"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
      >
        {/* Grid background */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.1"
            />
          </pattern>
          <linearGradient id="regionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <rect width="800" height="500" fill="url(#grid)" />

        {/* Regions */}
        {regionData.map((region) => {
          const isHovered = hoveredRegion?.id === region.id;
          const isSelected = selectedRegion?.id === region.id;
          return (
            <g key={region.id}>
              {/* Region path */}
              <path
                d={region.path}
                fill={isSelected ? 'hsl(var(--primary) / 0.3)' : isHovered ? 'url(#regionGradient)' : 'hsl(var(--muted))'}
                stroke={isSelected || isHovered ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                strokeWidth={isSelected ? '4' : isHovered ? '3' : '1.5'}
                className="transition-all duration-300 cursor-pointer"
                style={{
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: `${region.coordinates.x}px ${region.coordinates.y}px`,
                  filter: isSelected 
                    ? 'drop-shadow(0 0 30px hsl(var(--primary) / 0.8))'
                    : isHovered
                    ? 'drop-shadow(0 0 20px hsl(var(--primary) / 0.6))'
                    : 'none',
                }}
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => setSelectedRegion(region)}
              />

              {/* Marker pulse effect */}
              <circle
                cx={region.coordinates.x}
                cy={region.coordinates.y}
                r="8"
                fill="hsl(var(--primary))"
                className={isHovered ? 'animate-ping' : ''}
                opacity={isHovered ? '0.6' : '0.4'}
              />
              <circle
                cx={region.coordinates.x}
                cy={region.coordinates.y}
                r="5"
                fill="hsl(var(--primary))"
              />
            </g>
          );
        })}

        {/* Connection lines */}
        <g opacity="0.15">
          {regionData.slice(0, -1).map((region, i) => {
            const nextRegion = regionData[i + 1];
            return (
              <line
                key={`line-${i}`}
                x1={region.coordinates.x}
                y1={region.coordinates.y}
                x2={nextRegion.coordinates.x}
                y2={nextRegion.coordinates.y}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            );
          })}
        </g>
      </svg>

      {/* Global stats overlay */}
      <div className="absolute top-4 left-4 space-y-2 pointer-events-none">
        <Card className="p-4 bg-background/90 backdrop-blur-sm pointer-events-auto">
          <div className="text-sm font-semibold mb-2">全球受助统计</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">总受助人数:</span>
              <span className="font-bold text-primary">
                {regionData.reduce((sum, r) => sum + r.beneficiaries, 0)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">覆盖地区:</span>
              <span className="font-bold">{regionData.length}</span>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-background/90 backdrop-blur-sm pointer-events-auto">
          <div className="text-xs text-muted-foreground">
            💡 悬停在地区上查看详情
          </div>
        </Card>
      </div>

      {/* Hovered region details */}
      {hoveredRegion && !selectedRegion && (
        <div className="absolute bottom-4 right-4 w-64 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="p-4 bg-background/95 backdrop-blur-sm border-primary/50">
            <h3 className="font-bold text-lg mb-1">{hoveredRegion.name}</h3>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  {hoveredRegion.beneficiaries}
                </span>
                <span className="text-sm text-muted-foreground">位受助者</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                点击查看详细信息
              </div>
              <div className="h-1 bg-gradient-primary rounded-full animate-pulse" />
            </div>
          </Card>
        </div>
      )}

      {/* Selected region detailed panel */}
      {selectedRegion && (
        <div className="absolute inset-4 animate-in fade-in zoom-in-95 duration-300">
          <Card className="h-full bg-background/98 backdrop-blur-sm border-primary/50 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedRegion.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedRegion.countries.map((country) => (
                    <span key={country} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRegion(null)}
                className="shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-3">📊 项目统计</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 bg-accent/50">
                    <div className="text-sm text-muted-foreground">总受助人数</div>
                    <div className="text-2xl font-bold text-primary mt-1">
                      {selectedRegion.beneficiaries}
                    </div>
                  </Card>
                  <Card className="p-4 bg-accent/50">
                    <div className="text-sm text-muted-foreground">总项目数</div>
                    <div className="text-2xl font-bold mt-1">
                      {selectedRegion.projects.total}
                    </div>
                  </Card>
                  <Card className="p-4 bg-accent/50">
                    <div className="text-sm text-muted-foreground">进行中</div>
                    <div className="text-2xl font-bold text-green-500 mt-1">
                      {selectedRegion.projects.active}
                    </div>
                  </Card>
                  <Card className="p-4 bg-accent/50">
                    <div className="text-sm text-muted-foreground">已完成</div>
                    <div className="text-2xl font-bold text-blue-500 mt-1">
                      {selectedRegion.projects.completed}
                    </div>
                  </Card>
                </div>
                <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground">累计捐助资金:</span>
                    <span className="text-xl font-bold text-primary">
                      {selectedRegion.projects.funds}
                    </span>
                  </div>
                </Card>
              </div>

              {/* Success Stories */}
              <div>
                <h3 className="text-lg font-semibold mb-3">💝 受助者故事</h3>
                <div className="space-y-4">
                  {selectedRegion.stories.map((story, index) => (
                    <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold shrink-0">
                          {story.name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{story.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {story.age}岁
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {story.location}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {story.story}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Regional Issues */}
              <div>
                <h3 className="text-lg font-semibold mb-3">🎯 主要关注领域</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card className="p-3 bg-accent/30">
                    <div className="font-medium mb-1">教育支持</div>
                    <div className="text-xs text-muted-foreground">
                      为失学女童和妇女提供教育机会和职业培训
                    </div>
                  </Card>
                  <Card className="p-3 bg-accent/30">
                    <div className="font-medium mb-1">医疗援助</div>
                    <div className="text-xs text-muted-foreground">
                      提供基础医疗服务和卫生健康教育
                    </div>
                  </Card>
                  <Card className="p-3 bg-accent/30">
                    <div className="font-medium mb-1">经济赋能</div>
                    <div className="text-xs text-muted-foreground">
                      创业培训、小额贷款和就业机会支持
                    </div>
                  </Card>
                  <Card className="p-3 bg-accent/30">
                    <div className="font-medium mb-1">权益保护</div>
                    <div className="text-xs text-muted-foreground">
                      法律援助、反家暴庇护和心理辅导
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedImpactMap;
