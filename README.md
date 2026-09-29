# 🪔 PujaMate

### Your Complete Durga Puja Companion

PujaMate is a web-based Durga Puja discovery and planning platform designed to help people explore pandals, plan their Puja trips, find travel information, and share their Puja experiences.
Instead of using multiple sources to search for pandals, routes, transport information, crowd updates, and Puja experiences, PujaMate brings these features together in one place.

---

## 🌟 What is PujaMate?

Durga Puja is one of the biggest festivals in Kolkata and West Bengal. During Puja, people often visit multiple pandals in a single day, which makes planning the journey difficult.

**PujaMate is built to make that experience easier.**

With PujaMate, users can:

- 🔎 Discover Durga Puja pandals
- 🗺️ Explore pandals on an interactive map
- 📍 Find nearby pandals using location
- 🧭 Plan a multi-pandal route
- 🚇 Explore Metro routes and nearby pandals
- 🚌 Explore Bus routes and stops
- 👥 Check community-based crowd reports
- 📸 Share Puja photos with the community
- ❤️ Save favourite pandals
- 📍 Mark pandals as visited
- ✍️ Read and share Puja stories
- ➕ Suggest missing pandals
- 🚻 Find important facilities near pandals
- 🍴 Explore nearby food options
- 📱 Install the application as a PWA

---

# 🚀 Key Features

## 🗺️ 1. Pandal Explorer

Discover Durga Puja pandals through an interactive map.

Users can explore pandals by location/area and view important information such as:

- Pandal name
- Location
- Description
- Photos
- Rating
- Crowd information
- Nearby facilities
- Transport information

PujaMate is designed with a **Kolkata-first, Bengal-wide exploration approach**, allowing users to explore Kolkata and other supported areas.

---

## 📍 2. Near Me & Explore Mode

Users can choose between two ways to explore.

### Near Me

If location permission is enabled, PujaMate can help users find nearby pandals based on their current location.

### Explore Mode

Location permission is **not required** to explore the application.

Users can manually select an area and browse available pandals.

This makes PujaMate useful even when location access is unavailable.

---

## 🧭 3. Route Planner

Plan a complete Puja-hopping journey.

Users can create a route using:

