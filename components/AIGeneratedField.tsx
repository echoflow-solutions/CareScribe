'use client'

import { useState } from 'react'
import { Check, Edit2, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

interface AIGeneratedFieldProps {
  value: string
  onValueChange: (value: string) => void
  onApprove: () => void
  isApproved: boolean
  isAiGenerated: boolean
  label: string
  type?: 'input' | 'textarea'
  rows?: number
  placeholder?: string
}

export function AIGeneratedField({
  value,
  onValueChange,
  onApprove,
  isApproved,
  isAiGenerated,
  label,
  type = 'textarea',
  rows = 3,
  placeholder
}: AIGeneratedFieldProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleApprove = () => {
    setIsEditing(false)
    onApprove()
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  if (!isAiGenerated) {
    // Regular field - no AI indicators
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        {type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder}
          />
        )}
      </div>
    )
  }

  // AI-generated field with approval mechanism
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-2">
          {!isApproved && (
            <Badge variant="outline" className="gap-1 bg-orange-50 text-orange-700 border-orange-200">
              <Sparkles className="h-3 w-3" />
              AI Generated - Review Required
            </Badge>
          )}
          {isApproved && (
            <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
              <Check className="h-3 w-3" />
              Approved
            </Badge>
          )}
        </div>
      </div>

      <div className={`relative ${isApproved ? 'bg-white' : 'bg-orange-50'} rounded-md border ${isApproved ? 'border-green-200' : 'border-orange-200'} transition-colors duration-200`}>
        {type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e) => {
              onValueChange(e.target.value)
              setIsEditing(true)
            }}
            rows={rows}
            placeholder={placeholder}
            className={`resize-none border-0 focus-visible:ring-0 ${isApproved ? 'bg-white' : 'bg-orange-50'}`}
            disabled={isApproved && !isEditing}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => {
              onValueChange(e.target.value)
              setIsEditing(true)
            }}
            placeholder={placeholder}
            className={`border-0 focus-visible:ring-0 ${isApproved ? 'bg-white' : 'bg-orange-50'}`}
            disabled={isApproved && !isEditing}
          />
        )}

        {!isApproved && (
          <div className="flex gap-2 p-2 border-t border-orange-200 bg-white">
            <Button
              size="sm"
              variant="outline"
              onClick={handleEdit}
              className="flex-1"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              onClick={handleApprove}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-3 w-3 mr-1" />
              Approve
            </Button>
          </div>
        )}

        {isApproved && isEditing && (
          <div className="flex gap-2 p-2 border-t border-gray-200 bg-white">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApprove}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check className="h-3 w-3 mr-1" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {!isApproved && (
        <p className="text-xs text-orange-600 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          This information was inferred by AI. Please review and approve or edit before submitting.
        </p>
      )}
    </div>
  )
}
