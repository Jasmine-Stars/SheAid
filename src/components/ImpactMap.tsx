import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';

interface RegionData {
  name: string;
  coordinates: [number, number];
  beneficiaries: number;
  topIssues: { type: string; count: number; color: string }[];
  recentHelp: number;
}

const regionData: RegionData[] = [
  {
    name: '北京',
    coordinates: [116.4074, 39.9042],
    beneficiaries: 156,
    topIssues: [
      { type: '家暴救助', count: 45, color: '#ef4444' },
      { type: '职业培训', count: 38, color: '#3b82f6' },
      { type: '心理咨询', count: 32, color: '#8b5cf6' },
    ],
    recentHelp: 12,
  },
  {
    name: '上海',
    coordinates: [121.4737, 31.2304],
    beneficiaries: 203,
    topIssues: [
      { type: '单亲妈妈支持', count: 67, color: '#10b981' },
      { type: '法律援助', count: 52, color: '#f59e0b' },
      { type: '医疗救助', count: 41, color: '#ec4899' },
    ],
    recentHelp: 18,
  },
  {
    name: '广州',
    coordinates: [113.2644, 23.1291],
    beneficiaries: 134,
    topIssues: [
      { type: '教育支持', count: 48, color: '#3b82f6' },
      { type: '创业孵化', count: 35, color: '#10b981' },
      { type: '家暴救助', count: 28, color: '#ef4444' },
    ],
    recentHelp: 9,
  },
  {
    name: '成都',
    coordinates: [104.0668, 30.5728],
    beneficiaries: 98,
    topIssues: [
      { type: '农村女童教育', count: 42, color: '#3b82f6' },
      { type: '医疗救助', count: 31, color: '#ec4899' },
      { type: '心理咨询', count: 25, color: '#8b5cf6' },
    ],
    recentHelp: 7,
  },
  {
    name: '西安',
    coordinates: [108.9398, 34.3416],
    beneficiaries: 87,
    topIssues: [
      { type: '职业培训', count: 38, color: '#3b82f6' },
      { type: '法律援助', count: 29, color: '#f59e0b' },
      { type: '家暴救助', count: 20, color: '#ef4444' },
    ],
    recentHelp: 5,
  },
  {
    name: '杭州',
    coordinates: [120.1551, 30.2741],
    beneficiaries: 145,
    topIssues: [
      { type: '创业孵化', count: 52, color: '#10b981' },
      { type: '职业培训', count: 44, color: '#3b82f6' },
      { type: '单亲妈妈支持', count: 35, color: '#10b981' },
    ],
    recentHelp: 11,
  },
];

const ImpactMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      console.error('Mapbox token not found');
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [105, 35],
      zoom: 4,
      pitch: 45,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      // Add markers for each region
      regionData.forEach((region, index) => {
        const el = document.createElement('div');
        el.className = 'marker-pulse';
        el.style.cssText = `
          width: ${30 + region.beneficiaries / 10}px;
          height: ${30 + region.beneficiaries / 10}px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, rgba(236, 72, 153, 0.2) 70%);
          border-radius: 50%;
          border: 2px solid rgba(236, 72, 153, 1);
          cursor: pointer;
          position: relative;
          animation: pulse 2s ease-in-out infinite;
          animation-delay: ${index * 0.3}s;
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat(region.coordinates)
          .addTo(map.current!);

        el.addEventListener('click', () => {
          setSelectedRegion(region);
          map.current?.flyTo({
            center: region.coordinates,
            zoom: 8,
            duration: 1500,
          });
        });

        markersRef.current.push(marker);
      });

      // Add animated connections between regions
      const animateConnections = () => {
        const canvas = map.current?.getCanvas();
        if (!canvas) return;

        let progress = 0;
        const animate = () => {
          progress += 0.01;
          if (progress > 1) progress = 0;

          // Draw connections using canvas (simplified version)
          animationRef.current = requestAnimationFrame(animate);
        };
        animate();
      };

      animateConnections();
    });

    // Add pulse animation style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.3);
          opacity: 0.6;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
      style.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Info overlay */}
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
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">本周新增:</span>
              <span className="font-bold text-green-500">
                {regionData.reduce((sum, r) => sum + r.recentHelp, 0)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-background/90 backdrop-blur-sm pointer-events-auto">
          <div className="text-xs text-muted-foreground">
            💡 点击地图上的标记查看地区详情
          </div>
        </Card>
      </div>

      {/* Selected region details */}
      {selectedRegion && (
        <div className="absolute bottom-4 right-4 w-80">
          <Card className="p-4 bg-background/95 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">{selectedRegion.name}</h3>
                <p className="text-sm text-muted-foreground">
                  受助者: {selectedRegion.beneficiaries} 人
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedRegion(null);
                  map.current?.flyTo({
                    center: [105, 35],
                    zoom: 4,
                    duration: 1500,
                  });
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">主要困难类型</div>
              {selectedRegion.topIssues.map((issue) => (
                <div key={issue.type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{issue.type}</span>
                    <span className="font-semibold">{issue.count} 人</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(issue.count / selectedRegion.beneficiaries) * 100}%`,
                        backgroundColor: issue.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="text-xs text-muted-foreground">
                本周新增受助: <span className="font-semibold text-green-500">{selectedRegion.recentHelp} 人</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ImpactMap;
