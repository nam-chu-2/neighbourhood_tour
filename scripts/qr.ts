import QRCode from "qrcode";

// Generates qr.png for the deployed site so passengers can open it once on
// Wi-Fi before the drive (README "Deploy"). Usage:
//   npm run qr -- https://<user>.github.io/neighbourhood_tour/
//   QR_URL=https://… npm run qr

const url = process.argv[2] ?? process.env.QR_URL;

if (!url || !/^https?:\/\//.test(url)) {
  console.error(
    "Pass the deployed URL:\n" +
      "  npm run qr -- https://<user>.github.io/neighbourhood_tour/\n" +
      "or set QR_URL.",
  );
  process.exit(1);
}

await QRCode.toFile("qr.png", url, {
  width: 1024,
  margin: 2,
  color: { dark: "#1b3a2f", light: "#fdfbf5" },
});
console.log(`qr.png → ${url}`);
