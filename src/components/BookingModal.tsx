import { X, Ticket as TicketIcon, MapPin, Calendar, Clock, CreditCard, Smartphone, ChevronRight, ChevronLeft, Check, RefreshCw, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Movie, Cinema, City, PaymentMethod, Ticket as TicketType, CinemaSchedule } from '../types';
import { createTicket, getBookedSeats, getScheduleForMovie, getCinemasShowingMovie } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import visaLogo from '../assets/visa.png';
import mastercardLogo from '../assets/mastercard.png';

interface BookingModalProps {
    movie: Movie;
    onClose: () => void;
    onSuccess: () => void;
}

type BookingStep = 'cinema' | 'schedule' | 'seats' | 'payment' | 'confirmed';

const STEPS: {
    key: BookingStep;
    label: string;
    icon: React.ReactNode;
}[] = [
    { key: 'cinema', label: 'Cinema', icon: <MapPin size={14} /> },
    { key: 'schedule', label: 'Schedule', icon: <Calendar size={14} /> },
    { key: 'seats', label: 'Seats', icon: <TicketIcon size={14} /> },
    { key: 'payment', label: 'Payment', icon: <CreditCard size={14} /> },
];

function getNext7Days(): {
    label: string;
    value: string;
    dayName: string;
}[] {
    const days: {
        label: string;
        value: string;
        dayName: string;
    }[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        days.push({
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: d.toISOString().split('T')[0],
            dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        });
    }
    return days;
}

function formatCardNumber(value: string) {
    return value.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') ?? '';
}

function detectCardType(cardNumber: string): 'visa' | 'mastercard' | 'unknown' {
    if (/^4/.test(cardNumber)) return 'visa';
    if (/^(5[1-5]|2(?:2[2-9]|[3-6]\d|7[01]|720))/.test(cardNumber)) return 'mastercard';
    return 'unknown';
}

function isValidPakistaniPhone(value: string) {
    const digits = value.replace(/\D/g, '');
    return /^03\d{9}$/.test(digits);
}

