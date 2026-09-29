// Kolkata bus routes for PujaMate. Route/stage names are based on WBTC's
// published intra-city route list. Stop coordinates are map-matched points used
// only for pandal-radius calculations; the stop name list is the route reference.
// Source: WBTC Intra City RTS route list (published PDF).
export const BUS_ROUTES = [
  { id:'s17a', name:'S-17A', from:'Ariadaha', to:'Kudghat / Kundghat', source:'WBTC', stops:[
    ['Ariadaha',22.6700,88.3660],['Dakshineswar',22.6539,88.3637],['Alambazar',22.6408,88.3685],['Bonhooghly',22.6315,88.3750],['Baranagar Bazar',22.6420,88.3750],['Cossipore',22.6194,88.3775],['Bag Bazar',22.6030,88.3667],['Sovabazar',22.5960,88.3653],['M.G. Road Jn.',22.5809,88.3614],['B.B.D. Bag',22.5697,88.3470],['Esplanade',22.5645,88.3515],['Park Street',22.5550,88.3503],['Elgin Road',22.5400,88.3490],['Hazra Road',22.5220,88.3470],['Tollygunge Phari',22.5000,88.3460],['Tollygunge Tram Depot',22.4980,88.3450],['Chandi Ghosh',22.4895,88.3470],['Kudghat',22.4790,88.3615]
  ]},
  { id:'s21', name:'S-21', from:'Garia', to:'Baghbazar', source:'WBTC', stops:[
    ['Garia',22.4670,88.3690],['Patuli P.S.',22.4730,88.3800],['Peerless Hospital',22.4890,88.3910],['Ajoynagar',22.5010,88.3890],['Kalikapur',22.5090,88.3910],['Ruby',22.5135,88.3975],['HUDCO',22.5750,88.3970],['Khanna',22.6000,88.3830],['Shyambazar',22.6013,88.3726],['Baghbazar',22.6030,88.3667]
  ]},
  { id:'s10', name:'S-10', from:'Airport', to:'Nabanna', source:'WBTC', stops:[
    ['Airport Gate 3',22.6500,88.4460],['Airport Gate 1',22.6520,88.4390],['Central Jail',22.6420,88.4270],['Nager Bazar',22.6460,88.4140],['Dum Dum Station',22.6230,88.3740],['Chiria More',22.6150,88.3830],['Paikpara Xing',22.6100,88.3760],['Shyam Bazar',22.6013,88.3726],['Grey Street',22.5920,88.3710],['Vivekananda Road',22.5860,88.3680],['M.G. Road',22.5809,88.3614],['Colutala Street',22.5750,88.3560],['B.B. Ganguly Xing',22.5700,88.3550],['Esplanade',22.5645,88.3515],['Mayo Road',22.5590,88.3500],['PTS',22.5500,88.3500],['Nabanna',22.5840,88.2880]
  ]},
  { id:'s16', name:'S-16', from:'Thakurpukur', to:'Salt Lake', source:'WBTC', stops:[
    ['Thakurpukur 3A Bus Stand',22.4680,88.3030],['Thakurpukur Bazar',22.4740,88.3030],['Silpara',22.4820,88.3060],['Chowrasta',22.4875,88.3134],['Manton',22.4960,88.3140],['Behala Tram Depot',22.4990,88.3150],['Taratala More',22.5057,88.3197],['Mominpore',22.5200,88.3210],['Khiddirpur',22.5350,88.3230],['Water Gate',22.5480,88.3280],['Esplanade',22.5645,88.3515],['Subodh Mullick Square',22.5680,88.3570],['Moulali',22.5586,88.3652],['Sealdah',22.5672,88.3715],['Rajabazar',22.5830,88.3750],['Manicktala',22.5890,88.3800],['Kankurgachi',22.5850,88.3930],['Hudco',22.5750,88.3970],['Karunamoyee',22.5864,88.4215]
  ]},
  { id:'s22', name:'S-22', from:'Karunamoyee', to:'Sakuntala Park', source:'WBTC', stops:[
    ['Karunamoyee',22.5864,88.4215],['College More / SDF',22.5810,88.4380],['Nicco Park',22.5740,88.4020],['Science City',22.5465,88.3985],['Ruby',22.5135,88.3975],['Kasba P.S.',22.5230,88.3760],['Gariahat',22.5200,88.3670],['R.B. Avenue',22.5270,88.3650],['Chetla',22.5095,88.3330],['New Alipore',22.5100,88.3260],['Taratala Xing',22.5057,88.3197],['Behala Chowrasta',22.4875,88.3134],['Manton',22.4960,88.3140],['Nutan Para',22.4920,88.3100],['Bakultala',22.4840,88.3060],['Sakuntala Park',22.4735,88.2945]
  ]},
  { id:'s24', name:'S-24', from:'Kamalgazi', to:'Howrah', source:'WBTC', stops:[
    ['Kamalgazi',22.4420,88.3940],['Patuli',22.4740,88.3810],['Ajoynagar',22.5010,88.3890],['Kalikapur',22.5090,88.3910],['Ruby',22.5135,88.3975],['Panchanan Gram',22.5200,88.4100],['EM Bypass / Topsia',22.5480,88.3920],['Moulali',22.5586,88.3652],['S.N. Banerjee Road',22.5590,88.3550],['Esplanade',22.5645,88.3515],['B.B.D. Bag',22.5697,88.3470],['Burrabazar',22.5790,88.3470],['Howrah Station',22.5830,88.3426]
  ]},
];

export function distanceKm(lat1, lon1, lat2, lon2) {
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
