"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useFollowupStore } from "@/lib/store/followup-store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Soul, Caller, Followup } from "@/lib/types"
import { hasFollowupThisWeek, getNextFollowupDate, formatNextFollowupDate } from "@/lib/utils/followup-week-check"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FollowupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  soul: Soul | null
  caller: Caller
  onSuccess: () => void
  existingFollowup?: Followup | null // For editing existing follow-ups
}

export function FollowupModal({ open, onOpenChange, soul, caller, onSuccess, existingFollowup }: FollowupModalProps) {
  const supabase = createClient()
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<"Contacted" | "Pending" | "Not Reachable">("Contacted")
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [canSubmit, setCanSubmit] = useState(true)
  const [nextFollowupDate, setNextFollowupDate] = useState<string>("")
  const { addFollowup, updateFollowup } = useFollowupStore()
  const isUpdateMode = !!existingFollowup

  useEffect(() => {
    const checkFollowupEligibility = async () => {
      if (!soul || !open) return

      // If we're in update mode, skip the weekly check and pre-fill the form
      if (isUpdateMode && existingFollowup) {
        setNotes(existingFollowup.notes || "")
        setStatus(existingFollowup.status)
        setCanSubmit(true)
        setIsChecking(false)
        return
      }

      setIsChecking(true)
      try {
        const { data: followups } = await supabase
          .from("followups")
          .select("date, caller_id, soul_id")
          .eq("soul_id", soul.id)
          .eq("caller_id", caller.id)

        const hasFollowup = hasFollowupThisWeek(followups || [], soul.id, caller.id)
        setCanSubmit(!hasFollowup)

        if (hasFollowup) {
          const nextDate = getNextFollowupDate()
          setNextFollowupDate(formatNextFollowupDate(nextDate))
        } else {
          setNextFollowupDate("")
        }
      } catch (error) {
        console.error("Failed to check follow-up eligibility:", error)
        setCanSubmit(true) // Allow submission if check fails
      } finally {
        setIsChecking(false)
      }
    }

    if (open && soul) {
      checkFollowupEligibility()
    } else {
      setNotes("")
      setStatus("Contacted")
      setCanSubmit(true)
      setNextFollowupDate("")
    }
  }, [open, soul, caller, supabase, isUpdateMode, existingFollowup])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!soul) {
      toast.error("No soul selected")
      return
    }

    if (!canSubmit && !isUpdateMode) {
      toast.error("A follow-up has already been recorded for this soul this week")
      return
    }

    setIsLoading(true)
    try {
      if (isUpdateMode && existingFollowup) {
        // Update existing follow-up
        await updateFollowup(existingFollowup.id, {
          notes,
          status,
        })
        toast.success("Follow-up updated!")
      } else {
        // Create new follow-up
        await addFollowup({
          soul_id: soul.id,
          caller_id: caller.id,
          date: new Date().toISOString(),
          notes,
          status,
        })
        toast.success("Follow-up recorded!")
      }

      setNotes("")
      setStatus("Contacted")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${isUpdateMode ? 'update' : 'record'} follow-up`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isUpdateMode ? 'Update Follow-up' : 'Log Follow-up'}</DialogTitle>
          <DialogDescription>{soul?.full_name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!canSubmit && nextFollowupDate && !isUpdateMode && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                A follow-up has already been recorded for this soul this week.
                <br />
                Next follow-up available: <strong>{nextFollowupDate}</strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)} disabled={isLoading}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Not Reachable">Not Reachable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="What happened during this follow-up..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              className="min-h-24"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isChecking || !canSubmit}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : isChecking ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Checking...
                </>
              ) : !canSubmit && !isUpdateMode ? (
                "Already Done This Week"
              ) : (
                isUpdateMode ? "Update Follow-up" : "Save Follow-up"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
