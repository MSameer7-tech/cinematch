import os
import sys
import time
import requests

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.cache.recommendation_cache import recommendation_cache

def check_models():
    print("\n🔍 Checking Model Artifacts...")
    artifacts = [
        "artifacts/vectorizers/tfidf_vectorizer_v1.pkl",
        "artifacts/matrices/tfidf_matrix_v1.npz",
        "artifacts/matrices/cosine_similarity_v1.npy",
        "artifacts/metadata/model_info_v1.json"
    ]
    
    all_exist = True
    for path in artifacts:
        if os.path.exists(path):
            print(f"  ✅ Found: {path}")
        else:
            print(f"  ❌ Missing: {path}")
            all_exist = False
            
    return all_exist

def check_cache():
    print("\n🔍 Checking Cache Engine...")
    try:
        recommendation_cache.set("health_test", [{"movie_id": 1}])
        val = recommendation_cache.get("health_test")
        recommendation_cache.invalidate("health_test")
        
        if val and val[0]["movie_id"] == 1:
            print("  ✅ Cache operations (SET/GET/INVALIDATE) working correctly.")
            return True
        else:
            print("  ❌ Cache mismatch error.")
            return False
    except Exception as e:
        print(f"  ❌ Cache Error: {e}")
        return False

def check_apis():
    print("\n🔍 Checking APIs...")
    base_url = "http://localhost:8000/api"
    
    apis = [
        {"name": "Docs (Liveness)", "url": "http://localhost:8000/docs", "method": "GET", "headers": {}},
        {"name": "Analytics (Auth Check)", "url": f"{base_url}/recommendations/analytics", "method": "GET", "headers": {"X-Admin-Key": "local_admin_secret"}},
    ]
    
    all_ok = True
    for api in apis:
        try:
            start = time.time()
            if api["method"] == "GET":
                res = requests.get(api["url"], headers=api["headers"], timeout=5)
            else:
                res = requests.post(api["url"], headers=api["headers"], json={}, timeout=5)
                
            elapsed = time.time() - start
            
            if res.status_code in [200, 422]: # 422 means reachable but missing body for POST
                print(f"  ✅ {api['name']} ({(elapsed*1000):.1f}ms) - Status: {res.status_code}")
            else:
                print(f"  ⚠️ {api['name']} returned status {res.status_code}")
        except Exception as e:
            print(f"  ❌ {api['name']} Failed: {e}")
            all_ok = False
            
    return all_ok

def run_health_check():
    print("="*50)
    print("🏥 CineMatch System Health Check")
    print("="*50)
    
    m_ok = check_models()
    c_ok = check_cache()
    a_ok = check_apis()
    
    print("\n" + "="*50)
    if m_ok and c_ok and a_ok:
        print("✅ ALL SYSTEMS GO")
    else:
        print("⚠️ HEALTH CHECK FAILED / WARNINGS DETECTED")

if __name__ == "__main__":
    run_health_check()
