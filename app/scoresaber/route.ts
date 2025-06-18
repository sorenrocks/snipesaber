import type { NextRequest } from 'next/server'
import { Playlist } from '../types'
import { groupScores, imageToBase64, fetchScoreSaber } from '../utils'
import { responsePlayerIdRequired, responseInternalError } from '../responses'

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl
    const playerId = url.searchParams.get('user')
    if (!playerId) throw responsePlayerIdRequired

    const [player, scores] = await fetchScoreSaber(playerId)
    const songs = groupScores(scores)

    const playlist: Playlist = {
      playlistTitle: `Snipe ${player.name} SS`,
      playlistAuthor: 'SnipeSaber',
      customData: {
        syncURL: `${url.origin}/scoresaber?user=${playerId}`,
      },
      songs: songs,
      image: await imageToBase64(player.avatar),
    }

    return new Response(JSON.stringify(playlist), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    if (err instanceof Response) return err
    else return responseInternalError
  }
}
