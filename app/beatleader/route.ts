import type { NextRequest } from 'next/server'
import { Playlist } from '../types'
import { groupScores, imageToBase64, fetchBeatLeader } from '../utils'
import { responsePlayerIdRequired, responseInternalError } from '../responses'

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl

    const playerId = url.searchParams.get('user')
    if (!playerId) throw responsePlayerIdRequired

    const count = parseInt(url.searchParams.get('count') || '0')

    const [player, scores] = await fetchBeatLeader(playerId, count)
    const songs = groupScores(scores)

    const playlist: Playlist = {
      playlistTitle: `Snipe ${player.name} BL`,
      playlistAuthor: 'SnipeSaber',
      customData: {
        syncURL: `${url.origin}/beatleader?user=${playerId}&count=${count}`,
      },
      songs: songs,
      image: await imageToBase64(player.avatar),
    }

    const download = url.searchParams.get('download')
    if (download) {
      const blob = new Blob([JSON.stringify(playlist)], { type: 'application/json' })
      const filename = `snipe-${player.name}-bl.json`
      return new Response(blob, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } else
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
