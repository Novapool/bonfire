# Admin API Documentation

REST endpoints for managing Bonfire servers in production.

**Authentication:** All admin endpoints (except `/health`) require an API key passed via the `x-api-key` header.

---

## Endpoints

### Health Check

#### `GET /health`

Simple health check endpoint for monitoring.

**Authentication:** None required

**Response:**
```json
{
  "status": "ok"
}
```

**Example:**
```bash
curl http://localhost:3000/health
```

**Use cases:**
- Load balancer health checks
- Monitoring systems (Uptime Robot, Pingdom, etc.)
- CI/CD deployment verification

---

### Server Statistics

#### `GET /admin/stats`

Get current server statistics including room count, player count, and uptime.

**Authentication:** Required (x-api-key header)

**Response:**
```json
{
  "roomCount": 5,
  "playerCount": 12,
  "uptime": 3600000
}
```

**Fields:**
- `roomCount: number` - Number of active rooms
- `playerCount: number` - Total number of connected players across all rooms
- `uptime: number` - Server uptime in milliseconds since last start

**Example:**
```bash
curl -H "x-api-key: your-secret-key" http://localhost:3000/admin/stats
```

**Use cases:**
- Monitoring dashboards
- Capacity planning
- Performance metrics

**Errors:**
- `401 Unauthorized` - Missing or invalid API key
- `500 Internal Server Error` - Server error while collecting stats

---

### Force End Room

#### `POST /admin/force-end/:roomId`

Force-end a specific room, removing all players and cleaning up resources.

**Authentication:** Required (x-api-key header)

**URL Parameters:**
- `roomId: string` - The 6-character room code (e.g., "A3K7N2")

**Response:**
```json
{
  "success": true,
  "message": "Room A3K7N2 has been ended"
}
```

**Example:**
```bash
curl -X POST \
  -H "x-api-key: your-secret-key" \
  http://localhost:3000/admin/force-end/A3K7N2
```

**What happens:**
1. Game is ended (calls `game.end()`)
2. All players are notified via `room:closed` event
3. Room is deleted from RoomManager
4. Database state is cleaned up
5. All timers are cleared

**Use cases:**
- Terminate abusive/inappropriate games
- Clear stuck rooms during debugging
- Manual cleanup after issues
- Testing room cleanup behavior

**Errors:**
- `401 Unauthorized` - Missing or invalid API key
- `404 Not Found` - Room does not exist
- `500 Internal Server Error` - Error during room cleanup

---

### Kick Player

#### `POST /admin/kick/:roomId/:playerId`

Remove a specific player from a room.

**Authentication:** Required (x-api-key header)

**URL Parameters:**
- `roomId: string` - The 6-character room code
- `playerId: string` - The player ID to remove

**Response:**
```json
{
  "success": true,
  "message": "Player player-123 has been removed from room A3K7N2"
}
```

**Example:**
```bash
curl -X POST \
  -H "x-api-key: your-secret-key" \
  http://localhost:3000/admin/kick/A3K7N2/player-123
```

**What happens:**
1. Player is removed from game (calls `game.removePlayer()`)
2. Player's socket is disconnected
3. Other players are notified of player leaving
4. Player cannot rejoin without admin intervention

**Use cases:**
- Remove disruptive players
- Handle player issues during live games
- Testing player removal flow
- Moderation actions

**Errors:**
- `401 Unauthorized` - Missing or invalid API key
- `404 Not Found` - Room or player does not exist
- `500 Internal Server Error` - Error during player removal

---

## Authentication

All admin endpoints (except `/health`) require authentication via API key.

### Setting Up API Key

Configure the API key in your server config:

```typescript
const server = new SocketServer(
  {
    port: 3000,
    admin: {
      enabled: true,
      apiKey: process.env.ADMIN_API_KEY || 'your-secret-key',
    },
    // ... other config
  },
  adapter,
  gameFactory,
  'my-game'
)
```

