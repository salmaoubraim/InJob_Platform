import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useAuthModal } from '../../context/AuthModalContext';
import { Navigation, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import {
  MAP_CENTER,
  MAP_DEFAULT_ZOOM,
  MOROCCO_CITIES_GEO,
} from '../../utils/moroccoCitiesGeo';

function FlyToPosition({ position, zoom = 10 }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], zoom, { duration: 1.2 });
    }
  }, [position, zoom, map]);
  return null;
}

export default function MoroccoMap() {
  const { openRegister } = useAuthModal();
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const handleLocateMe = useCallback(() => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('La géolocalisation n\'est pas disponible sur ce navigateur.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSelected(null);
        setLocating(false);
      },
      () => {
        setGeoError('Autorisez l\'accès à votre position pour afficher l\'icône.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden auth-card border border-gray-100 bg-white">
      <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 bg-primary-soft/50">
        <p className="text-sm font-medium text-text-dark">
          Cliquez sur une ville ou trouvez votre position
        </p>
        <div className="flex items-center gap-2">
          {selected && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Voir tout le Maroc
            </button>
          )}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-text-dark text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-pulse' : ''}`} />
            {locating ? 'Localisation...' : 'Ma position'}
          </button>
        </div>
      </div>

      {geoError && (
        <p className="px-4 py-2 text-xs text-error bg-red-50 border-b border-red-100">
          {geoError}
        </p>
      )}

      <div className="h-[380px] sm:h-[420px] w-full relative z-0">
        <MapContainer
          center={[MAP_CENTER.lat, MAP_CENTER.lng]}
          zoom={MAP_DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
          style={{ minHeight: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToPosition position={selected} zoom={10} />
          <FlyToPosition position={userPosition} zoom={12} />

          {userPosition && (
            <CircleMarker
              center={[userPosition.lat, userPosition.lng]}
              radius={14}
              pathOptions={{
                color: '#FFFFFF',
                fillColor: '#06D6A0',
                fillOpacity: 1,
                weight: 4,
              }}
            >
              <Popup>
                <div className="text-center min-w-[120px] py-1">
                  <div className="flex justify-center mb-1">
                    <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-text-dark" />
                    </span>
                  </div>
                  <p className="font-bold text-text-dark">Vous êtes ici</p>
                  <p className="text-xs text-text-secondary mt-1">Votre position actuelle</p>
                </div>
              </Popup>
            </CircleMarker>
          )}

          {MOROCCO_CITIES_GEO.map((city) => {
            const isHq = city.name === 'Agadir';
            const isActive = selected?.name === city.name || hovered === city.name;
            return (
              <CircleMarker
                key={city.name}
                center={[city.lat, city.lng]}
                radius={isHq ? 14 : isActive ? 11 : 8}
                pathOptions={{
                  color: '#4361EE',
                  fillColor: isActive ? '#2D3FCC' : '#6B8CFF',
                  fillOpacity: 0.85,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => {
                    setSelected(city);
                    setUserPosition(null);
                  },
                  mouseover: () => setHovered(city.name),
                  mouseout: () => setHovered(null),
                }}
              >
                <Popup>
                  <div className="text-center min-w-[140px] py-1">
                    <p className="font-bold text-text-dark">{city.name}</p>
                    {isHq && (
                      <p className="text-xs font-semibold text-primary">Siège InJob</p>
                    )}
                    <p className="text-xs text-text-secondary mt-1">
                      Offres disponibles sur InJob
                    </p>
                    <button
                      type="button"
                      onClick={() => openRegister('candidat')}
                      className="inline-block mt-2 text-xs font-semibold text-primary hover:underline"
                    >
                      S&apos;inscrire →
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="px-4 py-2.5 bg-bg-page border-t border-gray-100 flex flex-wrap gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-accent border-2 border-white shadow-sm" />
          Ma position
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary-light" />
          Villes InJob
        </span>
      </div>

      {selected && (
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            Ville : <strong className="text-text-dark">{selected.name}</strong>
          </span>
          <button
            type="button"
            onClick={() => openRegister('candidat')}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Voir les offres
          </button>
        </div>
      )}
    </div>
  );
}
