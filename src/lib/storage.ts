import { supabase } from './supabase';
import type { Movie, User, Ticket, Cinema, CinemaSchedule, City, PaymentMethod } from '../types';

export const getAllCities = (): City[] => ['Multan', 'Lahore', 'Karachi'];

export async function getMovies(): Promise<Movie[]> {
  const { data, error } = await supabase.from('movies').select('*');
  if (error) throw error;
  // Map snake_case from DB to camelCase for app
  return data.map(m => ({
    id: m.id,
    title: m.title,
    genre: m.genre,
    director: m.director,
    duration: m.duration,
    releaseDate: m.release_date,
    price: m.price,
    poster: m.poster,
    description: m.description,
    rating: m.rating,
    showtimes: m.showtimes || undefined
  }));
}

export async function updateMovie(movie: Movie): Promise<void> {
  const { error } = await supabase
    .from('movies')
    .update({
      title: movie.title,
      genre: movie.genre,
      director: movie.director,
      duration: movie.duration,
      release_date: movie.releaseDate,
      price: movie.price,
      poster: movie.poster,
      description: movie.description,
      rating: movie.rating,
      showtimes: movie.showtimes
    })
    .eq('id', movie.id);
  if (error) throw error;
}

export async function deleteMovie(movieId: string): Promise<void> {
  const { error } = await supabase.from('movies').delete().eq('id', movieId);
  if (error) throw error;
}

export async function getCinemas(): Promise<Cinema[]> {
  const { data, error } = await supabase.from('cinemas').select('*');
  if (error) throw error;
  return data.map(c => ({
    id: c.id,
    name: c.name,
    city: c.city as City,
    seatingLayout: c.seating_layout as any
  }));
}

export async function getCinemasByCity(city: City): Promise<Cinema[]> {
  const { data, error } = await supabase.from('cinemas').select('*').eq('city', city);
  if (error) throw error;
  return data.map(c => ({
    id: c.id,
    name: c.name,
    city: c.city as City,
    seatingLayout: c.seating_layout as any
  }));
}

export async function getCinemaById(cinemaId: string): Promise<Cinema | undefined> {
  const { data, error } = await supabase.from('cinemas').select('*').eq('id', cinemaId).single();
  if (error || !data) return undefined;
  return {
    id: data.id,
    name: data.name,
    city: data.city as City,
    seatingLayout: data.seating_layout as any
  };
}

export async function getSchedules(): Promise<CinemaSchedule[]> {
  const { data, error } = await supabase.from('schedules').select('*');
  if (error) throw error;
  return data.map(s => ({
    cinemaId: s.cinema_id!,
    movieId: s.movie_id!,
    showtimes: s.showtimes
  }));
}

export async function getSchedulesForCinema(cinemaId: string): Promise<CinemaSchedule[]> {
  const { data, error } = await supabase.from('schedules').select('*').eq('cinema_id', cinemaId);
  if (error) throw error;
  return data.map(s => ({
    cinemaId: s.cinema_id!,
    movieId: s.movie_id!,
    showtimes: s.showtimes
  }));
}

export async function getScheduleForMovie(movieId: string, cinemaId: string): Promise<CinemaSchedule | undefined> {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('movie_id', movieId)
    .eq('cinema_id', cinemaId)
    .maybeSingle();
  if (error || !data) return undefined;
  return {
    cinemaId: data.cinema_id!,
    movieId: data.movie_id!,
    showtimes: data.showtimes
  };
}

export async function getCinemasShowingMovie(movieId: string): Promise<Cinema[]> {
  const { data: schedules, error: scheduleError } = await supabase
    .from('schedules')
    .select('cinema_id')
    .eq('movie_id', movieId);
  if (scheduleError || !schedules.length) return [];
  
  const cinemaIds = schedules.map(s => s.cinema_id!);
  const { data: cinemas, error: cinemaError } = await supabase
    .from('cinemas')
    .select('*')
    .in('id', cinemaIds);
  if (cinemaError) throw cinemaError;
  return cinemas.map(c => ({
    id: c.id,
    name: c.name,
    city: c.city as City,
    seatingLayout: c.seating_layout as any
  }));
}

export async function getCitiesShowingMovie(movieId: string): Promise<City[]> {
  const cinemas = await getCinemasShowingMovie(movieId);
  return [...new Set(cinemas.map((c) => c.city))];
}

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    password: u.password,
    role: u.role as 'user' | 'admin',
    createdAt: u.created_at!
  }));
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  if (error || !data) return undefined;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role as 'user' | 'admin',
    createdAt: data.created_at!
  };
}

