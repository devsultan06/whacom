export interface OrderItem {
  id: string;
  customer: string;
  phone: string;
  items: string;
  amount: string;
  payment: "Paid" | "Pending";
  status: string;
  time: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  sales: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  orders: number;
  spent: string;
  city: string;
  lastOrder: string;
}

export interface ExpenseItem {
  id: string;
  desc: string;
  category: string;
  amount: string;
  date: string;
  status: string;
}

export interface InvoiceItem {
  id: string;
  client: string;
  desc: string;
  amount: string;
  date: string;
  status: "Paid" | "Sent" | "Draft";
}

export const salesDataWeek = [
  { day: "Mon", value: 92000, orders: 14 },
  { day: "Tue", value: 112000, orders: 19 },
  { day: "Wed", value: 98000, orders: 16 },
  { day: "Thu", value: 156000, orders: 24 },
  { day: "Fri", value: 141000, orders: 22 },
  { day: "Sat", value: 185400, orders: 32 },
  { day: "Sun", value: 167000, orders: 28 },
];

export const categoryData = [
  { name: "Footwear", revenue: 420000 },
  { name: "Apparel", revenue: 295000 },
  { name: "Accessories", revenue: 236400 },
];

export const initialOrders: OrderItem[] = [
  {
    id: "#1048",
    customer: "Aisha Bello",
    phone: "+234 803 441 9021",
    items: "Black Sneakers (sz 42) × 2",
    amount: "₦90,000",
    payment: "Paid",
    status: "Processing",
    time: "09:42 AM",
  },
  {
    id: "#1047",
    customer: "Emeka Okafor",
    phone: "+234 812 889 0044",
    items: "Classic Canvas Tote × 1",
    amount: "₦32,000",
    payment: "Paid",
    status: "Ready",
    time: "08:15 AM",
  },
  {
    id: "#1046",
    customer: "Tomi Adeyemi",
    phone: "+234 809 332 1199",
    items: "Premium Linen Shirt (L) × 1",
    amount: "₦28,500",
    payment: "Pending",
    status: "Awaiting payment",
    time: "Yesterday",
  },
  {
    id: "#1045",
    customer: "Mariam Musa",
    phone: "+234 905 771 2233",
    items: "Canvas Belt (Brown) × 2",
    amount: "₦18,000",
    payment: "Paid",
    status: "Dispatched",
    time: "Yesterday",
  },
  {
    id: "#1044",
    customer: "Chidi Nnamdi",
    phone: "+234 802 665 4411",
    items: "Silk Printed Scarf × 1",
    amount: "₦15,000",
    payment: "Paid",
    status: "Delivered",
    time: "2 days ago",
  },
];

export const initialProducts: ProductItem[] = [
  {
    id: "1",
    name: "Black Sneakers",
    category: "Footwear",
    price: "₦45,000",
    stock: 42,
    sales: 128,
    status: "In Stock",
  },
  {
    id: "2",
    name: "Premium Linen Shirt",
    category: "Apparel",
    price: "₦28,500",
    stock: 3,
    sales: 84,
    status: "Low Stock",
  },
  {
    id: "3",
    name: "Classic Canvas Tote",
    category: "Accessories",
    price: "₦32,000",
    stock: 8,
    sales: 62,
    status: "Low Stock",
  },
  {
    id: "4",
    name: "Canvas Belt (Brown)",
    category: "Accessories",
    price: "₦9,000",
    stock: 56,
    sales: 210,
    status: "In Stock",
  },
];

export const initialCustomers: CustomerItem[] = [
  {
    id: "c1",
    name: "Aisha Bello",
    phone: "+234 803 441 9021",
    orders: 3,
    spent: "₦142,000",
    city: "Lagos (Lekki)",
    lastOrder: "Today",
  },
  {
    id: "c2",
    name: "Emeka Okafor",
    phone: "+234 812 889 0044",
    orders: 4,
    spent: "₦118,500",
    city: "Abuja",
    lastOrder: "Today",
  },
  {
    id: "c3",
    name: "Tomi Adeyemi",
    phone: "+234 809 332 1199",
    orders: 1,
    spent: "₦28,500",
    city: "Port Harcourt",
    lastOrder: "Yesterday",
  },
  {
    id: "c4",
    name: "Mariam Musa",
    phone: "+234 905 771 2233",
    orders: 2,
    spent: "₦36,000",
    city: "Lagos (Ikeja)",
    lastOrder: "Yesterday",
  },
];

export const initialExpenses: ExpenseItem[] = [
  {
    id: "e1",
    desc: "Lagos Dispatch Logistics Batch #4",
    category: "Logistics",
    amount: "₦14,500",
    date: "Today",
    status: "Settled",
  },
  {
    id: "e2",
    desc: "Packaging Kraft Bags (500 units)",
    category: "Packaging",
    amount: "₦38,000",
    date: "22 Aug",
    status: "Settled",
  },
  {
    id: "e3",
    desc: "WhatsApp Bot API Server Hosting",
    category: "Software",
    amount: "₦12,000",
    date: "18 Aug",
    status: "Settled",
  },
];

export const initialInvoices: InvoiceItem[] = [
  {
    id: "INV-2026-004",
    client: "Heritage Capital Partners",
    desc: "Corporate Gift Hampers × 10",
    amount: "₦450,000",
    date: "24 Aug 2026",
    status: "Sent",
  },
  {
    id: "INV-2026-003",
    client: "Aisha Bello",
    desc: "Bulk Order Delivery",
    amount: "₦90,000",
    date: "24 Aug 2026",
    status: "Paid",
  },
  {
    id: "INV-2026-002",
    client: "Design Theory Studios",
    desc: "Editorial Uniform Fitting",
    amount: "₦185,000",
    date: "20 Aug 2026",
    status: "Paid",
  },
];
