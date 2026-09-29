🪔 PujaMate   
Your Complete Durga Puja Companion   
PujaMate is a web-based Durga Puja discovery and planning platform designed to help people explore pandals, plan their Puja trips, find travel information, and share their Puja experiences. Instead of using multiple sources to search for pandals, routes, transport information, crowd updates, and Puja experiences, PujaMate brings these features together in one place.   

🌟 What is PujaMate?   
Durga Puja is one of the biggest festivals in Kolkata and West Bengal. During Puja, people often visit multiple pandals in a single day, which makes planning the journey difficult. PujaMate is built to make that experience easier.   

With PujaMate, users can:   

🔎 Discover Durga Puja pandals   

🗺️ Explore pandals on an interactive map   

📍 Find nearby pandals using location   

🧭 Plan a multi-pandal route   

🚇 Explore Metro routes and nearby pandals   

🚌 Explore Bus routes and stops   

👥 Check community-based crowd reports   

📸 Share Puja photos with the community   

❤️ Save favourite pandals   

📍 Mark pandals as visited   

✍️ Read and share Puja stories   

➕ Suggest missing pandals   

🚻 Find important facilities near pandals   

🍴 Explore nearby food options   

📱 Install the application as a PWA   

🚀 Key Features   
🗺️ 1. Pandal Explorer   
Discover Durga Puja pandals through an interactive map. Users can explore pandals by location/area and view important information such as:   

Pandal name & Location   

Description & Photos   

Rating & Crowd information   

Nearby facilities & Transport info   

PujaMate is designed with a Kolkata-first, Bengal-wide exploration approach, allowing users to explore Kolkata and other supported areas.   

📍 2. Near Me & Explore Mode   
Users can choose between two ways to explore:   

Near Me: If location permission is enabled, find nearby pandals based on your current location.   

Explore Mode: Location permission is not required. Manually select an area and browse available pandals even when location access is unavailable.

🧭 3. Route Planner
Plan a complete Puja-hopping journey using our multi-stop route planner:

Plaintext
Start ➔ Stop 1 ➔ Stop 2 ➔ Stop 3 ➔ Destination
The route planner supports different travel modes: 🚶 Walking | 🚗 Driving | 🚲 Cycling | 🚇 Transit.

🚇 4. Metro Route
Explore Kolkata Metro information while planning your Puja trip:

Browse Metro lines & stations

Find nearby pandals and check distance from stations

Use Metro data directly while planning a route

🚌 5. Bus Route
Get bus route and stop information to plan your journey effectively:

Explore bus routes and important stops

Find nearby pandals via route-based planning (Note: No fake real-time bus tracking).

👥 6. Crowd Reality
Instead of displaying fake live crowd statuses, PujaMate focuses on community-based crowd reports submitted by recent visitors.

📸 7. Community Photo Wall
Share your Puja experiences with the community by uploading photos, adding captions, tagging pandals, and exploring other visitors' memories.

❤️ 8. Save & Visited Pandals
Keep track of your journey:

Save: Bookmark pandals you want to visit later.

Visited: Mark pandals after actually visiting them to keep a personal record.

🧭 9. Next Pandal
After visiting a pandal, PujaMate uses your visited history to streamline your next-pandal experience organically.

🚻 10. Essential Facilities
Plan ahead by checking nearby essential amenities around pandals:
🚽 Toilet | 🏥 Medical | 🅿️ Parking | 🪑 Seating | 🚇 Metro | 🚌 Bus

🍴 11. Food Nearby
Explore food and dining options around a pandal or selected location to plan a complete Puja outing.

✍️ 12. Puja Blog
Read and share Puja-related experiences, visitor guides, local recommendations, and stories.

➕ 13. Suggest Missing Pandal
Help improve the community database over time via a simple contribution flow:
Suggest Missing Pandal ➔ Add Location ➔ Add Details ➔ Submit ➔ Verification

🔐 User Account & PWA
Create an account to access personalized features like saved pandals, visited lists, saved routes, and community posts. PujaMate is built as a Progressive Web App (PWA), allowing you to install it on your device for a native app-like experience.

🏗️ Project Architecture
Plaintext
               PujaMate
                  │
       ┌──────────┴──────────┐
       │                     │
    Frontend              Backend
       │                     │
    Next.js                Express
       │                     │
    React                    │
       │                     │
    Tailwind                 │
       │                     │
    Mapbox                   │
       │                     │
       └──────── API ────────┘
                             │
                             ↓
                      PostgreSQL
                             │
                             ↓
                      Neon Database
🛠️ Tech Stack
Frontend: Next.js, React, Tailwind CSS, Mapbox, PWA

Backend: Node.js, Express.js, REST APIs, JWT Authentication

Database: PostgreSQL (Neon PostgreSQL)

Deployment: Vercel (Frontend) | Render (Backend)

📂 Project Structure
Plaintext
PujaMate/
│
├── pujamate-frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── pujamate-backend/
│   ├── src/
│   ├── scripts/
│   ├── migrations/
│   └── package.json
│
└── README.md
⚙️ Local Development
1. Clone the repository
Bash
git clone https://github.com/biprodipdas/PujaMate.git
cd PujaMate
2. Run the Frontend
Bash
cd pujamate-frontend
npm install
npm run dev
(Runs on http://localhost:3000)

3. Run the Backend
Bash
cd pujamate-backend
npm install
npm start
(Runs on http://localhost:4000)

🔑 Environment Variables
Create .env files locally based on your configuration examples:

Frontend (.env.local):

Code snippet
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=PujaMate
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
Backend (.env):

Code snippet
PORT=4000
NODE_ENV=development
DATABASE_URL=your_neon_postgres_url
JWT_SECRET=your_jwt_secret
🌏 Vision & Roadmap
Starting with a Kolkata-first approach, expanding across West Bengal:

Kolkata ➔ Howrah ➔ Hooghly ➔ Serampore ➔ Chandannagar ➔ More Destinations

🪔 PujaMate 2026
Discover • Plan • Explore • Celebrate

Your Puja journey, in one place.

👨‍💻 Developer
Biprodip Das

Built with ❤️ for the Durga Puja experience.

⭐ Support the Project
If you find PujaMate useful:

⭐ Star the repository on GitHub

🐛 Report issues or suggest improvements

🤝 Contribute ideas!
