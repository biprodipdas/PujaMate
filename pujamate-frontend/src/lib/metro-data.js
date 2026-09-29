// Kolkata Metro operational network snapshot used by PujaMate.
// 58 stations across the 5 operating lines: Blue, Green, Purple, Yellow, Orange.
// 2026 operational snapshot: 58 stations across Blue, Green, Purple, Yellow and Orange. Coordinates are used only for client-side nearby-pandal distance calculations. Orange Line coordinates were cross-checked against current map/OSM-backed station references.
export const METRO_LINES = [
  { id: 'blue', name: 'Blue Line', emoji: '🔵', stations: [
    ['Dakshineswar',22.653971,88.363724],['Baranagar',22.653529,88.378873],['Noapara',22.63972,88.39389],['Dum Dum',22.62111,88.39278],['Belgachia',22.60583,88.38639],['Shyambazar',22.601313,88.372586],['Shobhabazar Sutanuti',22.596029,88.365285],['Girish Park',22.587143,88.363083],['Mahatma Gandhi Road',22.580858,88.361401],['Central',22.57247,88.358788],['Chandni Chowk',22.566796,88.354137],['Esplanade',22.56444,88.35167],['Park Street',22.555,88.35028],['Maidan',22.54944,88.34889],['Rabindra Sadan',22.54139,88.34722],['Netaji Bhavan',22.53333,88.34611],['Jatin Das Park',22.524262,88.346489],['Kalighat',22.516652,88.346003],['Rabindra Sarobar',22.50722,88.34556],['Mahanayak Uttam Kumar',22.49472,88.345],['Netaji',22.480976,88.346],['Masterda Surya Sen',22.473521,88.360871],['Gitanjali',22.469426,88.369985],['Kavi Nazrul',22.464172,88.380555],['Shahid Khudiram',22.465972,88.39167],['Kavi Subhash',22.47194,88.39806]
  ]},
  { id: 'green', name: 'Green Line', emoji: '🟢', stations: [
    ['Howrah Maidan',22.581998,88.332994],['Howrah',22.584454,88.340578],['Mahakaran',22.571189,88.350106],['Esplanade',22.56444,88.35167],['Sealdah',22.567207,88.371497],['Phoolbagan',22.57214,88.390282],['Salt Lake Stadium',22.57306,88.40306],['Bengal Chemical',22.580076,88.401283],['City Center',22.587069,88.407875],['Central Park',22.590437,88.415605],['Karunamoyee',22.586435,88.421515],['Salt Lake Sector V',22.581318,88.429822]
  ]},
  { id: 'purple', name: 'Purple Line', emoji: '🟣', stations: [
    ['Joka',22.452244,88.301751],['Thakurpukur',22.464261,88.307555],['Sakher Bazar',22.474611,88.309991],['Behala Chowrasta',22.487529,88.313426],['Behala Bazar',22.498929,88.317354],['Taratala',22.508165,88.320563],['Majerhat',22.5191,88.3234]
  ]},
  { id: 'yellow', name: 'Yellow Line', emoji: '🟡', stations: [
    ['Noapara',22.63972,88.39389],['Dum Dum Cantonment',22.638,88.4123],['Jessore Road',22.6395137,88.4297765],['Jai Hind (Airport)',22.64619,88.43591]
  ]},
  { id: 'orange', name: 'Orange Line', emoji: '🟠', stations: [
    ['Kavi Subhash',22.47194,88.39806],['Satyajit Ray',22.4846,88.3926],['Jyotirindra Nandi',22.495915,88.398667],['Kavi Sukanta',22.505262,88.400996],['Hemanta Mukhopadhyay',22.514777,88.401469],['VIP Bazar',22.52469,88.39623],['Ritwik Ghatak',22.53299,88.39646],['Barun Sengupta',22.54381,88.39928],['Beleghata',22.550703,88.404094]
  ]}
];

export const flattenStations = () => METRO_LINES.flatMap(line => line.stations.map(([name,lat,lng], index) => ({ id: `${line.id}-${index}`, name, lat, lng, lineId: line.id, lineName: line.name, emoji: line.emoji, order: index })));

export function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
