import type { NextRequest } from 'next/server'
import { Playlist } from '../types'
import { groupScores, imageToBase64, fetchScoreSaber } from '../utils'
import { responsePlayerIdRequired, responseInternalError } from '../responses'

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl

    const playerId = url.searchParams.get('user')
    if (!playerId) throw responsePlayerIdRequired

    const count = parseInt(url.searchParams.get('count') || '0')

    const [player, scores] = await fetchScoreSaber(playerId, count)

    // skip scores that are worse than the sniper's
    const sniperId = url.searchParams.get('sniper')
    const onlyBeatSniper = url.searchParams.get('beat') === 'true'
    const onlyPlayedBySniper = url.searchParams.get('played') === 'true'

    if (sniperId && (onlyBeatSniper || onlyPlayedBySniper)) {
      const [, sniperScores] = await fetchScoreSaber(sniperId, count)

      const newScores = []

      for (const score of scores.data) {
        const sniperScore = sniperScores.data.find(
          s =>
            s.leaderboard.song.hash === score.leaderboard.song.hash &&
            s.leaderboard.difficulty.modeName === score.leaderboard.difficulty.modeName &&
            s.leaderboard.difficulty.difficultyName === score.leaderboard.difficulty.difficultyName
        )

        if (onlyPlayedBySniper && !sniperScore) continue // skip scores that are not played by the sniper
        if (onlyBeatSniper && sniperScore && sniperScore.pp > score.pp) continue // skip scores that are worse than the sniper's

        newScores.push(score)
      }

      scores.data = newScores
    }

    const songs = groupScores(scores)

    const playlist: Playlist = {
      playlistTitle: `Snipe ${player.name} SS`,
      playlistAuthor: 'SnipeSaber',
      customData: {
        syncURL: `${url.origin}/scoresaber?user=${playerId}&count=${count}${sniperId ? `&sniper=${sniperId}` : ''}${
          onlyBeatSniper ? '&beat=true' : ''
        }${onlyPlayedBySniper ? '&played=true' : ''}`,
      },
      songs: songs,
      image: await imageToBase64(player.avatar),
    }

    const download = url.searchParams.get('download')
    if (download) {
      const blob = new Blob([JSON.stringify(playlist, null, 2)], { type: 'application/json' })
      const filename = `snipe-${player.name}-ss.bplist`
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
