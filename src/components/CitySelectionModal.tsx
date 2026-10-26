import { MapPin } from 'lucide-react';
import type { City } from '../types';
interface CitySelectionModalProps {
    onSelect: (city: City) => void;
}
const CITIES: {
    city: City;
    description: string;
    cinemas: number;
}[] = [
    { city: 'Multan', description: 'City of Saints', cinemas: 2 },
    { city: 'Lahore', description: 'Heart of Pakistan', cinemas: 3 },
    { city: 'Karachi', description: 'City of Lights', cinemas: 3 },
];
export default function CitySelectionModal({ onSelect }: CitySelectionModalProps) {
    return (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/90 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-md animate-slideUp">
        
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 rounded-3xl blur-xl"/>

          <div className="relative bg-gray-900 border border-gray-700/50 rounded-2xl p-8 shadow-2xl shadow-black/50">
            
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 bg-amber-500/15 rounded-2xl flex items-center justify-center animate-pulseGlow">
                <MapPin size={32} className="text-amber-400"/>
              </div>
            </div>

            
            <h2 className="text-white text-2xl font-black text-center mb-2">
              Select Your City
            </h2>
            <p className="text-gray-400 text-sm text-center mb-8">
              Choose your city to see nearby cinemas and showtimes
            </p>

            
            <div className="space-y-3">
              {CITIES.map(({ city, description, cinemas }) => (<button key={city} onClick={() => onSelect(city)} className="w-full group flex items-center gap-4 p-4 rounded-xl border border-gray-700/50 bg-gray-800/40 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
                  <div className="w-12 h-12 bg-gray-800 group-hover:bg-amber-500/20 rounded-xl flex items-center justify-center transition-all duration-300">
                    <MapPin size={22} className="text-gray-400 group-hover:text-amber-400 transition-colors"/>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-bold text-lg group-hover:text-amber-400 transition-colors">
                      {city}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {description} · {cinemas} cinema{cinemas > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gray-800 group-hover:bg-amber-500 rounded-lg flex items-center justify-center transition-all duration-300">
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-950 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </button>))}
            </div>

            
            <p className="text-gray-600 text-xs text-center mt-6">
              You can change your city anytime from the navbar
            </p>
          </div>
        </div>
      </div>
    </div>);
}