**Security Best Practices:**
- Store API key in environment variables (never commit to git)
- Use a strong, randomly generated key (at least 32 characters)
- Rotate keys periodically
- Use HTTPS in production
- Consider IP whitelisting for additional security
- Log all admin API usage for audit trails

### Using API Key

Pass the API key in the `x-api-key` header:

```bash
curl -H "x-api-key: your-secret-key" http://localhost:3000/admin/stats
```

**Response for missing/invalid key:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```
HTTP Status: `401 Unauthorized`

---

## Security Considerations

### Protection Mechanisms

1. **API Key Authentication** - Required for all destructive operations
2. **CORS Configuration** - Restrict origins that can access admin endpoints
3. **Rate Limiting** - Prevent abuse (configure via ServerConfig)
4. **HTTPS Only** - Never expose admin endpoints over HTTP in production

### Monitoring & Logging

**Recommended logging for admin actions:**
- Log all admin endpoint access (timestamp, endpoint, result)
- Alert on repeated authentication failures
- Track room force-ends and player kicks
- Monitor API key usage patterns

**Example logging:**
```typescript
// In production, log admin actions
app.use('/admin/*', (req, res, next) => {
  console.log(`[ADMIN] ${req.method} ${req.path} - API Key: ${req.headers['x-api-key']?.substring(0, 8)}...`)
  next()
})
```

### Deployment Best Practices

**Production checklist:**
- [ ] API key stored in environment variable
- [ ] HTTPS enabled
- [ ] CORS configured with specific origins (not `*`)
- [ ] Rate limiting enabled
- [ ] Admin endpoints monitored/logged
- [ ] Firewall rules restrict admin endpoint access
- [ ] Regular API key rotation schedule

---

## Integration Examples

### Monitoring Dashboard

```typescript
// Fetch server stats every 30 seconds
async function updateDashboard() {
  const response = await fetch('https://api.yourgame.com/admin/stats', {
    headers: { 'x-api-key': process.env.ADMIN_API_KEY }
  })
  const stats = await response.json()

  updateMetrics({
    rooms: stats.roomCount,
    players: stats.playerCount,
    uptime: formatUptime(stats.uptime)
  })
}

setInterval(updateDashboard, 30000)
```

### Moderation Tool

```typescript
async function moderateRoom(roomId: string, action: 'kick' | 'end', playerId?: string) {
  const endpoint = action === 'kick'
    ? `/admin/kick/${roomId}/${playerId}`
    : `/admin/force-end/${roomId}`

  const response = await fetch(`https://api.yourgame.com${endpoint}`, {
    method: 'POST',
    headers: { 'x-api-key': process.env.ADMIN_API_KEY }
  })

  if (!response.ok) {
    throw new Error(`Moderation failed: ${response.statusText}`)
  }

  return response.json()
}
```

### Health Check Monitoring

```bash
#!/bin/bash
# Add to cron for uptime monitoring

STATUS=$(curl -s http://localhost:3000/health | jq -r '.status')

if [ "$STATUS" != "ok" ]; then
  echo "Health check failed!" | mail -s "Server Alert" admin@yourgame.com
fi
```

---

## Error Reference

| Status Code | Meaning | Possible Causes |
|-------------|---------|-----------------|
| 200 | Success | Request completed successfully |
| 401 | Unauthorized | Missing or invalid API key |
| 404 | Not Found | Room or player does not exist |
| 500 | Internal Server Error | Server error during operation |

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Future Enhancements

Planned admin features for future releases:

- **`GET /admin/rooms`** - List all active rooms with details
- **`GET /admin/room/:roomId`** - Get detailed room information
- **`POST /admin/broadcast`** - Broadcast message to all rooms
- **`GET /admin/logs`** - Stream server logs
- **`POST /admin/config`** - Update server config dynamically
- **WebSocket admin API** - Real-time monitoring via WebSocket

---

## Related Documentation

- **Server API:** `packages/server/README.md` - Full server package documentation
- **Architecture:** `docs/architecture/server-infrastructure.md` - Server design details
- **Configuration:** `packages/server/README.md#socketserver` - Server configuration options
