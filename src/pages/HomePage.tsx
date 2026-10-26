import { useState, useEffect, useMemo } from 'react';
import bg from '../assets/bg.jpg';
import bg2 from '../assets/bg2.jpg';
import bg3 from '../assets/bg3.jpeg';
import bg4 from '../assets/bg4.jpg';
import { Search, SlidersHorizontal, MapPin, ChevronRight, Clock, Calendar } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import BookingModal from '../components/BookingModal';
import { getMovies, getCinemas, getAllCities, getSchedules } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import type { Movie, Cinema, City, CinemaSchedule } from '../types';

interface HomePageProps {
    onNavigate: (view: 'home' | 'auth' | 'dashboard' | 'admin') => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [movies, setMovies] = useState<Movie[]>([]);
    const [allCinemas, setAllCinemas] = useState<Cinema[]>([]);
    const [schedules, setSchedules] = useState<CinemaSchedule[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [showGenreFilter, setShowGenreFilter] = useState(false);
    const [cityFilter, setCityFilter] = useState<City | 'All'>('All');
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [m, c, s] = await Promise.all([getMovies(), getCinemas(), getSchedules()]);
                setMovies(m);
                setAllCinemas(c);
                setSchedules(s);
            } catch (err) {
                console.error("Failed to fetch initial data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const cities = getAllCities();
    const genreOptions = Array.from(new Set(movies.flatMap((m) => m.genre.split('/').flatMap((part) => part.split('|')).map((g) => g.trim()))));

    const heroCarousel = useMemo(() => {
        const m8 = movies.find((m) => m.id === 'm8');
        const m1 = movies.find((m) => m.id === 'm1');
        const m2 = movies.find((m) => m.id === 'm2');
        const m9 = movies.find((m) => m.id === 'm9');

        const items = [];
        if (m8) items.push({ movie: m8, image: bg3, studio: 'DC Comics' });
        if (m1) items.push({ movie: m1, image: bg4, studio: 'Paramount' });
        if (m2) items.push({ movie: m2, image: bg, studio: 'Warner Bros.' });
        if (m9) items.push({ movie: m9, image: bg2, studio: 'Paramount' });
        return items;
    }, [movies]);

    const heroData = heroCarousel[currentHeroIndex] ?? heroCarousel[0];
    const heroMovie = heroData?.movie;
    const heroStudio = heroData?.studio ?? '';
    const [heroSrc, setHeroSrc] = useState<string>('');

    useEffect(() => {
        if (heroMovie) {
            setHeroSrc(heroData?.image || heroMovie.poster);
        }
    }, [currentHeroIndex, heroMovie, heroData]);

    useEffect(() => {
        if (heroCarousel.length === 0) return;
        // Reset index if it's out of bounds after movies load
        setCurrentHeroIndex(0);
        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroCarousel.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroCarousel.length]);

    const filtered = movies.filter((m) => {
        const query = search.toLowerCase();
        const matchSearch = m.title.toLowerCase().includes(query) ||
            m.director.toLowerCase().includes(query);
        const matchGenre = selectedGenres.length === 0 || selectedGenres.some((g) => m.genre.includes(g));

        let matchCity = true;
        if (cityFilter !== 'All') {
            const cityCinemaIds = allCinemas.filter((c) => c.city === cityFilter).map((c) => c.id);
            matchCity = schedules.some((sch) => sch.movieId === m.id && cityCinemaIds.includes(sch.cinemaId));
        }

        return matchSearch && matchGenre && matchCity;
    });

    function handleBook(movie: Movie) {
        if (!user) {
            onNavigate('auth');
            return;
        }
        setSelectedMovie(movie);
    }

    function handleBookingSuccess() {
        setSelectedMovie(null);
        onNavigate('dashboard');
    }

    const cinemasByCity = cities.map((city) => ({
        city,
        cinemas: allCinemas.filter((c) => c.city === city),
    }));

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            {heroMovie && (
                <div className="relative h-[100vh] min-h-[600px] overflow-hidden">
                    <div key={`hero-bg-${currentHeroIndex}`} className="absolute inset-0 animate-heroZoom animate-fadeIn">
                        <img src={heroSrc} alt={heroMovie.title} className="w-full h-full object-cover object-center hero-bg-img" loading="eager" onError={() => {
                            if (heroSrc !== heroMovie.poster)
                                setHeroSrc(heroMovie.poster);
                            else
                                setHeroSrc('');
                        }} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/30" />

                    <div key={`hero-content-${currentHeroIndex}`} className="relative z-10 h-full flex items-center animate-fadeIn">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                            <div className="max-w-2xl animate-slideUp">
                                <div className="mb-4">
                                    <span className="inline-flex items-center gap-2 bg-amber-500 text-gray-950 text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">
                                        {heroStudio}
                                    </span>
                                </div>
                                <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-5 hero-text-shadow">
                                    {heroMovie.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-300 text-sm mb-5">
                                    <span className="flex items-center gap-1.5">
                                        <span className="text-amber-400 font-semibold">{heroMovie.genre.replace(' / ', ' | ')}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-gray-400" />
                                        {heroMovie.releaseDate.includes('-') ? new Date(heroMovie.releaseDate).getFullYear() : heroMovie.releaseDate}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-gray-400" />
                                        {Math.floor(heroMovie.duration / 60)}h {heroMovie.duration % 60}m
                                    </span>
                                    <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded border border-amber-500/30">
                                        {heroMovie.rating}
                                    </span>
                                </div>
                                <p className="text-gray-300/90 text-base sm:text-lg leading-relaxed max-w-xl mb-8 hero-text-shadow">
                                    {heroMovie.description}
                                </p>
                                <div className="flex items-center gap-4">
                                    {!isAdmin && (
                                        <button onClick={() => handleBook(heroMovie)} className="group flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105">
                                            Explore Movies
                                            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    )}
                                    <button onClick={() => {
                                        const el = document.getElementById('movies-section');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }} className="flex items-center gap-2 text-white/80 hover:text-white font-medium text-sm sm:text-base px-6 py-3 rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm hover:bg-white/5">
                                        Browse All
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent" />
                </div>
            )}

            <div id="movies-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 animate-fadeIn">
                    <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-2">Now Showing</p>
                    <h2 className="text-white text-3xl sm:text-4xl font-black">Featured Movies</h2>
                </div>

                <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1">
                    <MapPin size={16} className="text-amber-400 flex-shrink-0" />
                    <button onClick={() => setCityFilter('All')} className={`flex-shrink-0 text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 ${cityFilter === 'All' ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/20' : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700/50'}`}>
                        All Cities
                    </button>
                    {cities.map((city) => (
                        <button key={city} onClick={() => setCityFilter(city)} className={`flex-shrink-0 text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 ${cityFilter === city ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/20' : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700/50'}`}>
                            {city}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" placeholder="Search movies or directors..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-900/80 border border-gray-700/50 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-all duration-300 backdrop-blur-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setShowGenreFilter(true)} className="inline-flex items-center gap-2 bg-gray-800/80 border border-gray-700 text-gray-300 hover:bg-gray-900 hover:text-white px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300">
                            <SlidersHorizontal size={15} className="text-gray-300" />
                            Filter Genres
                        </button>
                        <div className="text-sm text-gray-400 whitespace-nowrap">
                            {selectedGenres.length === 0 ? 'All genres' : selectedGenres.join(', ')}
                        </div>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-24 text-gray-500">
                        <p className="text-lg font-medium">No movies found</p>
                        <p className="text-sm mt-1">Try a different search or filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
                        {filtered.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} onBook={handleBook} isLoggedIn={!!user} canBook={!!user && !isAdmin} />
                        ))}
                    </div>
                )}
            </div>

