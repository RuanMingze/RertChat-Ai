"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Conversation } from "@/lib/chat-store"
import { cn } from "@/lib/utils"
import {
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Pencil,
} from "lucide-react"
import { ContextMenu, ContextMenuItem } from "@/components/ui/context-menu-custom"
import { RenameDialog } from "@/components/ui/rename-dialog"

interface ChatSidebarProps {
  conversations: Conversation[]
  currentId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onRename: (id: string, newName: string) => void
  isOpen: boolean
  onToggle: () => void
}

export function ChatSidebar({
  conversations,
  currentId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  isOpen,
  onToggle,
}: ChatSidebarProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    conversationId: string | null
  }>({ x: 0, y: 0, conversationId: null })

  const [renameDialog, setRenameDialog] = useState<{
    isOpen: boolean
    conversationId: string | null
    currentName: string
  }>({ isOpen: false, conversationId: null, currentName: "" })

  const handleContextMenu = (
    e: React.MouseEvent,
    conversation: Conversation
  ) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      conversationId: conversation.id,
    })
  }

  const handleRename = () => {
    const conversation = conversations.find((c) => c.id === contextMenu.conversationId)
    if (conversation) {
      setRenameDialog({
        isOpen: true,
        conversationId: conversation.id,
        currentName: conversation.title,
      })
      setContextMenu({ x: 0, y: 0, conversationId: null })
    }
  }

  const handleDelete = () => {
    if (contextMenu.conversationId) {
      onDelete(contextMenu.conversationId)
      setContextMenu({ x: 0, y: 0, conversationId: null })
    }
  }

  const handleRenameConfirm = (newName: string) => {
    if (renameDialog.conversationId) {
      onRename(renameDialog.conversationId, newName)
    }
    setRenameDialog({ isOpen: false, conversationId: null, currentName: "" })
  }

  const handleRenameCancel = () => {
    setRenameDialog({ isOpen: false, conversationId: null, currentName: "" })
  }

  return (
    <>
      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="fixed left-4 top-4 z-50 h-10 w-10 rounded-xl bg-card shadow-sm hover:bg-secondary"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sidebar-foreground" />
            <h2 className="hidden sm:block text-lg font-semibold text-sidebar-foreground">对话历史</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-3">
          <Button
            onClick={onNew}
            className="w-full justify-center gap-2 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">新建对话</span>
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 pb-4">
            {conversations.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-sidebar-foreground/50">
                暂无对话历史
              </p>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative flex items-center rounded-xl transition-colors",
                    currentId === conversation.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  )}
                  onContextMenu={(e) => handleContextMenu(e, conversation)}
                >
                  <button
                    onClick={() => onSelect(conversation.id)}
                    className="flex flex-1 items-center gap-3 px-3 py-3 text-left"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-sidebar-foreground/70" />
                    <span className="truncate text-sm text-sidebar-foreground">
                      {conversation.title}
                    </span>
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Context Menu */}
      {contextMenu.conversationId && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu({ x: 0, y: 0, conversationId: null })}
        >
          <ContextMenuItem onClick={handleRename}>
            <Pencil className="mr-2 h-4 w-4" />
            重命名
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </ContextMenuItem>
        </ContextMenu>
      )}

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={renameDialog.isOpen}
        currentName={renameDialog.currentName}
        onConfirm={handleRenameConfirm}
        onCancel={handleRenameCancel}
      />

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  )
}