export default function BookingModal({ movie, onClose, onSuccess }: BookingModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState<BookingStep>('cinema');
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
    const dates = getNext7Days();
    const [selectedDate, setSelectedDate] = useState(dates[0].value);
    const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    
    // Async states
    const [cinemasForMovie, setCinemasForMovie] = useState<Cinema[]>([]);
    const [schedule, setSchedule] = useState<CinemaSchedule | undefined>(undefined);
    const [bookedSeats, setBookedSeats] = useState<string[]>([]);
    const [loadingCinemas, setLoadingCinemas] = useState(true);

    const [createdTicket, setCreatedTicket] = useState<TicketType | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [isRefundable, setIsRefundable] = useState(true);

    // Payment states
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');
    const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'unknown'>('unknown');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isPhoneValid, setIsPhoneValid] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [otpError, setOtpError] = useState<string | null>(null);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otpResendSeconds, setOtpResendSeconds] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Load cinemas on mount
    useEffect(() => {
        getCinemasShowingMovie(movie.id).then(cinemas => {
            setCinemasForMovie(cinemas);
            setLoadingCinemas(false);
        }).catch(console.error);
    }, [movie.id]);

    const citiesForMovie = [...new Set(cinemasForMovie.map((c) => c.city))];
    const filteredCinemas = selectedCity ? cinemasForMovie.filter((c) => c.city === selectedCity) : cinemasForMovie;

    // Load schedule when cinema changes
    useEffect(() => {
        if (selectedCinema) {
            getScheduleForMovie(movie.id, selectedCinema.id).then(setSchedule).catch(console.error);
        } else {
            setSchedule(undefined);
        }
    }, [movie.id, selectedCinema]);

    const showtimes = schedule?.showtimes ?? [];

    // Load booked seats when showtime changes
    useEffect(() => {
        if (selectedCinema && selectedShowtime && selectedDate) {
            getBookedSeats(movie.id, selectedCinema.id, selectedShowtime, selectedDate).then(setBookedSeats).catch(console.error);
        }
    }, [movie.id, selectedCinema, selectedShowtime, selectedDate]);

    function toggleSeat(id: string) {
        setError(null);
        if (bookedSeats.includes(id)) return;
        setSelectedSeats((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    }

    function canProceed(): boolean {
        switch (step) {
            case 'cinema':
                return !!selectedCinema;
            case 'schedule':
                return !!selectedDate && !!selectedShowtime;
            case 'seats':
                return selectedSeats.length > 0;
            case 'payment':
                if (paymentMethod === 'card') {
                    const cardDigits = cardNumber.replace(/\s/g, '');
                    const expiryDigits = cardExpiry.replace(/\D/g, '');
                    return cardDigits.length >= 12 && expiryDigits.length === 4 && cardCVV.length >= 3;
                }
                return isPhoneValid && isOtpVerified;
            default:
                return false;
        }
    }

    function goNext() {
        setError(null);
        if (step === 'cinema') setStep('schedule');
        else if (step === 'schedule') setStep('seats');
        else if (step === 'seats') setStep('payment');
        else if (step === 'payment') handleSubmit();
    }

    function sendOtp() {
        if (!isValidPakistaniPhone(phoneNumber)) {
            setOtpError('Enter a valid Pakistani mobile number before sending OTP.');
            return;
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setOtpCode(code);
        setOtpSent(true);
        setOtpError(null);
        setIsOtpVerified(false);
        setOtpInput('');
        setOtpResendSeconds(60);
        setError(null);

        // Send OTP via WhatsApp
        const paymentLabel = paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa';
        const message = `Your CineVista ${paymentLabel} OTP is: *${code}*\n\nDo not share this code with anyone. It expires in 5 minutes.`;
        // WhatsApp number must be in international format without '+' or spaces
        const intlNumber = '92' + phoneNumber.replace(/^0/, '');
        const waUrl = `https://wa.me/${intlNumber}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    }

    function verifyOtp() {
        if (otpInput === otpCode) {
            setIsOtpVerified(true);
            setOtpError(null);
            setError(null);
        } else {
            setOtpError('Invalid OTP. Please try again.');
            setIsOtpVerified(false);
        }
    }

    function goBack() {
        setError(null);
        if (step === 'schedule') {
            setStep('cinema');
            setSelectedShowtime(null);
        } else if (step === 'seats') {
            setStep('schedule');
            setSelectedSeats([]);
        } else if (step === 'payment') setStep('seats');
    }

    useEffect(() => {
        if (paymentMethod === 'card') {
            setPhoneNumber('');
            setIsPhoneValid(false);
            setOtpSent(false);
            setOtpInput('');
            setOtpCode('');
            setOtpError(null);
            setIsOtpVerified(false);
        } else {
            setCardNumber('');
            setCardExpiry('');
            setCardCVV('');
            setCardType('unknown');
        }
    }, [paymentMethod]);

    useEffect(() => {
        const valid = isValidPakistaniPhone(phoneNumber);
        setIsPhoneValid(valid);
        if (!valid) {
            setOtpSent(false);
            setOtpCode('');
            setOtpInput('');
            setIsOtpVerified(false);
            setOtpError(null);
            setOtpResendSeconds(0);
        }
    }, [phoneNumber, paymentMethod]);

    useEffect(() => {
        if (otpResendSeconds <= 0) return;
        const timer = window.setTimeout(() => setOtpResendSeconds((prev) => Math.max(prev - 1, 0)), 1000);
        return () => window.clearTimeout(timer);
    }, [otpResendSeconds]);

    async function handleSubmit() {
        if (!user || !selectedCinema || !selectedShowtime) return;
        if (paymentMethod !== 'card' && !isOtpVerified) {
            setError('Please verify the OTP before completing payment.');
            return;
        }
        
        setSubmitting(true);
        try {
            const ticket = await createTicket(user.id, movie.id, selectedCinema.id, selectedSeats.length, movie.price, selectedSeats, selectedShowtime, selectedDate, paymentMethod, isRefundable);
            setCreatedTicket(ticket);
            setStep('confirmed');
        } catch (e) {
            console.error(e);
            setError('Failed to create booking.');
        } finally {
            setSubmitting(false);
        }
    }

    if (step === 'confirmed') {
        return (
            <Overlay onClose={onClose}>
                <div className="text-center py-6 animate-slideUp">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulseGlow" style={{ animationDuration: '1.5s' }}>
                        <Check size={36} className="text-green-400" />
                    </div>
                    <h3 className="text-white text-2xl font-black mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-400 text-sm mb-1">
                        Your ticket for <span className="text-white font-medium">{movie.title}</span>
                    </p>
                    <p className="text-gray-400 text-sm mb-1">
                        at <span className="text-amber-400 font-medium">{selectedCinema?.name}</span> · {selectedShowtime}
                    </p>
                    <p className="text-gray-500 text-xs mb-2">
                        {selectedDate} · {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} · {selectedSeats.join(', ')}
                    </p>
                    <p className="text-white font-bold text-xl mb-1">PKR {(selectedSeats.length * movie.price).toLocaleString()}</p>
                    {isRefundable && (
                        <p className="text-green-400/80 text-xs mb-4 flex items-center justify-center gap-1">
                            <RefreshCw size={11} /> Refundable until 1 day before show
                        </p>
                    )}
                    <p className="text-gray-500 text-xs mb-6">Your ticket is pending approval. You'll be able to download your e-ticket once the admin approves your booking.</p>
                    <div className="flex items-center justify-center mb-4">
                        <button onClick={onSuccess} className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25">
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </Overlay>
        );
    }

    const stepIndex = STEPS.findIndex((s) => s.key === step);

    return (
        <Overlay onClose={onClose}>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-800/50">
                <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded-lg shadow-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg leading-tight truncate">{movie.title}</h3>
                    <p className="text-amber-400 text-sm">{movie.genre}</p>
                </div>
                <p className="text-gray-400 text-sm font-medium">PKR {movie.price.toLocaleString()}/seat</p>
            </div>

            <div className="flex items-center gap-1 mb-6">
                {STEPS.map((s, i) => (
                    <div key={s.key} className="flex items-center flex-1">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${i < stepIndex ? 'step-completed' : i === stepIndex ? 'step-active' : 'step-inactive'}`}>
                            {i < stepIndex ? <Check size={12} /> : s.icon}
                            <span className="hidden sm:inline">{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-300 ${i < stepIndex ? 'bg-green-500' : 'bg-gray-800'}`} />
                        )}
                    </div>
                ))}
            </div>

            <div className="min-h-[320px]">
                {loadingCinemas ? (
                    <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div></div>
                ) : (
                    <>
                        {step === 'cinema' && (
                            <div className="animate-fadeIn">
                                <p className="text-white font-semibold mb-4">Select City & Cinema</p>

                                <div className="flex gap-2 mb-5 flex-wrap">
                                    {citiesForMovie.map((city) => (
                                        <button key={city} onClick={() => { setSelectedCity(city); setSelectedCinema(null); }} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCity === city
                                                ? 'bg-amber-500 text-gray-950'
                                                : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700/50'}`}>
                                            <MapPin size={13} />
                                            {city}
                                        </button>
                                    ))}
                                </div>

                                {selectedCity && (
                                    <div className="space-y-3 animate-slideUp">
                                        {filteredCinemas.map((cinema) => {
                                            return (
                                                <button key={cinema.id} onClick={() => setSelectedCinema(cinema)} className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${selectedCinema?.id === cinema.id
                                                        ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5'
                                                        : 'bg-gray-800/40 border-gray-700/30 hover:border-gray-600'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-white font-semibold">{cinema.name}</p>
                                                            <p className="text-gray-500 text-xs mt-1">
                                                                {cinema.seatingLayout.rows.length * cinema.seatingLayout.seatsPerRow} seats total
                                                            </p>
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedCinema?.id === cinema.id
                                                                ? 'border-amber-500 bg-amber-500'
                                                                : 'border-gray-600'}`}>
                                                            {selectedCinema?.id === cinema.id && <Check size={14} className="text-gray-950" />}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 'schedule' && (
                            <div className="animate-fadeIn">
                                <p className="text-white font-semibold mb-4">Select Date & Showtime</p>

                                <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                                    {dates.map((d) => (
                                        <button key={d.value} onClick={() => { setSelectedDate(d.value); setSelectedShowtime(null); }} className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl text-sm transition-all duration-300 min-w-[72px] ${selectedDate === d.value
                                                ? 'bg-amber-500 text-gray-950'
                                                : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700/50'}`}>
                                            <span className="text-xs font-medium">{d.dayName}</span>
                                            <span className="font-bold">{d.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <p className="text-gray-400 text-sm mb-3">Available Showtimes at {selectedCinema?.name}</p>
                                <div className="flex gap-3 flex-wrap">
                                    {showtimes.map((st) => (
                                        <button key={st} onClick={() => setSelectedShowtime(st)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${selectedShowtime === st
                                                ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/20'
                                                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-700/50'}`}>
                                            <Clock size={14} />
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 'seats' && selectedCinema && (
                            <div className="animate-fadeIn">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-white font-semibold">Select Your Seats</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 bg-gray-700 rounded-sm border border-gray-600" />
                                            <span className="text-gray-400 text-xs">Available</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 bg-amber-500 rounded-sm" />
                                            <span className="text-gray-400 text-xs">Selected</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 bg-red-600 rounded-sm" />
                                            <span className="text-gray-400 text-xs">Taken</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full overflow-x-auto">
                                    <div className="mx-auto" style={{ minWidth: Math.max(selectedCinema.seatingLayout.seatsPerRow * 44 + 40, 300) }}>
                                        <div className="bg-gradient-to-r from-amber-600 to-amber-400 text-gray-900 rounded-t-[50%] text-center py-2 font-bold text-sm mb-5 mx-auto" style={{ width: '80%' }}>
                                            SCREEN
                                        </div>
                                        <div className="space-y-2">
                                            {selectedCinema.seatingLayout.rows.map((row) => (
                                                <div key={row} className="flex items-center gap-2">
                                                    <div className="w-6 text-gray-400 text-sm text-center font-medium">{row}</div>
                                                    <div className="flex gap-2 flex-1 justify-center">
                                                        {Array.from({ length: selectedCinema.seatingLayout.seatsPerRow }).map((_, i) => {
                                                            const id = `${row}${i + 1}`;
                                                            const isBooked = bookedSeats.includes(id);
                                                            const isSelected = selectedSeats.includes(id);
                                                            const base = 'w-9 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-200';
                                                            const className = isBooked
                                                                ? `${base} bg-red-600/80 text-red-200 cursor-not-allowed`
                                                                : isSelected
                                                                    ? `${base} bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/30 scale-105`
                                                                    : `${base} bg-gray-800 border border-gray-700 text-gray-400 hover:border-amber-500 hover:text-white cursor-pointer`;
                                                            return (
                                                                <button key={id} type="button" title={id} onClick={() => toggleSeat(id)} disabled={isBooked} className={className}>
                                                                    {i + 1}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="w-6" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {selectedSeats.length > 0 && (
                                    <div className="mt-4 bg-gray-800/40 rounded-xl p-3 flex items-center justify-between animate-fadeIn">
                                        <div>
                                            <p className="text-gray-400 text-xs">Selected: <span className="text-white font-medium">{selectedSeats.join(', ')}</span></p>
                                        </div>
                                        <p className="text-white font-bold">PKR {(selectedSeats.length * movie.price).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 'payment' && (
                            <div className="animate-fadeIn">
                                <p className="text-white font-semibold mb-4">Payment Method</p>
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <PaymentMethodCard label="Debit/Credit Card" icon={<CreditCard size={20} />} selected={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')} />
                                    <PaymentMethodCard label="JazzCash" icon={<Smartphone size={20} />} selected={paymentMethod === 'jazzcash'} onClick={() => setPaymentMethod('jazzcash')} color="red" />
                                    <PaymentMethodCard label="EasyPaisa" icon={<Smartphone size={20} />} selected={paymentMethod === 'easypaisa'} onClick={() => setPaymentMethod('easypaisa')} color="green" />
                                </div>

                                <div className="bg-gray-800/40 rounded-xl p-5 mb-5">
                                    {paymentMethod === 'card' ? (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-gray-400 text-xs font-medium mb-1.5 block">Card Number</label>
                                                <div className="relative">
                                                    {cardNumber.replace(/\D/g, '').length > 0 && (
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-6 rounded-xl bg-gray-900/80">
                                                            <img src={cardType === 'visa' ? visaLogo : cardType === 'mastercard' ? mastercardLogo : visaLogo} alt={cardType === 'visa' ? 'Visa' : cardType === 'mastercard' ? 'Mastercard' : 'Card'} className="max-w-full max-h-full object-contain" />
                                                        </div>
                                                    )}
                                                    <input type="text" maxLength={19} placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => {
                                                        const digits = e.target.value.replace(/[^\d]/g, '');
                                                        setCardNumber(formatCardNumber(digits));
                                                        setCardType(detectCardType(digits));
                                                    }} className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-xl pl-16 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">Expiry</label>
                                                    <input type="text" maxLength={5} placeholder="MM/YY" value={cardExpiry} onChange={(e) => {
                                                        const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                        let formatted = raw;
                                                        if (raw.length >= 3) formatted = raw.slice(0, 2) + '/' + raw.slice(2);
                                                        else if (raw.length === 2) formatted = raw.slice(0, 2) + '/';
                                                        setCardExpiry(formatted);
                                                    }} className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">CVV</label>
                                                    <input type="text" maxLength={4} placeholder="123" value={cardCVV} onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-gray-400 text-xs font-medium mb-1.5 block">
                                                    {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Phone Number
                                                </label>
                                                <input type="tel" maxLength={11} placeholder="03XX XXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                                                <p className={`text-xs mt-2 ${isPhoneValid ? 'text-green-400' : 'text-red-400'}`}>
                                                    {isPhoneValid ? 'Valid Pakistani mobile number.' : 'Enter a valid Pakistani number starting with 03.'}
                                                </p>
                                            </div>

                                            {!otpSent && isPhoneValid && (
                                                <button type="button" onClick={sendOtp} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300">
                                                    <MessageCircle size={16} />
                                                    Send OTP via WhatsApp
                                                </button>
                                            )}

                                            {otpSent && !isOtpVerified && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 bg-green-900/30 border border-green-700/40 rounded-xl px-3 py-2">
                                                        <MessageCircle size={14} className="text-green-400 shrink-0" />
                                                        <p className="text-green-300 text-xs">OTP sent via <span className="font-semibold">WhatsApp</span> to {phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')}. Check your WhatsApp messages.</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-gray-400 text-xs font-medium mb-1.5 block">Enter OTP</label>
                                                        <input type="text" maxLength={6} placeholder="123456" value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                                                        {otpError && <p className="text-red-400 text-xs mt-2">{otpError}</p>}
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <button type="button" onClick={verifyOtp} className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold px-4 py-2 rounded-xl transition-all duration-300">
                                                            Confirm OTP
                                                        </button>
                                                        <button type="button" disabled={otpResendSeconds > 0} onClick={sendOtp} className={`flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition-all duration-300 ${otpResendSeconds > 0 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-900 border border-green-600 text-green-400 hover:bg-green-600/10'}`}>
                                                            {otpResendSeconds > 0 ? `Resend in ${otpResendSeconds}s` : <><MessageCircle size={14} /> Resend via WhatsApp</>}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {otpSent && isOtpVerified && (
                                                <p className="text-green-400 text-xs">OTP verified. You can complete your purchase.</p>
                                            )}

                                            <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                                                <MessageCircle size={12} className="text-green-500" />
                                                OTP will be delivered to your WhatsApp. A payment request will then be sent to your {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} account.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-800/40 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <RefreshCw size={16} className="text-green-400" />
                                        <div>
                                            <p className="text-white text-sm font-medium">Refundable Ticket</p>
                                            <p className="text-gray-500 text-xs">Refund available until 1 day before showtime</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsRefundable(!isRefundable)} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isRefundable ? 'bg-green-500' : 'bg-gray-700'}`}>
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${isRefundable ? 'left-[26px]' : 'left-0.5'}`} />
                                    </button>
                                </div>

                                <div className="mt-5 bg-gray-900/60 rounded-xl p-4 border border-gray-800/50">
                                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-3 font-medium">Order Summary</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Cinema</span>
                                            <span className="text-white">{selectedCinema?.name}, {selectedCinema?.city}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Date & Time</span>
                                            <span className="text-white">{selectedDate} · {selectedShowtime}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Seats</span>
                                            <span className="text-white">{selectedSeats.join(', ')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Payment</span>
                                            <span className="text-white capitalize">{paymentMethod === 'card' ? 'Debit/Credit Card' : paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'}</span>
                                        </div>
                                        <div className="border-t border-gray-800 pt-2 mt-2 flex justify-between">
                                            <span className="text-white font-semibold">Total</span>
                                            <span className="text-amber-400 font-bold text-lg">PKR {(selectedSeats.length * movie.price).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {error && <p className="text-red-400 text-sm mt-3 animate-fadeIn">{error}</p>}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800/50">
                {step !== 'cinema' ? (
                    <button onClick={goBack} disabled={submitting} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-all duration-300 disabled:opacity-50">
                        <ChevronLeft size={16} />
                        Back
                    </button>
                ) : <div />}
                
                <button onClick={goNext} disabled={!canProceed() || submitting} className={`flex items-center gap-2 font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-300 ${canProceed()
                        ? step === 'payment'
                            ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02]'
                            : 'bg-amber-500 hover:bg-amber-400 text-gray-950 hover:shadow-lg hover:shadow-amber-500/25'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'} ${submitting ? 'opacity-70' : ''}`}>
                    {submitting ? 'Processing...' : step === 'payment' ? (
                        <>
                            <CreditCard size={15} />
                            Confirm & Pay
                        </>
                    ) : (
                        <>
                            Continue
                            <ChevronRight size={16} />
                        </>
                    )}
                </button>
            </div>
        </Overlay>
    );
}

function PaymentMethodCard({ label, icon, selected, onClick, color = 'amber' }: {
    label: string;
    icon: React.ReactNode;
    selected: boolean;
    onClick: () => void;
    color?: 'amber' | 'red' | 'green';
}) {
    const colorMap = {
        amber: 'border-amber-500/50 bg-amber-500/10',
        red: 'border-red-500/50 bg-red-500/10',
        green: 'border-green-500/50 bg-green-500/10',
    };
    const iconColorMap = {
        amber: 'text-amber-400',
        red: 'text-red-400',
        green: 'text-green-400',
    };

    return (
        <button onClick={onClick} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${selected
                ? `${colorMap[color]} shadow-lg`
                : 'border-gray-700/50 bg-gray-800/40 hover:border-gray-600'}`}>
            <div className={selected ? iconColorMap[color] : 'text-gray-400'}>{icon}</div>
            <p className={`text-xs font-medium text-center ${selected ? 'text-white' : 'text-gray-400'}`}>{label}</p>
        </button>
    );
}

function Overlay({ children, onClose }: {
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-fadeIn" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10">
                    <X size={20} />
                </button>
                <h2 className="text-white font-bold text-lg mb-5">Book Ticket</h2>
                {children}
            </div>
        </div>
    );
}
