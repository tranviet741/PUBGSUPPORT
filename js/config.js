const MORTAR_MIN = 121;
const MORTAR_MAX = 700;
const PUBG_BASE = "https://raw.githubusercontent.com/pubg/api-assets/master/Assets/Maps";
const PUBG_HD = "https://media.githubusercontent.com/media/pubg/api-assets/master/Assets/Maps";

function pubgUrls(prefix) {
  return {
    imgLow: `${PUBG_BASE}/${prefix}_Main_Low_Res.png`,
    imgHigh: `${PUBG_HD}/${prefix}_Main_High_Res.png`,
  };
}

const MAPS = [
  { id: "erangel", name: "Erangel", sizeM: 8000, prefix: "Erangel", ...pubgUrls("Erangel") },
  { id: "miramar", name: "Miramar", sizeM: 8000, prefix: "Miramar", ...pubgUrls("Miramar") },
  { id: "sanhok", name: "Sanhok", sizeM: 4000, prefix: "Sanhok", ...pubgUrls("Sanhok") },
  { id: "vikendi", name: "Vikendi", sizeM: 6000, prefix: "Vikendi", ...pubgUrls("Vikendi") },
  { id: "karakin", name: "Karakin", sizeM: 2000, prefix: "Karakin", ...pubgUrls("Karakin") },
  { id: "taego", name: "Taego", sizeM: 8000, prefix: "Taego", ...pubgUrls("Taego") },
  { id: "deston", name: "Deston", sizeM: 8000, prefix: "Deston", ...pubgUrls("Deston") },
  { id: "rondo", name: "Rondo", sizeM: 8000, prefix: "Rondo", ...pubgUrls("Rondo") },
];

const SECRET_ROOMS = {
  erangel: [
    { name: "NW Stalber (FI)", u: 0.82, v: 0.10 },
    { name: "NW Georgopol (BJ)", u: 0.18, v: 0.14 },
    { name: "S Severny (EJ)", u: 0.50, v: 0.22 },
    { name: "E Tasnaka (GK)", u: 0.58, v: 0.38 },
    { name: "E Georgopol (CK)", u: 0.24, v: 0.22 },
    { name: "W Museum (FL)", u: 0.28, v: 0.42 },
    { name: "S Hospital (BL)", u: 0.33, v: 0.65 },
    { name: "NW Pochinki (CL)", u: 0.42, v: 0.50 },
    { name: "W Farm (EM)", u: 0.48, v: 0.72 },
    { name: "E Mylta (GM)", u: 0.72, v: 0.62 },
    { name: "N Ferry Pier (CN)", u: 0.38, v: 0.82 },
    { name: "NW Primorsk (BN)", u: 0.06, v: 0.55 },
    { name: "N Military Base (EN)", u: 0.75, v: 0.75 },
    { name: "W Military Base (EO)", u: 0.68, v: 0.82 },
    { name: "E Military Base (FO)", u: 0.85, v: 0.80 },
  ],
  taego: [
    { name: "#1 Wolong — NW góc nhà", u: 0.08, v: 0.12 },
    { name: "#2 Đường đất phía Bắc", u: 0.15, v: 0.10 },
    { name: "#3 Nam đồi lớn", u: 0.30, v: 0.18 },
    { name: "#4 Nhà cực Nam trên đồi", u: 0.38, v: 0.22 },
    { name: "#5 Đồi cây — khó thấy từ Nam", u: 0.48, v: 0.16 },
    { name: "#6 Nam Sân bay — ngã ba", u: 0.58, v: 0.30 },
    { name: "#7 Đông sông — góc NE", u: 0.75, v: 0.14 },
    { name: "#8 Nhà cô đơn ven đường", u: 0.82, v: 0.28 },
    { name: "#9 Đảo — nhà duy nhất", u: 0.85, v: 0.38 },
    { name: "#10 Ven đường nhựa — nhà nhỏ", u: 0.70, v: 0.45 },
    { name: "#11 Nhà hàng rào thấp", u: 0.62, v: 0.55 },
    { name: "#12 Sau cửa hàng cũ — Đông", u: 0.78, v: 0.58 },
    { name: "#13 Ruộng — nhà lớn hơn", u: 0.68, v: 0.68 },
    { name: "#14 Ngã tư — xa đường chính", u: 0.52, v: 0.75 },
    { name: "#15 Đông đường — gần nước", u: 0.76, v: 0.82 },
  ],
  deston: [
    { name: "Ten Forts — phía Nam", u: 0.55, v: 0.22 },
    { name: "Carpenter's End — trung tâm", u: 0.38, v: 0.28 },
    { name: "Buxley — NW", u: 0.22, v: 0.32 },
    { name: "Turrita — phía Bắc", u: 0.48, v: 0.15 },
    { name: "Barclift — phía Đông", u: 0.62, v: 0.42 },
    { name: "Sancarna — NE", u: 0.72, v: 0.35 },
    { name: "Ripton — phía Bắc", u: 0.35, v: 0.48 },
    { name: "Wind Farm — Bắc cầu", u: 0.58, v: 0.08 },
    { name: "Concert — trung tâm", u: 0.42, v: 0.52 },
    { name: "Holston Meadows — trung tâm", u: 0.52, v: 0.62 },
    { name: "Cavala — phía Bắc", u: 0.78, v: 0.55 },
    { name: "El Koro / Lodge — hầm ngầm", u: 0.18, v: 0.58 },
  ],
  vikendi: [
    { name: "Cosmodrome — Security Lab", u: 0.72, v: 0.18 },
    { name: "Volnova — Security Lab", u: 0.35, v: 0.42 },
    { name: "Cement Factory — Security Lab", u: 0.55, v: 0.55 },
    { name: "Dobro Mesto — Security Lab", u: 0.22, v: 0.62 },
    { name: "Train Yard — Security Lab", u: 0.48, v: 0.72 },
  ],
};

const BUNKER_MAP_IMAGES = {
  erangel: { name: "Erangel", image: "img/Erangel.png" },
  miramar: { name: "Miramar", image: "img/miramar.png" },
  taego: { name: "Taego", image: "img/taego.png" },
  vikendi: { name: "Vikendi", image: "img/vikendi.png" },
  paramo: { name: "Paramo", image: "img/paramo.png" },
  deston: { name: "Deston", image: "img/mapdeston.png" },
  rondo: { name: "Rondo", image: "img/rondo.jpg" },
};
