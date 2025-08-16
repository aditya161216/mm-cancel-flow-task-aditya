export type StartResp = {
  subscriptionId: string;
  priceCents: number;
  variant: 'A' | 'B' | null; // null until user chooses "Not yet"
};

export type AssignResp = {
  variant: 'A' | 'B';
  priceCents: number;
  offerCents: number; // server-calculated offer
};

export type DecideResp = { status: 'active' | 'cancelled' };

// export function formatCents(c: number) {
//   return `$${(c / 100).toFixed(2)}`;
// }