export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'role'>): Promise<User> {
  const id = `u_${Date.now()}`;
  const role = 'user';
  const createdAt = new Date().toISOString();
  
  const { error } = await supabase.from('users').insert({
    id,
    name: data.name,
    email: data.email,
    password: data.password,
    role,
    created_at: createdAt
  });
  if (error) throw error;
  
  return {
    ...data,
    id,
    role,
    createdAt
  };
}

/**
 * Used for OAuth logins (Google / Facebook).
 * If the email already exists in the users table, returns that user.
 * Otherwise creates a new user row with an empty password (OAuth users don't have one).
 */
export async function upsertOAuthUser(email: string, name: string): Promise<User> {
  // Check if user already exists
  const existing = await getUserByEmail(email);
  if (existing) return existing;

  // Create new user without a password (OAuth users authenticate via provider)
  const id = `u_${Date.now()}`;
  const role = 'user';
  const createdAt = new Date().toISOString();

  const { error } = await supabase.from('users').insert({
    id,
    name,
    email,
    password: '', // no password for OAuth users
    role,
    created_at: createdAt
  });
  if (error) throw error;

  return { id, name, email, password: '', role, createdAt };
}


export async function getTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase.from('tickets').select('*');
  if (error) throw error;
  return data.map(t => ({
    id: t.id,
    userId: t.user_id!,
    movieId: t.movie_id!,
    cinemaId: t.cinema_id!,
    seats: t.seats,
    seatNumbers: t.seat_numbers || undefined,
    totalPrice: t.total_price,
    status: t.status as any,
    bookedAt: t.booked_at!,
    updatedAt: t.updated_at!,
    showtime: t.showtime || undefined,
    showDate: t.show_date,
    paymentMethod: t.payment_method as any,
    isRefundable: t.is_refundable,
    paymentProof: t.payment_proof || undefined,
    refundedAt: t.refunded_at || undefined
  }));
}

export async function createTicket(userId: string, movieId: string, cinemaId: string, seats: number, price: number, seatNumbers: string[], showtime: string, showDate: string, paymentMethod: PaymentMethod, isRefundable: boolean): Promise<Ticket> {
  const id = `t_${Date.now()}`;
  const totalPrice = seats * price;
  const bookedAt = new Date().toISOString();
  
  const ticketData = {
    id,
    user_id: userId,
    movie_id: movieId,
    cinema_id: cinemaId,
    seats,
    seat_numbers: seatNumbers.length ? seatNumbers : null,
    total_price: totalPrice,
    status: 'pending',
    booked_at: bookedAt,
    updated_at: bookedAt,
    showtime,
    show_date: showDate,
    payment_method: paymentMethod,
    is_refundable: isRefundable
  };

  const { error } = await supabase.from('tickets').insert(ticketData);
  if (error) throw error;
  
  return {
    id,
    userId,
    movieId,
    cinemaId,
    seats,
    seatNumbers: seatNumbers.length ? seatNumbers : undefined,
    totalPrice,
    status: 'pending',
    bookedAt,
    updatedAt: bookedAt,
    showtime,
    showDate,
    paymentMethod,
    isRefundable
  };
}

export async function getBookedSeats(movieId: string, cinemaId: string, showtime?: string, showDate?: string): Promise<string[]> {
  let query = supabase
    .from('tickets')
    .select('seat_numbers, status')
    .eq('movie_id', movieId)
    .eq('cinema_id', cinemaId);
    
  if (showtime) query = query.eq('showtime', showtime);
  if (showDate) query = query.eq('show_date', showDate);
  
  const { data, error } = await query;
  if (error) throw error;
  
  return data
    .filter(t => t.status !== 'rejected' && t.status !== 'refunded')
    .flatMap(t => t.seat_numbers || []);
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
  const updateData: any = { status, updated_at: new Date().toISOString() };
  if (status === 'refunded') {
    updateData.refunded_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from('tickets')
    .update(updateData)
    .eq('id', ticketId);
  if (error) throw error;
}

export async function refundTicket(ticketId: string): Promise<{ success: boolean; error?: string }> {
  const { data: ticket, error: getError } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .single();
    
  if (getError || !ticket) return { success: false, error: 'Ticket not found.' };
  if (ticket.status !== 'approved') return { success: false, error: 'Only approved tickets can be refunded.' };
  if (!ticket.is_refundable) return { success: false, error: 'This ticket is not refundable.' };
  
  const showDateTime = new Date(ticket.show_date);
  const now = new Date();
  const diffMs = showDateTime.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 1) return { success: false, error: 'Refund is only available until 1 day before the showtime.' };
  
  const { error: updateError } = await supabase
    .from('tickets')
    .update({ status: 'pending_refund', updated_at: new Date().toISOString() })
    .eq('id', ticketId);
    
  if (updateError) return { success: false, error: 'Failed to request refund.' };
  return { success: true };
}
