import { Clock, Star, CalendarDays, Ticket, MapPin } from 'lucide-react';
import type { Movie, City } from '../types';
import { getCitiesShowingMovie } from '../lib/storage';
import { useState, useEffect } from 'react';

interface MovieCardProps {
    movie: Movie;
    onBook: (movie: Movie) => void;
    isLoggedIn: boolean;
    canBook?: boolean;
}

export default function MovieCard({ movie, onBook, isLoggedIn, canBook = true }: MovieCardProps) {
    const [cities, setCities] = useState<City[]>([]);

    useEffect(() => {
        getCitiesShowingMovie(movie.id).then(setCities).catch(console.error);
    }, [movie.id]);

    const releaseDate = new Date(movie.releaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-amber-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col hover:-translate-y-1">
            <div className="relative overflow-hidden aspect-[2/3]">
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-gray-950/80 backdrop-blur-sm text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-500/30">
                        {movie.rating}
                    </span>
                </div>

                {cities.length > 0 && (
                    <div className="absolute top-3 right-3">
                        <span className="bg-gray-950/80 backdrop-blur-sm text-gray-300 text-xs font-medium px-2 py-1 rounded-lg border border-gray-600/30 flex items-center gap-1">
                            <MapPin size={10} className="text-amber-400" />
                            {cities.length} {cities.length === 1 ? 'city' : 'cities'}
                        </span>
                    </div>
                )}

                <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-lg leading-tight drop-shadow-lg">{movie.title}</p>
                    <p className="text-amber-400 text-sm font-medium mt-0.5">{movie.genre}</p>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1 gap-3">
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{movie.description}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <Clock size={12} className="text-gray-600" />
                        {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                    </span>
                    <span className="flex items-center gap-1">
                        <CalendarDays size={12} className="text-gray-600" />
                        {releaseDate}
                    </span>
                    <span className="flex items-center gap-1">
                        <Star size={12} className="text-gray-600" />
                        {movie.director}
                    </span>
                </div>

                <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-800/50">
                    <div>
                        <p className="text-gray-500 text-xs">Price per seat</p>
                        <p className="text-white font-bold text-lg">PKR {movie.price.toLocaleString()}</p>
                    </div>
                    {canBook !== false ? (
                        <button onClick={() => onBook(movie)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-gray-950 font-bold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25">
                            <Ticket size={15} />
                            {isLoggedIn ? 'Book Now' : 'Sign in to Book'}
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
