import { Clock, CheckCircle, XCircle, Ticket, Film, CalendarDays, RefreshCw } from 'lucide-react';
import { getTickets, getMovies, getCinemaById, refundTicket } from '../lib/storage';
import { downloadTicketPdf } from '../lib/ticketPdf';
import { useAuth } from '../context/AuthContext';
import type { Ticket as TicketType, Movie, Cinema } from '../types';
import { useState, useEffect } from 'react';

interface UserDashboardProps {
    onNavigate: (view: 'home' | 'auth' | 'dashboard' | 'admin') => void;
}

export default function UserDashboard({ onNavigate }: UserDashboardProps) {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [t, m] = await Promise.all([getTickets(), getMovies()]);
            setTickets(t);
            setMovies(m);
        } catch (error) {
            console.error('Failed to fetch user data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            onNavigate('auth');
            return;
        }
        fetchData();
    }, [user, onNavigate]);

    const movieMap = Object.fromEntries(movies.map((m) => [m.id, m]));
    const myTickets = tickets.filter((t) => t.userId === user?.id);
    const pending = myTickets.filter((t) => t.status === 'pending' || t.status === 'pending_refund');
    const approved = myTickets.filter((t) => t.status === 'approved');
    const history = myTickets.filter((t) => t.status !== 'pending' && t.status !== 'pending_refund');
    const totalSpent = approved.reduce((sum, t) => sum + t.totalPrice, 0);

    const handleRefund = async (ticketId: string) => {
        const result = await refundTicket(ticketId);
        if (result.success) {
            await fetchData();
            alert('Refund request submitted successfully! Waiting for admin approval.');
        } else {
            alert(`Refund failed: ${result.error}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 pt-16 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 pt-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-1">My Account</p>
                    <h1 className="text-white text-3xl font-black mb-1">Welcome, {user?.name}</h1>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                    <StatCard label="Total Bookings" value={myTickets.length} icon={<Ticket size={18} />} />
                    <StatCard label="Pending" value={pending.length} icon={<Clock size={18} />} color="amber" />
                    <StatCard label="Approved" value={approved.length} icon={<CheckCircle size={18} />} color="green" />
                    <StatCard label="Total Spent" value={`PKR ${totalSpent.toFixed(2)}`} icon={<Film size={18} />} color="blue" />
                </div>

                <Section title="Pending Tickets" count={pending.length} icon={<Clock size={16} className="text-amber-400" />}>
                    {pending.length === 0 ? (
                        <EmptyState text="No pending tickets" />
                    ) : (
                        <div className="space-y-3">
                            {pending.map((t) => (
                                <TicketRow key={t.id} ticket={t} movie={movieMap[t.movieId]} userName={user?.name ?? ''} userEmail={user?.email ?? ''} onRefund={handleRefund} />
                            ))}
                        </div>
                    )}
                </Section>

                <Section title="Booking History" count={history.length} icon={<CalendarDays size={16} className="text-gray-400" />} className="mt-8">
                    {history.length === 0 ? (
                        <EmptyState
                            text="No booking history yet"
                            sub={
                                <button onClick={() => onNavigate('home')} className="mt-3 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
                                    Browse movies &rarr;
                                </button>
                            }
                        />
                    ) : (
                        <div className="space-y-3">
                            {history
                                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                                .map((t) => (
                                    <TicketRow key={t.id} ticket={t} movie={movieMap[t.movieId]} userName={user?.name ?? ''} userEmail={user?.email ?? ''} onRefund={handleRefund} />
                                ))}
                        </div>
                    )}
                </Section>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color = 'gray' }: { label: string; value: string | number; icon: React.ReactNode; color?: 'gray' | 'amber' | 'green' | 'blue' }) {
    const colorMap = {
        gray: 'bg-gray-800 text-gray-400',
        amber: 'bg-amber-500/10 text-amber-400',
        green: 'bg-green-500/10 text-green-400',
        blue: 'bg-blue-500/10 text-blue-400',
    };
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colorMap[color]}`}>{icon}</div>
            <p className="text-white font-bold text-2xl">{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
        </div>
    );
}

function Section({ title, count, icon, children, className = '' }: { title: string; count: number; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-4">
                {icon}
                <h2 className="text-white font-bold text-lg">{title}</h2>
                <span className="bg-gray-800 text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full ml-1">{count}</span>
            </div>
            {children}
        </div>
    );
}

function TicketRow({ ticket, movie, userName, userEmail, onRefund }: { ticket: TicketType; movie: Movie | undefined; userName: string; userEmail: string; onRefund: (ticketId: string) => void }) {
    const [cinema, setCinema] = useState<Cinema | undefined>(undefined);
    
    useEffect(() => {
        getCinemaById(ticket.cinemaId).then(c => setCinema(c));
    }, [ticket.cinemaId]);

    const statusConfig = {
        pending: { label: 'Pending', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: <Clock size={12} /> },
        pending_refund: { label: 'Refund Pending', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: <Clock size={12} /> },
        approved: { label: 'Approved', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', icon: <CheckCircle size={12} /> },
        rejected: { label: 'Rejected', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: <XCircle size={12} /> },
        refunded: { label: 'Refunded', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', icon: <RefreshCw size={12} /> },
    };
    const cfg = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.pending;
    const showDateTime = new Date(ticket.showDate);
    const now = new Date();
    const diffMs = showDateTime.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const isRefundAvailable = ticket.status === 'approved' && ticket.isRefundable && diffDays >= 1;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-4 flex-1 w-full">
                {movie && <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{movie?.title ?? 'Unknown Movie'}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                        {ticket.seats} seat{ticket.seats > 1 ? 's' : ''} &bull;{' '}
                        {new Date(ticket.bookedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </p>
                    {cinema && (
                        <p className="text-gray-400 text-xs mt-1">
                            {cinema.name} · {cinema.city}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                    <p className="text-white font-bold">PKR {ticket.totalPrice.toLocaleString()}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border mt-1 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.icon}
                        {cfg.label}
                    </span>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                    {ticket.status === 'approved' && movie && cinema && (
                        <button onClick={() => downloadTicketPdf(ticket, movie, cinema, userName, userEmail)} className="text-sm font-medium text-amber-400 hover:text-amber-300 border border-amber-500/20 px-4 py-2 rounded-xl transition-colors">
                            Download PDF
                        </button>
                    )}
                    {isRefundAvailable && (
                        <button onClick={() => onRefund(ticket.id)} className="text-sm font-medium text-green-400 hover:text-green-300 border border-green-500/20 px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
                            <RefreshCw size={14} />
                            Refund
                        </button>
                    )}
                    {ticket.status === 'approved' && ticket.isRefundable && diffDays < 1 && (
                        <div className="text-xs text-gray-500 text-right">
                            Refund unavailable<br />
                            (within 1 day of show)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ text, sub }: { text: string; sub?: React.ReactNode }) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl py-12 text-center">
            <p className="text-gray-500 text-sm">{text}</p>
            {sub}
        </div>
    );
}