```text
Start
   ↓
Stop 1
   ↓
Stop 2
   ↓
Stop 3
   ↓
Destination

The route planner supports different travel modes where available:

🚶 Walking
🚗 Driving
🚲 Cycling
🚇 Transit

Users can also add multiple stops and generate a route for their Puja journey.



##🚇 4. Metro Route

Explore Kolkata Metro information while planning your Puja trip.

Users can:

Browse Metro lines
Explore stations
Find nearby pandals
Check distance from stations
Use Metro information while planning a route

## 🚌 5. Bus Route

PujaMate also provides bus route and stop information to help users plan their journey.

Users can explore:

Bus routes
Important stops
Nearby pandals
Route-based Puja planning

PujaMate does not claim to provide fake real-time bus tracking or arrival information.

##👥 6. Crowd Reality

Instead of displaying fake live crowd information, PujaMate focuses on community-based crowd reports.

Users can check recent crowd reports submitted by visitors.

If there is no recent report, the application does not present it as a current live crowd status.

##📸 7. Community Photo Wall

PujaMate allows users to share their Puja experiences with the community.

Users can:

Upload Puja photos
Add captions
Tag pandals
Explore photos shared by other visitors

This creates a community-driven Puja experience.

##❤️ 8. Save & Visited Pandals

Users can keep track of their Puja journey.

Save

Save pandals that they want to visit later.

Visited

Mark pandals after actually visiting them.

This helps users keep a personal record of their Puja exploration.

##🧭 9. Next Pandal

After visiting a pandal, PujaMate can use the user's visited information to support the next-pandal experience.

The feature is designed around the user's actual Puja journey rather than pretending to know where the user has already visited.

##🚻 10. Essential Facilities

Pandal information can include useful facilities such as:

🚻 Toilet
🏥 Medical
🅿️ Parking
🪑 Seating
🚇 Metro
🚌 Bus

This helps users plan not only where to go, but also what facilities may be available around the pandal.

##🍴 11. Food Nearby

Users can explore food options around a pandal or selected location.

This can be useful when planning a complete Puja outing instead of only visiting pandals.

##✍️ 12. Puja Blog

PujaMate includes a Puja Blog where users can read and share Puja-related experiences and stories.

The blog can include:

Visitor experiences
Puja guides
Local recommendations
Puja stories
➕ 13. Suggest Missing Pandal

If a user finds a Puja pandal that is not available in the application, they can suggest it.

The flow is:

Suggest Missing Pandal
        ↓
Add Location
        ↓
Add Details
        ↓
Submit
        ↓
Verification

This helps improve the PujaMate pandal database over time.

##🔐 User Account

Users can create an account and log in to access personalized features such as:

❤️ Saved Pandals
📍 Visited Pandals
🧭 Saved Routes
📸 Community participation
✍️ User content
📱 Progressive Web App (PWA)

PujaMate is designed as a Progressive Web App.

Users can access it from the web and, where supported, install it on their device for an app-like experience.

##🏗️ Project Architecture

PujaMate uses a separate frontend and backend architecture.

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
##🛠️ Tech Stack
Frontend
Next.js
React
Tailwind CSS
Mapbox
Progressive Web App (PWA)

Backend
Node.js
Express.js
REST APIs
JWT Authentication
Database
PostgreSQL
Neon PostgreSQL
Deployment

Frontend: Vercel
Backend: Render
Database: Neon PostgreSQL

##📂 Project Structure
PujaMate/
│
├── pujamate-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── pujamate-backend/
│   ├── src/
│   ├── scripts/
│   ├── migrations/
│   ├── package.json
│   └── ...
└── README.md
⚙️ Local Development
1. Clone the repository
git clone https://github.com/YOUR_USERNAME/PujaMate.git
cd PujaMate
2. Run the Frontend
cd pujamate-frontend
npm install
npm run dev

Frontend will normally run on:

http://localhost:3000
3. Run the Backend

Open another terminal:

cd pujamate-backend
npm install
npm start

The backend normally runs on:

http://localhost:4000
##🔑 Environment Variables

For security reasons, actual environment variables and secrets are not included in this repository.

Create the required .env files locally using the project's environment variable examples.

Typical configuration includes:

Frontend
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_NAME=PujaMate
NEXT_PUBLIC_MAPBOX_TOKEN=
Backend
PORT=4000
NODE_ENV=development
DATABASE_URL=
JWT_SECRET=

Never commit .env files, database credentials, API secrets, JWT secrets, or other private credentials to GitHub.

##🎯 Project Goal

The goal of PujaMate is simple:

Make exploring Durga Puja easier, more organized, and more enjoyable.

Instead of searching for pandals, transport information, routes, crowd updates, facilities, and Puja experiences across different platforms, PujaMate brings these experiences together into one application.

##🌏 Vision

PujaMate starts with a Kolkata-first approach while being designed to support a wider Bengal-wide Durga Puja exploration experience.

The long-term vision is to help users discover:

Kolkata
   ↓
Howrah
   ↓
Hooghly
   ↓
Serampore
   ↓
Chandannagar
   ↓
More Puja destinations
##🪔 PujaMate 2026
Discover • Plan • Explore • Celebrate

Your Puja journey, in one place.

##📌 Project Status

PujaMate is being prepared as a public-facing Durga Puja platform for Durga Puja 2026.

Features and data may continue to evolve as the platform is improved and more verified Puja information becomes available.

##👨‍💻 Developer

Biprodip Das

Built with ❤️ for the Durga Puja experience.

##⭐ If you like the project

If you find PujaMate useful or interesting:

⭐ Star the repository
🐛 Report issues
💡 Suggest improvements
🤝 Contribute ideas
