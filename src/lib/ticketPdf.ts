import { jsPDF } from 'jspdf';
import type { Ticket, Movie, Cinema } from '../types';
export function downloadTicketPdf(ticket: Ticket, movie: Movie, cinema: Cinema, _userName: string, _userEmail: string) {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [390, 700],
    });
    const pageW = 700;
    const pageH = 390;
    const orange = [245, 158, 11];
    doc.setFillColor(15, 17, 28);
    doc.roundedRect(20, 20, pageW - 40, pageH - 40, 14, 14, 'F');
    doc.setFillColor(orange[0], orange[1], orange[2]);
    doc.roundedRect(20, 20, 120, pageH - 40, 14, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text('CineVista', 160, 58);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(210, 210, 210);
    doc.text('Premium Cinema Experience', 160, 76);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(34);
    doc.setTextColor(orange[0], orange[1], orange[2]);
    doc.text('CINEMA TICKET', 160, 120);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('ADMIT ONE', 160, 145);
    let detailY = 170;
    const drawDetail = (label: string, value: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(orange[0], orange[1], orange[2]);
        doc.text(label, 160, detailY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text(value, 160, detailY + 14);
        detailY += 24;
    };
    drawDetail('Movie', movie.title);
    drawDetail('Cinema', cinema.name);
    drawDetail('City', cinema.city);
    drawDetail('Date', ticket.showDate);
    drawDetail('Time', ticket.showtime ?? 'N/A');
    drawDetail('Seat', ticket.seatNumbers?.join(', ') ?? 'N/A');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(orange[0], orange[1], orange[2]);
    doc.text('TOTAL', 160, detailY + 18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(`PKR ${ticket.totalPrice.toLocaleString()}`, 250, detailY + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('Present this ticket at the cinema entrance.', 160, pageH - 40);
    doc.text('Enjoy your movie at CineVista.', 160, pageH - 24);
    doc.save(`cinevista-ticket-${ticket.id}.pdf`);
}
