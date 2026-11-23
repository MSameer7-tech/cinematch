import os
import sys
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.recommender.recommendation_service import RecommendationService

def test():
    print("Initializing Recommendation Service (Loading Models)...")
    service = RecommendationService()
    
    print("Generating Recommendations for Default User...")
    results = service.get_recommendations(user_id=None, limit=5)
    
    print("\n--- Final Recommendations ---")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    test()
