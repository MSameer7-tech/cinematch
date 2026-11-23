import pytest
from app.ai.utils.json_parser import JSONParser
from app.ai.schemas.intent_schema import IntentSchema

def test_json_parser_clean():
    clean_json = '{"intent": "recommend", "mood": "happy"}'
    parsed = JSONParser.parse_llm_json(clean_json)
    assert parsed["intent"] == "recommend"
    assert parsed["mood"] == "happy"

def test_json_parser_markdown():
    markdown_json = '''
    Sure! Here is the JSON:
    ```json
    {
      "intent": "similar",
      "reference_movies": ["Interstellar"]
    }
    ```
    Have a nice day!
    '''
    parsed = JSONParser.parse_llm_json(markdown_json)
    assert parsed["intent"] == "similar"
    assert parsed["reference_movies"] == ["Interstellar"]

def test_intent_schema_validation():
    data = {
        "intent": "recommend",
        "preferred_genres": ["Sci-Fi"],
        "runtime": {"max": 120}
    }
    intent = IntentSchema(**data)
    assert intent.intent == "recommend"
    assert intent.preferred_genres == ["Sci-Fi"]
    assert intent.runtime.max == 120
    assert intent.mood is None
