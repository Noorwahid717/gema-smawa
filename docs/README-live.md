# Live Classroom Streaming Guide

This document describes the WebRTC + WebSocket live classroom feature for the GEMA SMA Wahidiyah platform.

## Environment variables

Add the following variables to your environment (e.g. `.env.local`):

```
# Signaling / RTC
NEXT_PUBLIC_STUN_URLS='["stun:stun.l.google.com:19302"]'
NEXT_PUBLIC_TURN_URL=
NEXT_PUBLIC_TURN_USERNAME=
NEXT_PUBLIC_TURN_PASSWORD=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

* Provide TURN credentials in production so sessions continue behind restrictive networks.
* The Cloudinary keys are used server side to sign uploads; never expose the secret outside the server route.

## Development

1. Install dependencies and run Prisma generate if needed.
2. Start the dev server with `npm run dev`.
3. Visit `/classroom/<classroomId>/live`.
4. Login as admin to host (NextAuth). Students join via the student login flow.

The in-memory signaling store is suitable for local development. For production, replace it with Redis/Upstash by adapting the `RoomStore` implementation in `src/app/api/ws/route.ts`.

## Feature overview

* Host (admin) can start a live session, broadcast audio/video, share their screen, and record locally.
* Viewers (students) join the live room via a lightweight WebSocket signaling channel and connect using WebRTC (mesh topology).
* MediaRecorder captures the host stream and uploads it to Cloudinary when stopped. The secure URL is stored on `LiveSession.recordingUrl` when the session ends.
* Edge WebSocket route supports multiple rooms and enforces host/viewer signaling rules.

## Limitations & follow ups

* State is in-memory; restart clears live rooms. Use Upstash/Redis in production.
* TURN credentials are required for audiences on strict networks.
* Recording happens only on the host device. Ensure adequate disk/CPU before running long recordings.
* There is minimal retry logic; refresh the page to recover from fatal signaling failures.
