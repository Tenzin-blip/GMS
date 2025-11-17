# Gym Management System  

A modern gym management platform built with **Payload CMS** and **Bun**. It’s still under construction, but the goal is to make managing workouts, trainers, and memberships way smoother — and eventually ship it as a **PWA** so people can use it like a native app.  

> still in dev mode — backend’s getting there, frontend + PWA bits next up.  

---

## Stack  

- **Backend:** Payload CMS + Bun (Node.js runtime)  
- **Frontend:** React / Next.js (coming soon)  
- **Database:** MongoDB  
- **Auth:** JWT  
- **PWA Support:** planned  

---

## Features (WIP)  

- Role-based access — Admin / Trainer / Member  
- Attendance tracking with QR check-ins  
- Workout + Meal plan system  
- AI assistant for auto-generating plans *(planned)*  
- Membership payments + tracking *(planned)*  
- Installable PWA for mobile users *(coming soon)*  

---

## Getting Started  

1. **Clone it:**  
   ```bash
   git clone https://github.com/yourusername/gym-management-system.git
   cd gym-management-system
2. **Install dependencies:**
   ```bash
   bun install
3. **Set up your env:**
   Create a `.env` file and add:
   ```bash
   PAYLOAD_SECRET=your_secret
   MONGODB_URI=your_mongo_uri
4. **Run it locally**
   ```bash
   bin run dev
5. Visit `http://localhost:3000` to check it out

