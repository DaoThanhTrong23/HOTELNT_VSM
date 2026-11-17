import {
  Wifi, WavesLadder, Waves, Car, SquareParking, Dumbbell, UtensilsCrossed, Coffee, AirVent, Tv,
  Bath, Refrigerator, WashingMachine, ConciergeBell, Umbrella, TreePalm, ShoppingBag, ShoppingCart,
  Landmark, Hospital, Plane, Bus, Store, Baby, PawPrint, CigaretteOff, Flower2, ArrowUpDown,
  Mountain, Wine, Bike, Film, KeyRound, ShieldCheck, Clock, Croissant, Church, School, Fuel, Ship,
  Fish, CheckCircle2,
} from 'lucide-react';

// Map từ khóa icon (backend lưu ở cột icon) sang icon lucide.
const ICONS = {
  wifi: Wifi, internet: Wifi,
  pool: WavesLadder, swimmingpool: WavesLadder, hoboi: WavesLadder,
  beach: Waves, sea: Waves, bien: Waves, waves: Waves,
  parking: SquareParking, car: Car, baidoxe: SquareParking, oto: Car,
  gym: Dumbbell, fitness: Dumbbell,
  restaurant: UtensilsCrossed, nhahang: UtensilsCrossed, utensils: UtensilsCrossed,
  breakfast: Croissant, buasang: Croissant,
  coffee: Coffee, cafe: Coffee, caphe: Coffee,
  aircon: AirVent, airconditioner: AirVent, dieuhoa: AirVent, maylanh: AirVent,
  tv: Tv, tivi: Tv,
  bathtub: Bath, bath: Bath, bontam: Bath,
  fridge: Refrigerator, tulanh: Refrigerator,
  laundry: WashingMachine, giatui: WashingMachine,
  reception: ConciergeBell, letan: ConciergeBell, roomservice: ConciergeBell,
  umbrella: Umbrella, palm: TreePalm, resort: TreePalm,
  shopping: ShoppingBag, mall: ShoppingBag, market: ShoppingCart, cho: ShoppingCart,
  landmark: Landmark, museum: Landmark, hospital: Hospital, benhvien: Hospital,
  airport: Plane, sanbay: Plane, bus: Bus, store: Store, convenience: Store,
  kids: Baby, baby: Baby, pet: PawPrint, thucung: PawPrint,
  nosmoking: CigaretteOff, spa: Flower2, elevator: ArrowUpDown, thangmay: ArrowUpDown,
  view: Mountain, mountain: Mountain, bar: Wine, bike: Bike, xedap: Bike, cinema: Film,
  key: KeyRound, security: ShieldCheck, baove: ShieldCheck, '24h': Clock, clock: Clock,
  church: Church, nhatho: Church, school: School, gas: Fuel, port: Ship, cang: Ship, fish: Fish,
};

// Dự phòng: đoán icon theo tên tiện ích tiếng Việt khi backend không gửi icon key.
const NAME_RULES = [
  [/wi-?fi|internet/i, Wifi], [/hồ bơi|bể bơi/i, WavesLadder], [/biển|bãi tắm/i, Waves],
  [/đỗ xe|gửi xe|ô tô|parking/i, SquareParking], [/gym|thể hình/i, Dumbbell],
  [/bữa sáng|buffet/i, Croissant], [/nhà hàng|ăn uống/i, UtensilsCrossed], [/cà phê|cafe/i, Coffee],
  [/điều hòa|máy lạnh/i, AirVent], [/tivi|tv/i, Tv], [/bồn tắm/i, Bath], [/tủ lạnh/i, Refrigerator],
  [/giặt/i, WashingMachine], [/lễ tân|phục vụ phòng/i, ConciergeBell], [/spa|massage/i, Flower2],
  [/thang máy/i, ArrowUpDown], [/thú cưng/i, PawPrint], [/trẻ em/i, Baby], [/hút thuốc/i, CigaretteOff],
  [/sân bay/i, Plane], [/bến xe|xe buýt/i, Bus], [/chợ|siêu thị/i, ShoppingCart],
  [/trung tâm thương mại|mua sắm/i, ShoppingBag], [/bệnh viện/i, Hospital],
  [/nhà thờ|chùa|tháp/i, Church], [/bảo tàng|di tích/i, Landmark], [/cảng/i, Ship],
  [/bar|pub/i, Wine], [/xe đạp/i, Bike], [/an ninh|bảo vệ/i, ShieldCheck], [/24\/?7|24h/i, Clock],
];

const normalizeKey = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export const AmenityIcon = ({ icon, name, size = 18, className = '' }) => {
  if (typeof icon === 'string' && /^(https?:\/\/|\/|data:image)/i.test(icon)) {
    return <img src={icon} alt="" width={size} height={size} className={`object-contain ${className}`} />;
  }
  const Icon =
    ICONS[normalizeKey(icon)] ||
    NAME_RULES.find(([re]) => re.test(name || ''))?.[1] ||
    CheckCircle2;
  return <Icon size={size} className={className} aria-hidden="true" />;
};