            <div id="theaters-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-800/50">
                <div className="mb-10 animate-fadeIn">
                    <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-2">Our Locations</p>
                    <h2 className="text-white text-3xl sm:text-4xl font-black">Theaters Near You</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cinemasByCity.map(({ city, cinemas }) => (
                        <div key={city} className="group bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/5">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                                    <MapPin size={20} className="text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">{city}</h3>
                                    <p className="text-gray-500 text-xs">{cinemas.length} cinema{cinemas.length > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {cinemas.map((cinema) => (
                                    <div key={cinema.id} className="flex items-center justify-between bg-gray-800/40 rounded-xl px-4 py-3 border border-gray-700/30 group-hover:border-gray-700/50 transition-all duration-300">
                                        <div>
                                            <p className="text-white text-sm font-medium">{cinema.name}</p>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {cinema.seatingLayout.rows.length} rows · {cinema.seatingLayout.seatsPerRow} seats/row
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                            <ChevronRight size={14} className="text-amber-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showGenreFilter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-800 bg-gray-950 shadow-2xl shadow-black/50">
                        <div className="flex flex-col gap-4 p-6 sm:p-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-white text-xl font-bold">Filter by Genres</h3>
                                    <p className="text-gray-400 text-sm">Select one or more genres to refine the movie list.</p>
                                </div>
                                <button type="button" onClick={() => setShowGenreFilter(false)} className="text-sm font-medium text-gray-400 hover:text-white">Close</button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-1 pb-1">
                                {genreOptions.map((genre) => {
                                    const checked = selectedGenres.includes(genre);
                                    return (
                                        <label key={genre} className="flex items-center gap-3 rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 cursor-pointer hover:border-amber-500 transition-colors">
                                            <input type="checkbox" checked={checked} onChange={() => {
                                                if (checked) {
                                                    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
                                                } else {
                                                    setSelectedGenres([...selectedGenres, genre]);
                                                }
                                            }} className="h-4 w-4 rounded accent-amber-500 text-amber-500 focus:ring-amber-500" />
                                            <span className="text-sm text-gray-200">{genre}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <button type="button" onClick={() => setSelectedGenres([])} className="w-full sm:w-auto rounded-2xl border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-300 hover:border-amber-500 hover:text-white transition-colors">
                                    Clear Selection
                                </button>
                                <button type="button" onClick={() => setShowGenreFilter(false)} className="w-full sm:w-auto rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-amber-400 transition-colors">
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <footer className="border-t border-gray-800/50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-600 text-sm">
                        © {new Date().getFullYear()} CineVista. Premium Cinema Experience.
                    </p>
                </div>
            </footer>

            {selectedMovie && (
                <BookingModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} onSuccess={handleBookingSuccess} />
            )}
        </div>
    );
}
