'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'

export default function Home() {
  const [playerId, setPlayerId] = useState<string>('')
  const [leaderboard, setLeaderboard] = useState<string>('scoresaber')
  const [scoreLimit, setScoreLimit] = useState<number>(100)

  // filters
  const [beatSniper, setBeatSniper] = useState<boolean>(false)
  const [sniperId, setSniperId] = useState<string>('')
  const [playedBySniper, setPlayedBySniper] = useState<boolean>(false)

  return (
    <>
      <main className="flex flex-col items-center pt-8 lg:justify-center bg-zinc-900 min-h-screen text-zinc-300">
        <div className="flex flex-col pl-12 pr-12 lg:w-1/3 lg:min-w-xl w-full">
          <div>
            <h1 className="font-bold text-lg">
              SnipeSaber{' '}
              <a
                className="text-orange-400 font-normal text-xs hover:underline cursor-pointer"
                href={'https://github.com/sorenrocks/snipesaber'}
              >
                github repo
              </a>
            </h1>
            <p>Beat Saber snipe playlist generator</p>
          </div>

          <Accordion type="multiple" defaultValue={['general', 'filters']}>
            <AccordionItem value="general">
              <AccordionTrigger>General</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-6">
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
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="filters">
              <AccordionTrigger>Filters</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="sniperId" className="font-bold">
                      Your player ID
                    </Label>
                    <Input
                      id="sniperId"
                      type="text"
                      placeholder="76561198838652679"
                      value={sniperId}
                      onChange={e => setSniperId(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Checkbox
                      disabled={!sniperId}
                      id="beat-sniper"
                      onCheckedChange={checked => setBeatSniper(!!checked)}
                      checked={beatSniper}
                    />
                    <Label className="font-bold" htmlFor="beat-sniper">
                      Skip scores that are worse (lower pp) than yours
                    </Label>
                  </div>

                  <div className="flex gap-2">
                    <Checkbox
                      disabled={!sniperId}
                      id="played-by-sniper"
                      onCheckedChange={checked => setPlayedBySniper(!!checked)}
                      checked={playedBySniper}
                    />
                    <Label className="font-bold" htmlFor="played-by-sniper">
                      Skip maps in which you don't have a score
                    </Label>
                  </div>

                  <div className="pt-2 flex flex-col gap-1">
                    <p className="text-xs text-zinc-400">
                      Filters will only check up to Score Limit (against your first{' '}
                      <span className="font-bold">{scoreLimit}</span> scores)
                    </p>
                    <p className="text-xs text-zinc-400">Skipping will subtract from the Score Limit</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

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
              if (sniperId) url.searchParams.set('sniper', sniperId)
              if (beatSniper) url.searchParams.set('beat', 'true')
              if (playedBySniper) url.searchParams.set('played', 'true')
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
