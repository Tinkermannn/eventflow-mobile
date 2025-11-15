# EventFlow Backend API Contract

## Auth
POST /auth/register
  Request: { name, email, password, phoneNumber }
  Response: { user, token }
POST /auth/login
  Request: { email, password }
  Response: { user, token }
PATCH /auth/update
  Request: { name?, phoneNumber?, avatarUrl?, password? }
  Response: { user }
DELETE /auth/delete
  Response: { success }

## User
GET /users/me
  Response: { user }
PATCH /users/me
  Request: { name?, phoneNumber?, avatar? (file) }
  Response: { user }
DELETE /users/me
  Response: { success }

## Event
POST /events
  Request: { name, description, startTime, endTime, locationName, latitude, longitude, joinCode }
  Response: { event }
GET /events/{id}
  Response: { event }
GET /events?status=ONGOING|UPCOMING|COMPLETED
  Response: [event]
PATCH /events/{id}
  Request: { ...editable fields }
  Response: { event }
DELETE /events/{id}
  Response: { success }
POST /events/{id}/join
  Request: { joinCode }
  Response: { event, participant }

## Report
POST /{id}/reports
  Request: { category, description, latitude, longitude, media? (file[]) }
  Response: { report }
GET /{id}/reports
  Response: [report]
PATCH /reports/{reportId}
  Request: { status }
  Response: { report }
DELETE /reports/{reportId}
  Response: { success }

## Broadcast & Notification
POST /broadcast
  Request: { category, message, title, type }
  Response: { notification }
GET /me/notifications
  Response: [notification]
PATCH /me/notifications/{id}/read
  Response: { notification }

## Geofencing (VirtualArea)
POST /events/{id}/virtual-areas
  Request: { name, area, color }
  Response: { virtualArea }
GET /events/{id}/virtual-areas
  Response: [virtualArea]
PATCH /virtual-areas/{areaId}
  Request: { ...editable fields }
  Response: { virtualArea }
DELETE /virtual-areas/{areaId}
  Response: { success }

## Poll
POST /events/{eventId}/polls/{pollId}/vote
  Request: { pollOptionId }
  Response: { poll }
GET /polls/{pollId}/results
  Response: [pollResult]
POST /events/{eventId}/polls/{pollId}/unvote
  Request: { pollOptionId }
  Response: { poll }

## Device
POST /devices/register
  Request: { pushToken }
  Response: { device }
GET /devices/me
  Response: [device]
DELETE /devices/{deviceId}
  Response: { success }

## Location
POST /events/{eventId}/location
  Request: { latitude, longitude }
  Response: { location }
GET /events/{eventId}/locations
  Response: [location]
GET /events/{eventId}/location/me
  Response: { location }

## User Notification
GET /notifications/me
  Response: [notification]
POST /notifications/{notificationId}/read
  Response: { notification }
GET /notifications/me/unread-count
  Response: { count }

## Real-time (Socket.io)
Connect: /socket.io
Event: join_event, broadcast, report_update, location_update

## Contoh Payload
- Register: { "name": "Budi", "email": "budi@email.com", "password": "rahasia" }
- Event: { "name": "Mabim", "startTime": "2025-11-20T08:00:00Z", "endTime": "2025-11-20T17:00:00Z", "locationName": "Aula", "latitude": -6.2, "longitude": 106.8, "joinCode": "ABC123" }
- Report: { "category": "SECURITY", "description": "Ada masalah keamanan", "latitude": -6.2, "longitude": 106.8 }
- Broadcast: { "category": "SECURITY", "message": "Harap tenang, petugas menuju lokasi." }
