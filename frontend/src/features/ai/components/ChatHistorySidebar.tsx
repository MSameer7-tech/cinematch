import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  PanelLeftClose,
  Loader2,
  Trash
} from 'lucide-react';
import type { ConversationSummary } from '../types/ai.types';

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationSummary[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, title: string) => void;
  onDeleteConversation: (id: string) => void;
  onClearAll: () => void;
  isLoading?: boolean;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onClearAll,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c => 
      c.title.toLowerCase().includes(q) || 
      (c.last_message && c.last_message.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Group conversations by relative time
  const groupedConversations = useMemo(() => {
    const today: ConversationSummary[] = [];
    const yesterday: ConversationSummary[] = [];
    const previousWeek: ConversationSummary[] = [];
    const older: ConversationSummary[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - (7 * 86400000);

    for (const c of filteredConversations) {
      const dateStr = c.updated_at || c.created_at;
      const time = dateStr ? new Date(dateStr).getTime() : 0;

      if (time >= todayStart) {
        today.push(c);
      } else if (time >= yesterdayStart) {
        yesterday.push(c);
      } else if (time >= weekStart) {
        previousWeek.push(c);
      } else {
        older.push(c);
      }
    }

    return [
      { label: 'Today', items: today },
      { label: 'Yesterday', items: yesterday },
      { label: 'Previous 7 Days', items: previousWeek },
      { label: 'Older', items: older },
    ].filter(g => g.items.length > 0);
  }, [filteredConversations]);

  const handleStartRename = (e: React.MouseEvent, c: ConversationSummary) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
    setConfirmDeleteId(null);
  };

  const handleSaveRename = (e: React.MouseEvent | React.FormEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleRequestDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
    setEditingId(null);
  };

  const handleConfirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteConversation(id);
    setConfirmDeleteId(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div 
            className="ai-sidebar-backdrop" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose} 
          />

          <motion.aside 
            className="ai-chat-history-sidebar custom-scrollbar"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          >
        {/* Sidebar Header */}
        <div className="ai-sidebar-header">
          <div className="ai-sidebar-brand">
            <div className="ai-sidebar-logo-box">
              <img src="/logo.png" alt="CineMatch" className="ai-sidebar-logo" />
            </div>
            <span className="ai-sidebar-title">Chat History</span>
          </div>

          <button
            onClick={onClose}
            className="ai-sidebar-close-btn"
            title="Close Sidebar"
            aria-label="Close Sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* New Chat Primary Action */}
        <div className="ai-sidebar-actions-bar">
          <button
            type="button"
            className="ai-sidebar-new-chat-btn"
            onClick={onNewChat}
          >
            <Plus size={17} strokeWidth={2.5} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Conversations Input */}
        {conversations.length > 0 && (
          <div className="ai-sidebar-search-box">
            <Search size={15} className="ai-sidebar-search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ai-sidebar-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="ai-sidebar-search-clear"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}

        {/* Conversations List */}
        <div className="ai-sidebar-convos-list custom-scrollbar">
          {isLoading && conversations.length === 0 ? (
            <div className="ai-sidebar-loading-box">
              <Loader2 size={20} className="animate-spin text-purple-400" />
              <span>Loading conversations...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="ai-sidebar-empty-box">
              <MessageSquare size={28} className="ai-sidebar-empty-icon" />
              <p className="ai-sidebar-empty-title">No conversations yet</p>
              <p className="ai-sidebar-empty-desc">
                Your past chats and recommendations will appear here.
              </p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="ai-sidebar-empty-box">
              <Search size={24} className="ai-sidebar-empty-icon" />
              <p className="ai-sidebar-empty-title">No matches found</p>
              <p className="ai-sidebar-empty-desc">Try a different search keyword.</p>
            </div>
          ) : (
            groupedConversations.map((group) => (
              <div key={group.label} className="ai-sidebar-date-group">
                <div className="ai-sidebar-group-label">{group.label}</div>
                <div className="ai-sidebar-group-items">
                  {group.items.map((convo) => {
                    const isActive = convo.id === activeConversationId;
                    const isEditing = editingId === convo.id;
                    const isDeleting = confirmDeleteId === convo.id;

                    return (
                      <div
                        key={convo.id}
                        className={`ai-convo-item ${isActive ? 'active' : ''}`}
                        onClick={() => !isEditing && onSelectConversation(convo.id)}
                      >
                        <MessageSquare size={16} className="ai-convo-icon" />

                        {isEditing ? (
                          <form 
                            onSubmit={(e) => handleSaveRename(e, convo.id)}
                            className="ai-convo-edit-form"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              autoFocus
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="ai-convo-edit-input"
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                            />
                            <button
                              type="submit"
                              className="ai-convo-action-btn check"
                              title="Save title"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelRename}
                              className="ai-convo-action-btn cancel"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </form>
                        ) : isDeleting ? (
                          <div 
                            className="ai-convo-delete-confirm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="ai-delete-prompt">Delete?</span>
                            <button
                              type="button"
                              onClick={(e) => handleConfirmDelete(e, convo.id)}
                              className="ai-convo-action-btn danger"
                              title="Confirm delete"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelDelete}
                              className="ai-convo-action-btn cancel"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="ai-convo-title" title={convo.title}>
                              {convo.title}
                            </span>

                            {/* CRUD Action Buttons */}
                            <div className="ai-convo-actions">
                              <button
                                type="button"
                                onClick={(e) => handleStartRename(e, convo)}
                                className="ai-convo-action-btn"
                                title="Rename conversation"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleRequestDelete(e, convo.id)}
                                className="ai-convo-action-btn"
                                title="Delete conversation"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer with Clear All */}
        {conversations.length > 0 && (
          <div className="ai-sidebar-footer">
            {isConfirmingClearAll ? (
              <div className="ai-clear-all-confirm">
                <span className="ai-clear-all-prompt">Delete all {conversations.length} chats?</span>
                <div className="ai-clear-all-actions">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setIsConfirmingClearAll(false);
                    }}
                    className="ai-clear-confirm-btn"
                  >
                    Yes, clear all
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClearAll(false)}
                    className="ai-clear-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingClearAll(true)}
                className="ai-clear-all-btn"
              >
                <Trash size={14} />
                <span>Clear All Conversations</span>
              </button>
            )}
          </div>
        )}
      </motion.aside>
    </>
  )}
</AnimatePresence>
  );
};
