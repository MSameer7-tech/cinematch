import json
import re
from typing import Dict, Any

class JSONParser:
    @staticmethod
    def parse_llm_json(response_text: str) -> Dict[str, Any]:
        """
        Robustly extracts JSON from an LLM response which might include
        markdown formatting (e.g. ```json ... ```) or conversational fluff.
        """
        # Remove potential markdown formatting
        text = response_text.strip()
        if text.startswith("```"):
            # find first newline after ```
            first_newline = text.find("\n")
            last_backticks = text.rfind("```")
            if first_newline != -1 and last_backticks != -1:
                text = text[first_newline+1:last_backticks].strip()
        
        # If it doesn't look like JSON, try to extract the first { ... } block
        if not (text.startswith("{") and text.endswith("}")):
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                text = match.group(0)
                
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse JSON from LLM: {text}") from e
