import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface RegionData {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  beneficiaries: number;
  path: string;
}

const regionData: RegionData[] = [
  {
    id: 'china',
    name: '中国',
    coordinates: { x: 650, y: 280 },
    beneficiaries: 823,
    path: 'M620,260 L680,260 L690,300 L670,340 L630,330 Z',
  },
  {
    id: 'india',
    name: '印度',
    coordinates: { x: 580, y: 320 },
    beneficiaries: 456,
    path: 'M560,310 L600,310 L595,350 L570,355 L555,340 Z',
  },
  {
    id: 'europe',
    name: '欧洲',
    coordinates: { x: 450, y: 220 },
    beneficiaries: 342,
    path: 'M420,200 L480,210 L475,250 L435,255 L415,235 Z',
  },
  {
    id: 'africa',
    name: '非洲',
    coordinates: { x: 450, y: 350 },
    beneficiaries: 567,
    path: 'M420,320 L480,325 L490,380 L460,410 L425,400 Z',
  },
  {
    id: 'north-america',
    name: '北美洲',
    coordinates: { x: 200, y: 220 },
    beneficiaries: 234,
    path: 'M150,180 L250,190 L260,250 L230,290 L180,280 Z',
  },
  {
    id: 'south-america',
    name: '南美洲',
    coordinates: { x: 280, y: 400 },
    beneficiaries: 189,
    path: 'M260,370 L310,375 L315,440 L285,460 L255,445 Z',
  },
];

const EnhancedImpactMap = () => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);

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
          return (
            <g key={region.id}>
              {/* Region path */}
              <path
                d={region.path}
                fill={isHovered ? 'url(#regionGradient)' : 'hsl(var(--muted))'}
                stroke={isHovered ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                strokeWidth={isHovered ? '3' : '1.5'}
                className="transition-all duration-300 cursor-pointer"
                style={{
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: `${region.coordinates.x}px ${region.coordinates.y}px`,
                  filter: isHovered
                    ? 'drop-shadow(0 0 20px hsl(var(--primary) / 0.6))'
                    : 'none',
                }}
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
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
      {hoveredRegion && (
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
              <div className="h-1 bg-gradient-primary rounded-full animate-pulse" />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedImpactMap;
