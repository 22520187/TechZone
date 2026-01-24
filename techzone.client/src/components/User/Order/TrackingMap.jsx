import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { MapPin, Truck, Package, Clock, Phone, User, Car, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const truckIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="12" width="20" height="12" rx="2" fill="#3B82F6"/>
      <rect x="22" y="16" width="8" height="8" rx="2" fill="#3B82F6"/>
      <circle cx="8" cy="26" r="3" fill="#1F2937"/>
      <circle cx="24" cy="26" r="3" fill="#1F2937"/>
      <circle cx="8" cy="26" r="1.5" fill="white"/>
      <circle cx="24" cy="26" r="1.5" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const destinationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C11.6 2 8 5.6 8 10c0 6 8 18 8 18s8-12 8-18c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" fill="#EF4444"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const TrackingMap = ({ orderId, shippingAddress }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMapStyle, setSelectedMapStyle] = useState('standard');
  const [showStyleSelector, setShowStyleSelector] = useState(false);

  // Mock data cho tracking
  const mockTrackingData = {
    "ORD2510": {
      currentLocation: {
        lat: 10.7769,
        lng: 106.7009,
        address: "Kho TechZone, Quận 1, TP.HCM"
      },
      destination: {
        lat: 10.7829,
        lng: 106.7220,
        address: "456 Le Van C, Quan 2, TP.HCM"
      },
      route: [
        [10.7769, 106.7009],
        [10.7789, 106.7089],
        [10.7809, 106.7149],
        [10.7829, 106.7220]
      ],
      estimatedDelivery: "2 giờ",
      distance: "8.5 km",
      driverInfo: {
        name: "Nguyễn Văn Tài",
        phone: "0901234567",
        vehicle: "Xe máy - 59H1-12345",
        rating: 4.8
      },
      trackingPoints: [
        {
          time: "10:00",
          location: "Kho TechZone",
          status: "Đã lấy hàng",
          completed: true,
          description: "Tài xế đã nhận hàng từ kho"
        },
        {
          time: "10:30",
          location: "Đang di chuyển",
          status: "Trên đường giao hàng",
          completed: true,
          description: "Đang di chuyển theo tuyến đường tối ưu"
        },
        {
          time: "11:45",
          location: "Gần điểm giao hàng",
          status: "Sắp đến nơi",
          completed: false,
          description: "Dự kiến đến nơi trong 15 phút"
        },
        {
          time: "12:00",
          location: "Điểm giao hàng",
          status: "Giao hàng thành công",
          completed: false,
          description: "Hoàn thành giao hàng"
        }
      ]
    }
  };

  // Map styles configuration
  const mapStyles = {
    standard: {
      name: "Standard",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    light: {
      name: "Light",
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    dark: {
      name: "Dark",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    terrain: {
      name: "Terrain",
      url: "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png",
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a> &mdash; Data &copy; OpenStreetMap'
    },
    satellite: {
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: 'Tiles &copy; Esri'
    }
  };

  const currentStyle = mapStyles[selectedMapStyle];

  // Helper component to auto-fit bounds to the route
  const FitRouteBounds = ({ route }) => {
    const map = useMap();
    useEffect(() => {
      if (route && route.length >= 2) {
        const bounds = L.latLngBounds(route.map(([lat, lng]) => L.latLng(lat, lng)));
        map.fitBounds(bounds, { padding: [24, 24] });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route]);
    return null;
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Check if we have specific mock data for this orderId
      let data = mockTrackingData[orderId];
      
      // If not found, generate default tracking data for any order
      if (!data) {
        data = {
          currentLocation: {
            lat: 10.7769,
            lng: 106.7009,
            address: "Kho TechZone, Quận 1, TP.HCM"
          },
          destination: {
            lat: 10.7829,
            lng: 106.7220,
            address: shippingAddress || "Đang cập nhật địa chỉ giao hàng"
          },
          route: [
            [10.7769, 106.7009],
            [10.7789, 106.7089],
            [10.7809, 106.7149],
            [10.7829, 106.7220]
          ],
          estimatedDelivery: "2 giờ",
          distance: "8.5 km",
          driverInfo: {
            name: "Nguyễn Văn Tài",
            phone: "0901234567",
            vehicle: "Xe máy - 59H1-12345",
            rating: 4.8
          },
          trackingPoints: [
            {
              time: "10:00",
              location: "Kho TechZone",
              status: "Đã lấy hàng",
              completed: true,
              description: "Tài xế đã nhận hàng từ kho"
            },
            {
              time: "10:30",
              location: "Đang di chuyển",
              status: "Trên đường giao hàng",
              completed: true,
              description: "Đang di chuyển theo tuyến đường tối ưu"
            },
            {
              time: "11:45",
              location: "Gần điểm giao hàng",
              status: "Sắp đến nơi",
              completed: false,
              description: "Dự kiến đến nơi trong 15 phút"
            },
            {
              time: "12:00",
              location: "Điểm giao hàng",
              status: "Giao hàng thành công",
              completed: false,
              description: "Hoàn thành giao hàng"
            }
          ]
        };
      }
      
      setTrackingData(data);
      setLoading(false);
    }, 1000);
  }, [orderId, shippingAddress]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Đang tải thông tin vận chuyển...</span>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <MapPin size={48} className="mx-auto mb-2 text-gray-400" />
          <p>Không có thông tin theo dõi cho đơn hàng này</p>
        </div>
      </div>
    );
  }

  const center = [
    (trackingData.currentLocation.lat + trackingData.destination.lat) / 2,
    (trackingData.currentLocation.lng + trackingData.destination.lng) / 2
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Truck className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Theo dõi vận chuyển</h3>
              <p className="text-sm text-gray-500">Đơn hàng #{orderId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                <Clock size={14} className="mr-1" /> {trackingData.estimatedDelivery}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-medium">
                {trackingData.distance}
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowStyleSelector(!showStyleSelector)}
                className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Layers size={16} className="mr-2 text-gray-600" />
                <span className="text-sm text-gray-700">{currentStyle.name}</span>
              </button>
              {showStyleSelector && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                  {Object.entries(mapStyles).map(([key, style]) => (
                    <button
                      key={key}
                      onClick={() => { setSelectedMapStyle(key); setShowStyleSelector(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedMapStyle === key ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Map */}
        <div className="rounded-lg overflow-hidden mb-6 shadow-sm">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '360px', width: '100%' }}
            className="rounded-lg"
          >
            <TileLayer url={currentStyle.url} attribution={currentStyle.attribution} />
            <FitRouteBounds route={trackingData.route} />
            
            {/* Current location marker */}
            <Marker 
              position={[trackingData.currentLocation.lat, trackingData.currentLocation.lng]}
              icon={truckIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>Vị trí hiện tại</strong><br />
                  {trackingData.currentLocation.address}
                </div>
              </Popup>
            </Marker>

            {/* Destination marker */}
            <Marker 
              position={[trackingData.destination.lat, trackingData.destination.lng]}
              icon={destinationIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>Điểm đến</strong><br />
                  {trackingData.destination.address}
                </div>
              </Popup>
            </Marker>

            {/* Route */}
            <Polyline
              positions={trackingData.route}
              color="#3B82F6"
              weight={4}
              opacity={0.7}
              dashArray="10, 10"
            />
          </MapContainer>
        </div>

        {/* Driver Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <User className="text-blue-600" size={16} />
            </div>
            <h4 className="font-medium text-gray-800">Thông tin tài xế</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center">
              <User size={16} className="text-gray-500 mr-2" />
              <div>
                <span className="text-gray-600 block">Tài xế</span>
                <p className="font-medium">{trackingData.driverInfo.name}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Phone size={16} className="text-gray-500 mr-2" />
              <div>
                <span className="text-gray-600 block">Điện thoại</span>
                <p className="font-medium text-blue-600 cursor-pointer hover:underline">
                  {trackingData.driverInfo.phone}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Car size={16} className="text-gray-500 mr-2" />
              <div>
                <span className="text-gray-600 block">Phương tiện</span>
                <p className="font-medium">{trackingData.driverInfo.vehicle}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="text-yellow-500 mr-2">⭐</div>
              <div>
                <span className="text-gray-600 block">Đánh giá</span>
                <p className="font-medium">{trackingData.driverInfo.rating}/5.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div>
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <Package size={18} className="mr-2 text-gray-600" />
            Lịch trình vận chuyển
          </h4>
          
          <div className="space-y-4">
            {trackingData.trackingPoints.map((point, index) => (
              <div key={index} className="flex items-start">
                <div className="relative">
                  <div className={`w-4 h-4 rounded-full mt-1 mr-4 flex-shrink-0 border-2 ${
                    point.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {point.completed && (
                      <div className="w-2 h-2 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                    )}
                  </div>
                  {index < trackingData.trackingPoints.length - 1 && (
                    <div className={`absolute top-5 left-1.5 w-0.5 h-8 ${
                      point.completed ? 'bg-green-200' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
                
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-medium ${
                      point.completed ? 'text-gray-800' : 'text-gray-500'
                    }`}>
                      {point.status}
                    </p>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      point.completed 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {point.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{point.location}</p>
                  <p className="text-xs text-gray-500">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Actions
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Phone size={16} className="mr-2" />
              Gọi tài xế
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <MapPin size={16} className="mr-2" />
              Chia sẻ vị trí
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default TrackingMap;
