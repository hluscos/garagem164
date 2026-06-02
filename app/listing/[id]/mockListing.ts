export const mockListing = {
  id: "1",

  type: "raffle",

  title: "Ferrari F40 LM",

  description:
    "Ferrari F40 LM Inno64 em excelente estado. Inclui caixa original e todos os acessórios.",

  currentBid: 72,
  
  price: 95,

  raffle: {
  ticketPrice: 1,

  totalTickets: 99,

  soldTickets: [3, 7, 12, 18, 25, 44, 55],

  reservedTickets: [9, 15, 22],

  maxTicketsPerUser: 10,
},

  auction: {
    days: 2,
    hours: 14,
    minutes: 37,
  },

  seller: {
    name: "Garagem164 Collector",
    rating: 4.9,
    sales: 127,
    memberSince: "2024",
  },

  details: {
    brand: "Inno64",
    model: "Ferrari F40 LM",
    scale: "1:64",
    condition: "Novo",
    box: "Original",
    location: "Porto",
  },

  images: [
    "https://placehold.co/1200x800",
    "https://placehold.co/1200x800?text=2",
    "https://placehold.co/1200x800?text=3",
    "https://placehold.co/1200x800?text=4",
    "https://placehold.co/1200x800?text=5",
  ],

  bids: [
    {
      user: "Collector_92",
      amount: 72,
    },
    {
      user: "DiecastPT",
      amount: 71,
    },
    {
      user: "MiniGarage",
      amount: 70,
    },
  ],
};