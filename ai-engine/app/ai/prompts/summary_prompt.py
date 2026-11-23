SUMMARY_PROMPT = """Summarize the following chat history into a concise block of memory.
Retain the user's stated movie preferences, constraints (e.g. 'doesn't like horror'), and the core flow of the conversation. 
Do not include conversational filler. Keep it as compact as possible.

CHAT HISTORY TO SUMMARIZE:
{chat_history}"""
