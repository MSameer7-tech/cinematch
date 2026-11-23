import os
import json
import re
from datetime import datetime
from typing import Dict, Any, List, Optional

CONVERSATIONS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "conversations")

def sanitize_user_id(user_id: str) -> str:
    if not user_id:
        return "guest"
    # Allow alphanumeric, dashes, and underscores
    return re.sub(r'[^a-zA-Z0-9_\-]', '_', str(user_id))

class ConversationStore:
    def __init__(self):
        os.makedirs(CONVERSATIONS_DIR, exist_ok=True)

    def _get_file_path(self, user_id: str) -> str:
        safe_id = sanitize_user_id(user_id)
        return os.path.join(CONVERSATIONS_DIR, f"{safe_id}.json")

    def _load_data(self, user_id: str) -> Dict[str, Any]:
        file_path = self._get_file_path(user_id)
        if not os.path.exists(file_path):
            return {"conversations": {}}
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if not isinstance(data, dict) or "conversations" not in data:
                    return {"conversations": {}}
                return data
        except Exception as e:
            print(f"[ConversationStore] Error loading {file_path}: {e}")
            return {"conversations": {}}

    def _save_data(self, user_id: str, data: Dict[str, Any]) -> None:
        file_path = self._get_file_path(user_id)
        try:
            temp_path = f"{file_path}.tmp"
            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            os.replace(temp_path, file_path)
        except Exception as e:
            print(f"[ConversationStore] Error saving {file_path}: {e}")

    def list_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        data = self._load_data(user_id)
        convs = list(data.get("conversations", {}).values())
        # Sort by updated_at descending
        convs.sort(key=lambda c: c.get("updated_at", c.get("created_at", "")), reverse=True)
        # Return summary without full message payload for fast sidebar loading
        summaries = []
        for c in convs:
            messages = c.get("messages", [])
            last_msg = messages[-1].get("content", "") if messages else ""
            summaries.append({
                "id": c.get("id"),
                "title": c.get("title", "New Conversation"),
                "created_at": c.get("created_at"),
                "updated_at": c.get("updated_at"),
                "message_count": len(messages),
                "last_message": last_msg[:80] if last_msg else ""
            })
        return summaries

    def get_conversation(self, user_id: str, conversation_id: str) -> Optional[Dict[str, Any]]:
        data = self._load_data(user_id)
        return data.get("conversations", {}).get(conversation_id)

    def save_conversation(self, user_id: str, conversation: Dict[str, Any]) -> Dict[str, Any]:
        cid = conversation.get("id")
        if not cid:
            raise ValueError("Conversation must have an 'id'")
        
        data = self._load_data(user_id)
        now = datetime.utcnow().isoformat()
        
        existing = data.get("conversations", {}).get(cid)
        if existing:
            existing.update(conversation)
            existing["updated_at"] = now
            if not existing.get("title") and conversation.get("title"):
                existing["title"] = conversation["title"]
            data["conversations"][cid] = existing
            self._save_data(user_id, data)
            return existing
        else:
            conversation["created_at"] = conversation.get("created_at") or now
            conversation["updated_at"] = now
            if not conversation.get("title"):
                # Generate clean initial title from first message
                first_msg = conversation.get("messages", [{}])[0].get("content", "")
                conversation["title"] = first_msg[:35] + ("..." if len(first_msg) > 35 else "") if first_msg else "New Conversation"
            data["conversations"][cid] = conversation
            self._save_data(user_id, data)
            return conversation

    def rename_conversation(self, user_id: str, conversation_id: str, new_title: str) -> Optional[Dict[str, Any]]:
        data = self._load_data(user_id)
        conv = data.get("conversations", {}).get(conversation_id)
        if not conv:
            return None
        conv["title"] = new_title.strip() or "Untitled Chat"
        conv["updated_at"] = datetime.utcnow().isoformat()
        data["conversations"][conversation_id] = conv
        self._save_data(user_id, data)
        return conv

    def delete_conversation(self, user_id: str, conversation_id: str) -> bool:
        data = self._load_data(user_id)
        if conversation_id in data.get("conversations", {}):
            del data["conversations"][conversation_id]
            self._save_data(user_id, data)
            return True
        return False

    def clear_all(self, user_id: str) -> bool:
        data = {"conversations": {}}
        self._save_data(user_id, data)
        return True

conversation_store = ConversationStore()
