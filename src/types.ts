export type City = 'Multan' | 'Lahore' | 'Karachi';
export interface SeatingLayout {
    rows: string[];
    seatsPerRow: number;
}
export interface Cinema {
    id: string;
    name: string;
    city: City;
    seatingLayout: SeatingLayout;
}
export interface CinemaSchedule {
    cinemaId: string;
    movieId: string;
    showtimes: string[];
}
export interface Movie {
    id: string;
    title: string;
    genre: string;
    director: string;
    duration: number;
    releaseDate: string;
    price: number;
    poster: string;
    description: string;
    rating: string;
    showtimes?: string[];
}
export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    createdAt: string;
}
export type PaymentMethod = 'card' | 'jazzcash' | 'easypaisa';
export type TicketStatus = 'pending' | 'approved' | 'rejected' | 'refunded' | 'pending_refund';
export interface Ticket {
    id: string;
    userId: string;
    movieId: string;
    cinemaId: string;
    seats: number;
    seatNumbers?: string[];
    totalPrice: number;
    status: TicketStatus;
    bookedAt: string;
    updatedAt: string;
    showtime?: string;
    showDate: string;
    paymentMethod: PaymentMethod;
    isRefundable: boolean;
    paymentProof?: string;
    refundedAt?: string;
}
