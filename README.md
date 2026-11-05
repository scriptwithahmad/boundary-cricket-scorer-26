# Boundary

Run `npm install`, then `npm start` to start the LAN server for Expo Go.
Keep the phone and computer on the same Wi-Fi and scan the new terminal QR code.
This project uses Expo SDK 58; the installed Expo Go app must support SDK 58.

- `npm run dev:clear`: rebuild the Metro cache after dependency changes. The first bundle will be slower.
- `npm run dev:tunnel`: fallback when Wi-Fi isolation or Windows Firewall prevents LAN access. Tunnel reloads can be slower.
- `npm run build:web`: export the browser app.

If the phone cannot connect, open `http://<computer-Wi-Fi-IP>:8081/status`
in its browser. The expected response is `packager-status:running`.
If it does not load, check the network and Windows Firewall access for Node.js.
If it loads but Expo Go rejects the project, check the Expo Go SDK version or the
error shown in Metro. A successful web build alone does not verify Expo Go support.
