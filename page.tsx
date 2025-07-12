"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Minus, Trash2, Edit2, Trophy, Medal, Crown, Upload, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Counter {
  id: string
  name: string
  phrase: string
  count: number
  color: string
  profilePicture?: string
}

interface GroupedCounter {
  name: string
  totalCount: number
  color: string
  phrases: string[]
  profilePicture?: string
}

interface RankedCounter extends GroupedCounter {
  rank: number
}

export default function UniversalCounterApp() {
  const [counters, setCounters] = useState<Counter[]>([
    {
      id: "1",
      name: "Peter",
      phrase: "Tenho fome / Não vais comer isso?",
      count: 0,
      color: "#4CAF50",
    },
    {
      id: "2",
      name: "Torta",
      phrase: "Esqueci-me",
      count: 0,
      color: "#dcbc19",
    },
  ])

  const [newCounter, setNewCounter] = useState({
    name: "",
    phrase: "",
    color: "#4CAF50",
    profilePicture: "",
  })

  const [editingCounter, setEditingCounter] = useState<Counter | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedCounters = localStorage.getItem("universalCounters")
    if (savedCounters) {
      setCounters(JSON.parse(savedCounters))
    }
  }, [])

  // Save to localStorage whenever counters change
  useEffect(() => {
    localStorage.setItem("universalCounters", JSON.stringify(counters))
  }, [counters])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        if (isEdit && editingCounter) {
          setEditingCounter((prev) => (prev ? { ...prev, profilePicture: base64 } : null))
        } else {
          setNewCounter((prev) => ({ ...prev, profilePicture: base64 }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfilePicture = (isEdit = false) => {
    if (isEdit && editingCounter) {
      setEditingCounter((prev) => (prev ? { ...prev, profilePicture: "" } : null))
    } else {
      setNewCounter((prev) => ({ ...prev, profilePicture: "" }))
    }
  }

  const increaseCounter = (id: string) => {
    setCounters((prev) =>
      prev.map((counter) => (counter.id === id ? { ...counter, count: counter.count + 1 } : counter)),
    )
  }

  const decreaseCounter = (id: string) => {
    setCounters((prev) =>
      prev.map((counter) => (counter.id === id ? { ...counter, count: Math.max(0, counter.count - 1) } : counter)),
    )
  }

  const addCounter = () => {
    if (newCounter.name.trim() && newCounter.phrase.trim()) {
      const counter: Counter = {
        id: Date.now().toString(),
        name: newCounter.name.trim(),
        phrase: newCounter.phrase.trim(),
        count: 0,
        color: newCounter.color,
        profilePicture: newCounter.profilePicture || undefined,
      }
      setCounters((prev) => [...prev, counter])
      setNewCounter({ name: "", phrase: "", color: "#4CAF50", profilePicture: "" })
      setIsAddDialogOpen(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const deleteCounter = (id: string) => {
    setCounters((prev) => prev.filter((counter) => counter.id !== id))
  }

  const startEdit = (counter: Counter) => {
    setEditingCounter({ ...counter })
    setIsEditDialogOpen(true)
  }

  const saveEdit = () => {
    if (editingCounter && editingCounter.name.trim() && editingCounter.phrase.trim()) {
      setCounters((prev) => prev.map((counter) => (counter.id === editingCounter.id ? editingCounter : counter)))
      setEditingCounter(null)
      setIsEditDialogOpen(false)
      if (editFileInputRef.current) {
        editFileInputRef.current.value = ""
      }
    }
  }

  const resetAllCounters = () => {
    setCounters((prev) => prev.map((counter) => ({ ...counter, count: 0 })))
  }

  // Group counters by name and sum their counts
  const getGroupedCounters = (): GroupedCounter[] => {
    const grouped = counters.reduce((acc, counter) => {
      const existingGroup = acc.find((group) => group.name.toLowerCase() === counter.name.toLowerCase())

      if (existingGroup) {
        existingGroup.totalCount += counter.count
        if (!existingGroup.phrases.includes(counter.phrase)) {
          existingGroup.phrases.push(counter.phrase)
        }
        // Use the profile picture from the first counter with one, or keep existing
        if (!existingGroup.profilePicture && counter.profilePicture) {
          existingGroup.profilePicture = counter.profilePicture
        }
      } else {
        acc.push({
          name: counter.name,
          totalCount: counter.count,
          color: counter.color,
          phrases: [counter.phrase],
          profilePicture: counter.profilePicture,
        })
      }

      return acc
    }, [] as GroupedCounter[])

    return grouped.sort((a, b) => b.totalCount - a.totalCount)
  }

  // Calculate proper rankings with ties
  const getRankedCounters = (): RankedCounter[] => {
    const grouped = getGroupedCounters()
    const ranked: RankedCounter[] = []

    let currentRank = 1
    for (let i = 0; i < grouped.length; i++) {
      if (i > 0 && grouped[i].totalCount < grouped[i - 1].totalCount) {
        currentRank = i + 1
      }
      ranked.push({
        ...grouped[i],
        rank: currentRank,
      })
    }

    return ranked
  }

  const groupedCounters = getGroupedCounters()
  const rankedCounters = getRankedCounters()
  const maxGroupedCount = Math.max(...groupedCounters.map((g) => g.totalCount), 1)
  const colorOptions = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0", "#00BCD4", "#FF5722", "#795548"]

  // Get podium data (top 3 unique ranks)
  const getPodiumData = () => {
    const topRanks = rankedCounters.filter((c) => c.rank <= 3 && c.totalCount > 0)
    const podium = {
      first: topRanks.filter((c) => c.rank === 1),
      second: topRanks.filter((c) => c.rank === 2),
      third: topRanks.filter((c) => c.rank === 3),
    }
    return podium
  }

  const podiumData = getPodiumData()

  // Profile picture component
  const ProfilePicture = ({
    src,
    name,
    color,
    size = "w-12 h-12",
    textSize = "text-sm",
  }: {
    src?: string
    name: string
    color: string
    size?: string
    textSize?: string
  }) => {
    if (src) {
      return (
        <img
          src={src || "/placeholder.svg"}
          alt={`${name}'s profile`}
          className={`${size} rounded-full object-cover border-2 border-white shadow-lg`}
        />
      )
    }

    return (
      <div
        className={`${size} rounded-full flex items-center justify-center text-white font-bold ${textSize} border-2 border-white shadow-lg`}
        style={{ backgroundColor: color }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Universal Counter & Leaderboard</h1>
          <p className="text-lg text-gray-600">Track anything, compete with anyone!</p>
          <p className="text-sm text-gray-500 mt-2">
            💡 Tip: Counters with the same name are combined in the leaderboard
          </p>
        </header>

        {/* Winner Announcement */}
        {counters.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="pt-6">
              {(() => {
                const maxCount = Math.max(...groupedCounters.map((g) => g.totalCount))
                const winners = groupedCounters.filter((g) => g.totalCount === maxCount && g.totalCount > 0)

                if (maxCount === 0) {
                  return (
                    <div className="text-center">
                      <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-lg font-semibold text-gray-600">No one is winning yet!</p>
                      <p className="text-sm text-gray-500">Start counting to see who takes the lead</p>
                    </div>
                  )
                }

                if (winners.length === 1) {
                  const winner = winners[0]
                  return (
                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        <ProfilePicture
                          src={winner.profilePicture}
                          name={winner.name}
                          color={winner.color}
                          size="w-16 h-16"
                          textSize="text-lg"
                        />
                      </div>
                      <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold mb-1" style={{ color: winner.color }}>
                        🎉 {winner.name} is winning! 🎉
                      </p>
                      <p className="text-lg text-gray-600">
                        with <span className="font-bold">{winner.totalCount}</span> total counts
                      </p>
                      <div className="text-sm text-gray-500 italic mt-1">
                        {winner.phrases.length === 1 ? (
                          `"${winner.phrases[0]}"`
                        ) : (
                          <div>
                            <p>Multiple phrases tracked:</p>
                            <ul className="list-none mt-1">
                              {winner.phrases.map((phrase, idx) => (
                                <li key={idx}>"{phrase}"</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }

                return (
                  <div className="text-center">
                    <div className="flex justify-center gap-2 mb-3">
                      {winners.slice(0, 3).map((winner) => (
                        <ProfilePicture
                          key={winner.name}
                          src={winner.profilePicture}
                          name={winner.name}
                          color={winner.color}
                          size="w-12 h-12"
                        />
                      ))}
                    </div>
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <p className="text-xl font-bold text-gray-700 mb-1">🤝 It's a tie! 🤝</p>
                    <p className="text-lg text-gray-600 mb-2">
                      {winners.map((w) => w.name).join(", ")} are tied with{" "}
                      <span className="font-bold">{maxCount}</span> counts each
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {winners.map((winner) => (
                        <Badge key={winner.name} style={{ backgroundColor: winner.color }} className="text-white">
                          {winner.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}

        {/* Podium View */}
        {(podiumData.first.length > 0 || podiumData.second.length > 0 || podiumData.third.length > 0) && (
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <Crown className="w-5 h-5 text-purple-600" />
                Champions Podium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-center gap-4 mb-4">
                {/* Second Place */}
                {podiumData.second.length > 0 && (
                  <div className="flex flex-col items-center">
                    <div className="mb-2">
                      {podiumData.second.map((player, idx) => (
                        <div key={idx} className="text-center mb-1">
                          <ProfilePicture
                            src={player.profilePicture}
                            name={player.name}
                            color={player.color}
                            size="w-12 h-12"
                          />
                          <p className="text-xs font-medium mt-1">{player.name}</p>
                          <p className="text-xs text-gray-600">{player.totalCount}</p>
                        </div>
                      ))}
                    </div>
                    <div className="w-20 h-16 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg flex items-center justify-center">
                      <Medal className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="bg-gray-300 text-gray-700 px-3 py-1 rounded-b text-sm font-bold">2nd</div>
                  </div>
                )}

                {/* First Place */}
                {podiumData.first.length > 0 && (
                  <div className="flex flex-col items-center">
                    <div className="mb-2">
                      {podiumData.first.map((player, idx) => (
                        <div key={idx} className="text-center mb-1">
                          <ProfilePicture
                            src={player.profilePicture}
                            name={player.name}
                            color={player.color}
                            size="w-14 h-14"
                          />
                          <p className="text-sm font-bold mt-1">{player.name}</p>
                          <p className="text-sm text-gray-600">{player.totalCount}</p>
                        </div>
                      ))}
                    </div>
                    <div className="w-24 h-20 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex items-center justify-center">
                      <Crown className="w-8 h-8 text-yellow-800" />
                    </div>
                    <div className="bg-yellow-400 text-yellow-800 px-4 py-1 rounded-b text-sm font-bold">1st</div>
                  </div>
                )}

                {/* Third Place */}
                {podiumData.third.length > 0 && (
                  <div className="flex flex-col items-center">
                    <div className="mb-2">
                      {podiumData.third.map((player, idx) => (
                        <div key={idx} className="text-center mb-1">
                          <ProfilePicture
                            src={player.profilePicture}
                            name={player.name}
                            color={player.color}
                            size="w-10 h-10"
                            textSize="text-xs"
                          />
                          <p className="text-xs font-medium mt-1">{player.name}</p>
                          <p className="text-xs text-gray-600">{player.totalCount}</p>
                        </div>
                      ))}
                    </div>
                    <div className="w-16 h-12 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg flex items-center justify-center">
                      <Medal className="w-5 h-5 text-amber-800" />
                    </div>
                    <div className="bg-amber-500 text-amber-800 px-2 py-1 rounded-b text-xs font-bold">3rd</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Counter Dialog */}
        <div className="flex justify-center gap-4 mb-8">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Counter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Counter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name/Category</Label>
                  <Input
                    id="name"
                    placeholder="e.g., John, Coffee Breaks, Goals..."
                    value={newCounter.name}
                    onChange={(e) => setNewCounter((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Use the same name to combine with existing counters in the leaderboard
                  </p>
                </div>
                <div>
                  <Label htmlFor="phrase">Phrase/Action to Track</Label>
                  <Input
                    id="phrase"
                    placeholder="e.g., Says 'Actually...', Drinks coffee, Scores goal..."
                    value={newCounter.phrase}
                    onChange={(e) => setNewCounter((prev) => ({ ...prev, phrase: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newCounter.color === color ? "border-gray-800" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCounter((prev) => ({ ...prev, color }))}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="profile-picture">Profile Picture (Optional)</Label>
                  <div className="mt-2">
                    {newCounter.profilePicture ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={newCounter.profilePicture || "/placeholder.svg"}
                          alt="Profile preview"
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => removeProfilePicture(false)}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300"
                          style={{ backgroundColor: newCounter.color + "20" }}
                        >
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="hidden"
                    />
                  </div>
                </div>
                <Button onClick={addCounter} className="w-full">
                  Add Counter
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={resetAllCounters}
            className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
          >
            Reset All
          </Button>
        </div>

        {/* Counters Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {counters.map((counter) => {
            const sameNameCounters = counters.filter((c) => c.name.toLowerCase() === counter.name.toLowerCase())
            const totalForName = sameNameCounters.reduce((sum, c) => sum + c.count, 0)

            return (
              <Card key={counter.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ProfilePicture
                        src={counter.profilePicture}
                        name={counter.name}
                        color={counter.color}
                        size="w-10 h-10"
                        textSize="text-xs"
                      />
                      <div>
                        <CardTitle className="text-lg">{counter.name}</CardTitle>
                        {sameNameCounters.length > 1 && (
                          <p className="text-xs text-gray-500">Combined total: {totalForName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(counter)}
                        aria-label={`Edit ${counter.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCounter(counter.id)}
                        className="text-red-600 hover:text-red-700"
                        aria-label={`Delete ${counter.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic ml-13">"{counter.phrase}"</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      onClick={() => decreaseCounter(counter.id)}
                      variant="outline"
                      size="sm"
                      disabled={counter.count === 0}
                      aria-label={`Decrease ${counter.name} counter`}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <div className="text-center">
                      <div className="text-3xl font-bold" style={{ color: counter.color }}>
                        {counter.count}
                      </div>
                      <div className="text-sm text-gray-500">count</div>
                    </div>

                    <Button
                      onClick={() => increaseCounter(counter.id)}
                      size="sm"
                      style={{ backgroundColor: counter.color }}
                      className="text-white hover:opacity-90"
                      aria-label={`Increase ${counter.name} counter`}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Leaderboard */}
        {counters.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Full Leaderboard (Combined Totals)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankedCounters.map((group) => (
                  <div key={group.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={group.rank === 1 ? "default" : "secondary"}
                          className={
                            group.rank === 1
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : group.rank === 2
                                ? "bg-gray-400 hover:bg-gray-500"
                                : group.rank === 3
                                  ? "bg-amber-600 hover:bg-amber-700"
                                  : ""
                          }
                        >
                          #{group.rank}
                        </Badge>
                        <ProfilePicture
                          src={group.profilePicture}
                          name={group.name}
                          color={group.color}
                          size="w-8 h-8"
                          textSize="text-xs"
                        />
                        <div>
                          <span className="font-medium">{group.name}</span>
                          {group.phrases.length > 1 && (
                            <p className="text-xs text-gray-500">{group.phrases.length} different phrases tracked</p>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-lg">{group.totalCount}</span>
                    </div>
                    <div className="relative ml-14">
                      <Progress value={(group.totalCount / maxGroupedCount) * 100} className="h-4" />
                      <div
                        className="absolute top-0 left-0 h-4 rounded-full transition-all duration-500 ease-in-out"
                        style={{
                          width: `${(group.totalCount / maxGroupedCount) * 100}%`,
                          backgroundColor: group.color,
                        }}
                      />
                    </div>
                    {group.phrases.length > 1 && (
                      <div className="text-xs text-gray-500 ml-14">
                        <details>
                          <summary className="cursor-pointer hover:text-gray-700">
                            View all phrases ({group.phrases.length})
                          </summary>
                          <ul className="mt-1 ml-2 list-disc">
                            {group.phrases.map((phrase, idx) => (
                              <li key={idx}>"{phrase}"</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Counter Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Counter</DialogTitle>
            </DialogHeader>
            {editingCounter && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Name/Category</Label>
                  <Input
                    id="edit-name"
                    value={editingCounter.name}
                    onChange={(e) => setEditingCounter((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Changing the name will affect leaderboard grouping</p>
                </div>
                <div>
                  <Label htmlFor="edit-phrase">Phrase/Action to Track</Label>
                  <Input
                    id="edit-phrase"
                    value={editingCounter.phrase}
                    onChange={(e) => setEditingCounter((prev) => (prev ? { ...prev, phrase: e.target.value } : null))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-color">Color</Label>
                  <div className="flex gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          editingCounter.color === color ? "border-gray-800" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditingCounter((prev) => (prev ? { ...prev, color } : null))}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-profile-picture">Profile Picture (Optional)</Label>
                  <div className="mt-2">
                    {editingCounter.profilePicture ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={editingCounter.profilePicture || "/placeholder.svg"}
                          alt="Profile preview"
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => removeProfilePicture(true)}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300"
                          style={{ backgroundColor: editingCounter.color + "20" }}
                        >
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editFileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                    )}
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="hidden"
                    />
                  </div>
                </div>
                <Button onClick={saveEdit} className="w-full">
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Empty State */}
        {counters.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500 mb-4">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No counters yet!</h3>
                <p>Add your first counter to start tracking.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
