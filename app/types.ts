export interface Scores {
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
    pp: number
  }[]
}

export interface Player {
  id: string
  name: string
  avatar: string
  rankedPlayCount: number
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
