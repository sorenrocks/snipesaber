export const responsePlayerIdRequired = new Response(JSON.stringify({ error: 'Player ID is required' }), {
  status: 400,
  headers: { 'Content-Type': 'application/json' },
})

export const responsePlayerNotFound = new Response(JSON.stringify({ error: 'Player not found' }), {
  status: 400,
  headers: { 'Content-Type': 'application/json' },
})

export const responseNoRankedScores = new Response(
  JSON.stringify({ error: 'No ranked scores found for this player' }),
  {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  }
)

export const responseLeaderboadError = new Response(
  JSON.stringify({ error: 'Failed to fetch scores from the leaderboard API' }),
  {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  }
)

export const responseInternalError = new Response(JSON.stringify({ error: 'Internal server error' }), {
  status: 500,
  headers: { 'Content-Type': 'application/json' },
})
