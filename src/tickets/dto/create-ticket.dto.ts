export class CreateTicketDto {
  title: string;
  description: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source?: string; // e.g., WHATSAPP, WEBSITE, EMAIL
  customer?: { name: string; email: string; phone?: string; company?: string };
}