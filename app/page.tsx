'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'

export default function Home() {
  const [playerId, setPlayerId] = useState<string>('')
  const [leaderboard, setLeaderboard] = useState<string>('scoresaber')
  const [scoreLimit, setScoreLimit] = useState<number>(100)

  return (
    <>
      <main className="flex flex-col items-center justify-center bg-zinc-900 min-h-screen text-zinc-300">
        <div className="flex flex-col w-1/4 gap-6">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="playerId" className="font-bold">
              Player ID
            </Label>
            <Input
              id="playerId"
              type="text"
              placeholder="76561198838652679"
              value={playerId}
              onChange={e => setPlayerId(e.target.value)}
            />
          </div>

          <div className="flex flex-row">
            <div className="flex flex-col pr-10 gap-2">
              <Label htmlFor="leaderboard" className="font-bold">
                Leaderboard
              </Label>
              <RadioGroup
                defaultValue="scoresaber"
                id="leaderboard"
                onValueChange={setLeaderboard}
                className="flex flex-col"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scoresaber" id="scoresaber" />
                  <Label htmlFor="scoresaber">ScoreSaber</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beatleader" id="beatleader" />
                  <Label htmlFor="beatleader">BeatLeader</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex flex-col w-full gap-4">
              <Label htmlFor="mapCount" className="font-bold">
                Score Limit
              </Label>
              <div className="flex flex-row w-full gap-2">
                <Slider
                  id="mapCount"
                  defaultValue={[100]}
                  max={500}
                  min={100}
                  step={100}
                  value={[scoreLimit]}
                  onValueChange={value => setScoreLimit(value[0])}
                />
                <Label>{scoreLimit}</Label>
              </div>
            </div>
          </div>
          <Button
            className="cursor-pointer"
            disabled={
              playerId.length === 0 ||
              scoreLimit < 100 ||
              scoreLimit > 500 ||
              (leaderboard !== 'scoresaber' && leaderboard !== 'beatleader')
            }
            onClick={() => {
              const url = new URL(`/${leaderboard}`, window.location.origin)
              url.searchParams.set('user', playerId)
              url.searchParams.set('count', scoreLimit.toString())
              url.searchParams.set('download', 'true')
              window.location.href = url.toString()
            }}
          >
            Generate Playlist
          </Button>
        </div>
      </main>
    </>
  )
}
