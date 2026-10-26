import { useState, useEffect } from 'react';
import { BarChart2, Ticket, CheckCircle, XCircle, Clock, Users, Film, ChevronDown, ChevronUp, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { getTickets, getMovies, getUsers, updateTicketStatus, deleteMovie, updateMovie } from '../lib/storage';
import type { Ticket as TicketType, Movie, User, TicketStatus } from '../types';

export default function AdminDashboard() {
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [t, m, u] = await Promise.all([getTickets(), getMovies(), getUsers()]);
            setTickets(t);
            setMovies(m);
            setUsers(u);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const movieMap = Object.fromEntries(movies.map((m) => [m.id, m]));
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    const pending = tickets.filter((t) => t.status === 'pending');
    const pendingRefunds = tickets.filter((t) => t.status === 'pending_refund');
    const approved = tickets.filter((t) => t.status === 'approved');
    const totalRevenue = approved.reduce((s, t) => s + t.totalPrice, 0);

    async function handleAction(ticketId: string, action: TicketStatus) {
        try {
            await updateTicketStatus(ticketId, action);
            await fetchData();
        } catch (e) {
            console.error('Failed to update ticket status', e);
            alert('Failed to update ticket status');
        }
    }

    const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
    async function handleDeleteMovie(movieId: string) {
        if (!confirm('Delete this movie? This will also remove related tickets.')) return;
        try {
            await deleteMovie(movieId);
            await fetchData();
        } catch (e) {
            console.error('Failed to delete movie', e);
            alert('Failed to delete movie');
        }
    }

    async function handleSaveMovie(updated: Movie) {
        try {
            await updateMovie(updated);
            await fetchData();
            setEditingMovie(null);
        } catch (e) {
            console.error('Failed to update movie', e);
            alert('Failed to update movie');
        }
    }

    const movieStats = movies.map((m) => {
        const mTickets = tickets.filter((t) => t.movieId === m.id);
        const mApproved = mTickets.filter((t) => t.status === 'approved');
        const mPending = mTickets.filter((t) => t.status === 'pending');
        const revenue = mApproved.reduce((s, t) => s + t.totalPrice, 0);
        const seats = mApproved.reduce((s, t) => s + t.seats, 0);
        return { movie: m, total: mTickets.length, approved: mApproved.length, pending: mPending.length, revenue, seats };
    }).filter((s) => s.total > 0).sort((a, b) => b.approved - a.approved);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 pt-16 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (<div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="mb-8">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-white text-3xl font-black">Dashboard</h1>
        </div>

        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <BigStat label="Total Tickets" value={tickets.length} icon={<Ticket size={20}/>}/>
          <BigStat label="Pending" value={pending.length} icon={<Clock size={20}/>} color="amber"/>
          <BigStat label="Approved" value={approved.length} icon={<CheckCircle size={20}/>} color="green"/>
          <BigStat label="Revenue" value={`PKR${totalRevenue.toFixed(0)}`} icon={<BarChart2 size={20}/>} color="blue"/>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Film size={16} className="text-amber-400"/>
              <h2 className="text-white font-bold text-lg">Bookings by Movie</h2>
            </div>
            {movieStats.length === 0 ? (<EmptyBox text="No bookings yet"/>) : (<div className="space-y-3">
                {movieStats.map((s) => (<MovieMetricRow key={s.movie.id} {...s}/>))}
              </div>)}

            
            {movieStats.length === 0 && (<div className="mt-4 space-y-2">
                {movies.map((m) => (<div key={m.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-3">
                    <img src={m.poster} alt={m.title} className="w-8 h-11 object-cover rounded"/>
                    <p className="text-gray-400 text-sm">{m.title}</p>
                    <span className="ml-auto text-gray-600 text-xs">0 bookings</span>
                  </div>))}
              </div>)}
          </div>

          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-amber-400"/>
              <h2 className="text-white font-bold text-lg">Pending Approvals</h2>
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                {pending.length}
              </span>
            </div>
            {pending.length === 0 ? (<EmptyBox text="All caught up — no pending tickets"/>) : (<div className="space-y-3">
                {pending.map((t) => (<PendingTicketRow key={t.id} ticket={t} movie={movieMap[t.movieId]} user={userMap[t.userId]} onApprove={() => handleAction(t.id, 'approved')} onReject={() => handleAction(t.id, 'rejected')}/>))}
              </div>)}

            <div className="flex items-center gap-2 mt-8 mb-4">
              <RefreshCw size={16} className="text-green-400"/>
              <h2 className="text-white font-bold text-lg">Pending Refunds</h2>
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                {pendingRefunds.length}
              </span>
            </div>
            {pendingRefunds.length === 0 ? (<EmptyBox text="No pending refunds"/>) : (<div className="space-y-3">
                {pendingRefunds.map((t) => (<PendingTicketRow key={t.id} ticket={t} movie={movieMap[t.movieId]} user={userMap[t.userId]} onApprove={() => handleAction(t.id, 'refunded')} onReject={() => handleAction(t.id, 'approved')}/>))}
              </div>)}
          </div>
        </div>

        
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Film size={16} className="text-amber-400"/>
            <h2 className="text-white font-bold text-lg">Manage Movies</h2>
          </div>
          <div className="grid gap-3">
            {movies.map((m) => (<div key={m.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-3">
                <img src={m.poster} alt={m.title} className="w-12 h-16 object-cover rounded"/>
                <div className="ml-2">
                  <p className="text-white font-semibold text-sm truncate" style={{ maxWidth: 320 }}>{m.title}</p>
                  <p className="text-gray-400 text-xs">{m.genre} • PKR {m.price.toFixed(2)}</p>
                  {m.showtimes && <p className="text-gray-500 text-xs mt-1">Times: {m.showtimes.join(' • ')}</p>}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => setEditingMovie(m)} className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg text-sm">
                    <Edit2 size={14}/> Edit
                  </button>
                  <button onClick={() => handleDeleteMovie(m.id)} className="flex items-center gap-2 text-red-400 bg-red-500/10 px-3 py-1 rounded-lg text-sm">
                    <Trash2 size={14}/> Delete
                  </button>
                </div>
              </div>))}
          </div>
        </div>

        <AllTicketsLog tickets={tickets} movieMap={movieMap} userMap={userMap}/>

        {editingMovie && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setEditingMovie(null)}>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-white font-bold text-lg mb-4">Edit Movie</h3>
              <EditMovieForm movie={editingMovie} onCancel={() => setEditingMovie(null)} onSave={(m) => handleSaveMovie(m)}/>
            </div>
          </div>)}
      </div>
    </div>);
}
function BigStat({ label, value, icon, color = 'gray', }: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color?: 'gray' | 'amber' | 'green' | 'blue';
}) {
    const colorMap = {
        gray: 'bg-gray-800 text-gray-300',
        amber: 'bg-amber-500/10 text-amber-400',
        green: 'bg-green-500/10 text-green-400',
        blue: 'bg-blue-500/10 text-blue-400',
    };
    return (<div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-white font-black text-2xl">{value}</p>
      <p className="text-gray-500 text-xs mt-0.5">{label}</p>
    </div>);
}
function MovieMetricRow({ movie, approved, pending, revenue, seats, total, }: {
    movie: Movie;
    approved: number;
    pending: number;
    revenue: number;
    seats: number;
    total: number;
}) {
    const maxApproved = 20;
    const pct = Math.min((approved / maxApproved) * 100, 100);
    return (<div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded-lg flex-shrink-0"/>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{movie.title}</p>
          <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
            <span className="text-green-400">{approved} approved</span>
            {pending > 0 && <span className="text-amber-400">{pending} pending</span>}
            <span>{seats} seats</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-white font-bold text-sm">PKR {revenue.toFixed(0)}</p>
          <p className="text-gray-600 text-xs">{total} total</p>
        </div>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}/>
      </div>
    </div>);
}
function PendingTicketRow({ ticket, movie, user, onApprove, onReject, }: {
    ticket: TicketType;
    movie: Movie | undefined;
    user: User | undefined;
    onApprove: () => void;
    onReject: () => void;
}) {
    const [previewOpen, setPreviewOpen] = useState(false);
    return (<div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-start gap-3 mb-3">
        {movie && (<img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded-lg flex-shrink-0"/>)}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{movie?.title ?? 'Unknown'}</p>
          <p className="text-gray-400 text-xs truncate mt-0.5">{user?.name ?? 'Unknown'} &bull; {user?.email}</p>
          <p className="text-gray-500 text-xs mt-1">
            {ticket.seats} seat{ticket.seats > 1 ? 's' : ''} &bull; PKR {ticket.totalPrice.toFixed(2)}{ticket.showtime ? <> &bull; {ticket.showtime}</> : ''} &bull;{' '}
            {new Date(ticket.bookedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
      {ticket.paymentProof && (<div className="mb-3">
          <p className="text-gray-400 text-xs mb-2">Payment proof</p>
          <img src={ticket.paymentProof} alt="payment proof" className="w-full max-h-40 object-contain rounded-md cursor-pointer border border-gray-800" onClick={() => setPreviewOpen(true)}/>
        </div>)}
      <div className="flex gap-2">
        <button onClick={onApprove} className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-xs font-semibold py-2 rounded-lg transition-colors">
          <CheckCircle size={13}/> Approve
        </button>
        <button onClick={onReject} className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold py-2 rounded-lg transition-colors">
          <XCircle size={13}/> Reject
        </button>
      </div>
      {previewOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setPreviewOpen(false)}>
          <div className="bg-gray-900 rounded-lg p-3 max-w-3xl w-full max-h-[90vh] overflow-auto">
            <button onClick={() => setPreviewOpen(false)} className="text-gray-400 hover:text-white mb-2">
              Close
            </button>
            <img src={ticket.paymentProof} alt="payment proof large" className="w-full h-auto object-contain rounded"/>
          </div>
        </div>)}
    </div>);
}
function AllTicketsLog({ tickets, movieMap, userMap, }: {
    tickets: TicketType[];
    movieMap: Record<string, Movie>;
    userMap: Record<string, User>;
}) {
    const [expanded, setExpanded] = useState(false);
    const sorted = [...tickets].sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());
    const shown = expanded ? sorted : sorted.slice(0, 5);
    if (tickets.length === 0)
        return null;
    const statusCfg = {
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        approved: 'bg-green-500/10 text-green-400 border-green-500/20',
        rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
        refunded: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return (<div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <Users size={16} className="text-gray-400"/>
        <h2 className="text-white font-bold text-lg">All Tickets</h2>
        <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full ml-1">{tickets.length}</span>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wide">Movie</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wide">User</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wide">Seats</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wide">Total</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wide">Showtime</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wide">Date</th>
                <th className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {shown.map((t) => (<tr key={t.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{movieMap[t.movieId]?.title ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{userMap[t.userId]?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{t.seats}</td>
                  <td className="px-4 py-3 text-white">PKR {t.totalPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-400">{(t as any).showtime ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(t.bookedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${statusCfg[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
        {tickets.length > 5 && (<button onClick={() => setExpanded((e) => !e)} className="w-full flex items-center justify-center gap-1.5 text-gray-400 hover:text-white text-xs font-medium py-3 border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
            {expanded ? <><ChevronUp size={14}/> Show less</> : <><ChevronDown size={14}/> Show all {tickets.length} tickets</>}
          </button>)}
      </div>
    </div>);
}
function EmptyBox({ text }: {
    text: string;
}) {
    return (<div className="bg-gray-900 border border-gray-800 rounded-xl py-10 text-center">
      <p className="text-gray-500 text-sm">{text}</p>
    </div>);
}
function EditMovieForm({ movie, onCancel, onSave }: {
    movie: Movie;
    onCancel: () => void;
    onSave: (m: Movie) => void;
}) {
    const [title, setTitle] = useState(movie.title);
    const [price, setPrice] = useState(String(movie.price));
    const [genre, setGenre] = useState(movie.genre);
    const [showtimes, setShowtimes] = useState<string[]>(movie.showtimes && movie.showtimes.length ? movie.showtimes.slice(0, 3) : ['1:00 PM', '4:00 PM', '7:30 PM']);
    function updateShowtime(idx: number, val: string) {
        setShowtimes((s) => s.map((st, i) => (i === idx ? val : st)));
    }
    function submit() {
        const updated: Movie = {
            ...movie,
            title: title.trim() || movie.title,
            price: Number(Number(price) || movie.price),
            genre: genre.trim() || movie.genre,
            showtimes,
        };
        onSave(updated);
    }
    return (<div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-gray-400 text-xs">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700 text-white text-sm"/>
        </div>
        <div>
          <label className="text-gray-400 text-xs">Price</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700 text-white text-sm"/>
        </div>
        <div>
          <label className="text-gray-400 text-xs">Genre</label>
          <input value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700 text-white text-sm"/>
        </div>
        <div />
      </div>

      <div className="mb-4">
        <label className="text-gray-400 text-xs">Showtimes (3)</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          {showtimes.map((st, i) => (<input key={i} value={st} onChange={(e) => updateShowtime(i, e.target.value)} className="p-2 rounded bg-gray-800 border border-gray-700 text-white text-sm"/>))}
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg">Cancel</button>
        <button onClick={submit} className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-4 py-2 rounded-lg">Save</button>
      </div>
    </div>);
}
