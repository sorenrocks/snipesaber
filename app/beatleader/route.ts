import type { NextRequest } from 'next/server'
import { BeatLeaderPlayer, BeatLeaderScores, Playlist } from '../types'

const responsePlayerIdRequired = new Response(JSON.stringify({ error: 'Player ID is required' }), {
  status: 400,
  headers: { 'Content-Type': 'application/json' },
})

const responsePlayerNotFound = new Response(JSON.stringify({ error: 'Player not found' }), {
  status: 404,
  headers: { 'Content-Type': 'application/json' },
})

const responseNoRankedScores = new Response(JSON.stringify({ error: 'No ranked scores found for this player' }), {
  status: 404,
  headers: { 'Content-Type': 'application/json' },
})

const responseBeatLeaderError = new Response(JSON.stringify({ error: 'Failed to fetch scores from BeatLeader API' }), {
  status: 500,
  headers: { 'Content-Type': 'application/json' },
})

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const playerId = url.searchParams.get('user')
  if (!playerId) return responsePlayerIdRequired

  const playerURL = `https://api.beatleader.com/player/${playerId}`
  const playerRes = await fetch(playerURL)
  if (!playerRes.ok) return responsePlayerNotFound
  const player = (await playerRes.json()) as BeatLeaderPlayer

  let count = player.scoreStats.rankedPlayCount || 100
  if (count === 0) return responseNoRankedScores

  const scoresURL = `https://api.beatleader.com/player/${playerId}/scores`
  let scores: BeatLeaderScores = { data: [] }

  let page = 1
  while (count > 0) {
    // if over 100, paginate
    let curPageCount = count > 100 ? 100 : count

    const scoresRes = await fetch(`${scoresURL}?count=${curPageCount}&page=${page}`)
    if (!scoresRes.ok) responseBeatLeaderError
    const newScores = (await scoresRes.json()) as BeatLeaderScores
    if (newScores.data.length === 0) break

    scores.data.push(...newScores.data)

    count -= curPageCount
    page += 1
  }

  // TODO: group multiple difficulties of the same song into one entry
  const songs = scores.data.map(score => ({
    songName: score.leaderboard.song.name,
    levelAuthorName: score.leaderboard.song.author,
    hash: score.leaderboard.song.hash,
    difficulties: [
      {
        characteristic: score.leaderboard.difficulty.modeName,
        name: score.leaderboard.difficulty.difficultyName,
      },
    ],
  }))

  const playlist: Playlist = {
    playlistTitle: `snipe ${player.name} BL`,
    playlistAuthor: 'SnipeSaber',
    customData: {
      syncURL: `${url.origin}/beatleader?user=${playerId}`,
    },
    songs: songs,
    image: player.avatar,
  }

  return new Response(JSON.stringify(playlist), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
