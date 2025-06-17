export interface BeatLeaderPlayer {
  id: string
  name: string
  avatar: string
  scoreStats: {
    rankedPlayCount: number
  }
}

export interface BeatLeaderScores {
  data: {
    leaderboard: {
      song: {
        name: string
        author: string
        hash: string
      }
      difficulty: {
        modeName: string
        difficultyName: string
      }
    }
  }[]
}

export interface Playlist {
  playlistTitle: string
  playlistAuthor: string
  customData: {
    syncURL: string
  }
  songs: {
    songName: string
    levelAuthorName: string
    hash: string
    difficulties: {
      characteristic: string
      name: string
    }[]
  }[]
  image: string
}
