import { responseLeaderboadError, responseNoRankedScores, responsePlayerNotFound } from './responses'
import { Scores, Player } from './types'

const fetchPlayerScores = async (scoresURL: string, playCount: number, limit = 'limit'): Promise<Scores> => {
  let scores: Scores = { data: [] }
  let count = playCount < 500 ? playCount : 500
  let page = 1

  // if over 100, paginate
  while (count > 0) {
    // specify a high timeout for the fetch request
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5 * 1000) // 5 seconds
    const scoresRes = await fetch(`${scoresURL}&${limit}=100&page=${page}`, {
      signal: controller.signal,
      next: {
        // cache to avoid hitting leaderboard APIs too often
        revalidate: 60 * 60, // 1 hour
      },
    })
    clearTimeout(timeout)
    if (!scoresRes.ok) throw responseLeaderboadError

    const newScores = toScores(await scoresRes.json())
    if (newScores.data.length === 0) break

    scores.data.push(...newScores.data)

    count -= 100
    page += 1

    // wait between requests to avoid hitting API rate limits
    if (count > 0) {
      await new Promise(resolve => setTimeout(resolve, 250)) // 250ms
    }
  }

  return scores
}

const fetchPlayer = async (playerURL: string): Promise<Player> => {
  const playerRes = await fetch(playerURL)
  if (!playerRes.ok) throw responsePlayerNotFound

  const player = toPlayer(await playerRes.json())

  if (player.rankedPlayCount === 0) throw responseNoRankedScores
  return player
}

export const fetchBeatLeader = async (playerId: string, count: number): Promise<[Player, Scores]> => {
  const playerURL = `https://api.beatleader.com/player/${playerId}`
  const scoresURL = `https://api.beatleader.com/player/${playerId}/scores?sortBy=pp`

  const player = await fetchPlayer(playerURL)
  const scores = await fetchPlayerScores(scoresURL, count > 0 ? count : player.rankedPlayCount, 'count')

  return [player, scores]
}

export const fetchScoreSaber = async (playerId: string, count: number): Promise<[Player, Scores]> => {
  const playerURL = `https://scoresaber.com/api/player/${playerId}/full`
  const scoresURL = `https://scoresaber.com/api/player/${playerId}/scores?sort=top`

  const player = await fetchPlayer(playerURL)
  const scores = await fetchPlayerScores(scoresURL, count > 0 ? count : player.rankedPlayCount)

  return [player, scores]
}

export const groupScores = (scores: Scores) => {
  const songMap = new Map<
    string,
    {
      songName: string
      levelAuthorName: string
      hash: string
      difficulties: { characteristic: string; name: string }[]
    }
  >()

  for (const score of scores.data) {
    const hash = score.leaderboard.song.hash

    if (!songMap.has(hash)) {
      songMap.set(hash, {
        songName: score.leaderboard.song.name,
        levelAuthorName: score.leaderboard.song.author,
        hash,
        difficulties: [],
      })
    }

    const entry = songMap.get(hash)!
    if (
      !entry.difficulties.some(
        d =>
          d.characteristic === score.leaderboard.difficulty.modeName &&
          d.name === score.leaderboard.difficulty.difficultyName
      )
    ) {
      entry.difficulties.push({
        characteristic: score.leaderboard.difficulty.modeName,
        name: score.leaderboard.difficulty.difficultyName,
      })
    }
  }

  return Array.from(songMap.values())
}

export const toPlayer = (player: any): Player => {
  return {
    id: player.id,
    name: player.name,
    avatar: player.avatar || player.profilePicture,
    rankedPlayCount: player.scoreStats?.rankedPlayCount || 0,
  }
}

export const toScores = (scores: any): Scores => {
  if (scores.data) return scores as Scores

  return {
    data: scores.playerScores.map((score: any) => ({
      leaderboard: {
        song: {
          name: score.leaderboard.songName,
          author: score.leaderboard.songAuthorName,
          hash: score.leaderboard.songHash,
        },
        difficulty: {
          modeName: score.leaderboard.difficulty.difficultyRaw.split('_')[2].replace('Solo', ''),
          difficultyName: score.leaderboard.difficulty.difficultyRaw.split('_')[1],
        },
      },
    })),
  }
}

export const imageToBase64 = async (url: string): Promise<string> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch image')

  const blob = await res.arrayBuffer()
  const contentType = res.headers.get('content-type')

  const base64String = `data:${contentType};base64,${Buffer.from(blob).toString('base64')}`
  return base64String
}
