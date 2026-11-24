import json
import os

movies = [
    {
        "id": 579974,
        "title": "RRR",
        "original_title": "RRR",
        "overview": "A fictional history of two legendary revolutionaries journey away from home before they began fighting for their country in the 1920s.",
        "poster_path": "/nEufeZlyAOLqO2brrs0yeF1lgXO.jpg",
        "backdrop_path": "/7bJnW2l2tT9qK3DkFv1Qz4V1X9.jpg",
        "genres": [{"id": 28, "name": "Action"}, {"id": 18, "name": "Drama"}, {"id": 36, "name": "History"}],
        "genre_ids": [28, 18, 36],
        "release_date": "2022-03-24",
        "vote_average": 7.8,
        "vote_count": 1480,
        "popularity": 68.4,
        "runtime": 187,
        "original_language": "te",
        "production_countries": [{"iso_3166_1": "IN", "name": "India"}],
        "status": "Released",
        "tagline": "Rise, Roar, Revolt",
        "credits": {
            "cast": [
                {"id": 1, "name": "N.T. Rama Rao Jr.", "character": "Komaram Bheem"},
                {"id": 2, "name": "Ram Charan", "character": "Alluri Sitarama Raju"},
                {"id": 3, "name": "Alia Bhatt", "character": "Sita"},
                {"id": 4, "name": "Ajay Devgn", "character": "Venkata Rama Raju"}
            ],
            "crew": [{"id": 10, "name": "S.S. Rajamouli", "job": "Director"}]
        }
    },
    {
        "id": 864692,
        "title": "Pathaan",
        "original_title": "Pathaan",
        "overview": "An Indian raw agent turned exile must team up with an enigmatic partner to thwart a rogue mercenary unit from unleashing a biological weapon upon India.",
        "poster_path": "/m1b9ToCVN5z8u1f8u9Q3q2N4w1.jpg",
        "backdrop_path": "/a2t653Z0J6f79PZ1u1l9o7A94Q7.jpg",
        "genres": [{"id": 28, "name": "Action"}, {"id": 12, "name": "Adventure"}, {"id": 53, "name": "Thriller"}],
        "genre_ids": [28, 12, 53],
        "release_date": "2023-01-25",
        "vote_average": 6.6,
        "vote_count": 420,
        "popularity": 45.2,
        "runtime": 146,
        "original_language": "hi",
        "production_countries": [{"iso_3166_1": "IN", "name": "India"}],
        "status": "Released",
        "tagline": "Party Pathaan ke ghar rakhoge, toh mehmaannawazi ke liye Pathaan toh aayega",
        "credits": {
            "cast": [
                {"id": 11, "name": "Shah Rukh Khan", "character": "Pathaan"},
                {"id": 12, "name": "Deepika Padukone", "character": "Rubina Mohsin"},
                {"id": 13, "name": "John Abraham", "character": "Jim"}
            ],
            "crew": [{"id": 20, "name": "Siddharth Anand", "job": "Director"}]
        }
    },
    {
        "id": 297222,
        "title": "PK",
        "original_title": "पीके",
        "overview": "An alien on Earth loses the remote control to his spaceship. His innocent questions and childlike curiosity challenge humanity's blind faith and religious dogma.",
        "poster_path": "/z84P9wZkP4qB5v7N2b3Q1m8K1v.jpg",
        "backdrop_path": "/1k8d1wQ3v8k1P4j2N7m5Q1b9m2.jpg",
        "genres": [{"id": 35, "name": "Comedy"}, {"id": 18, "name": "Drama"}, {"id": 878, "name": "Science Fiction"}],
        "genre_ids": [35, 18, 878],
        "release_date": "2014-12-19",
        "vote_average": 7.7,
        "vote_count": 980,
        "popularity": 24.5,
        "runtime": 153,
        "original_language": "hi",
        "production_countries": [{"iso_3166_1": "IN", "name": "India"}],
        "status": "Released",
        "tagline": "One innocent question can shake a billion beliefs",
        "credits": {
            "cast": [
                {"id": 21, "name": "Aamir Khan", "character": "PK"},
                {"id": 22, "name": "Anushka Sharma", "character": "Jagat Janani"},
                {"id": 23, "name": "Sushant Singh Rajput", "character": "Sarfaraz Yousuf"},
                {"id": 24, "name": "Boman Irani", "character": "Cherry Bajwa"}
            ],
            "crew": [{"id": 30, "name": "Rajkumar Hirani", "job": "Director"}]
        }
    },
    {
        "id": 348892,
        "title": "Bajrangi Bhaijaan",
        "original_title": "बजरंगी भाईजान",
        "overview": "A magnanimous Indian man embarks on an arduous quest to reunite a mute young Pakistani girl with her family across the border against all odds.",
        "poster_path": "/x2N1vQ3v8k1P4j2N7m5Q1b9m2v.jpg",
        "backdrop_path": "/2k8d1wQ3v8k1P4j2N7m5Q1b9m2.jpg",
        "genres": [{"id": 28, "name": "Action"}, {"id": 18, "name": "Drama"}, {"id": 35, "name": "Comedy"}],
        "genre_ids": [28, 18, 35],
        "release_date": "2015-07-17",
        "vote_average": 7.8,
        "vote_count": 650,
        "popularity": 28.7,
        "runtime": 163,
        "original_language": "hi",
        "production_countries": [{"iso_3166_1": "IN", "name": "India"}],
        "status": "Released",
        "tagline": "No passport. No visa. Just pure love.",
        "credits": {
            "cast": [
                {"id": 31, "name": "Salman Khan", "character": "Pawan Kumar Chaturvedi (Bajrangi)"},
                {"id": 32, "name": "Harshaali Malhotra", "character": "Shahida (Munni)"},
                {"id": 33, "name": "Kareena Kapoor Khan", "character": "Rasika"},
                {"id": 34, "name": "Nawazuddin Siddiqui", "character": "Chand Nawab"}
            ],
            "crew": [{"id": 40, "name": "Kabir Khan", "job": "Director"}]
        }
    },
    {
        "id": 15301,
        "title": "Sholay",
        "original_title": "शोले",
        "overview": "After his family is murdered by a ruthless bandit, a former police officer enlists two daring outlaws to bring the criminal to justice.",
        "poster_path": "/mFm2Q3o6X8hQ114C7vG1d7Vz2K1.jpg",
        "backdrop_path": "/k7C1wZz1j5qA3ZgE1d2v3Vz4K5.jpg",
        "genres": [{"id": 28, "name": "Action"}, {"id": 12, "name": "Adventure"}, {"id": 18, "name": "Drama"}],
        "genre_ids": [28, 12, 18],
        "release_date": "1975-08-15",
        "vote_average": 7.6,
        "vote_count": 320,
        "popularity": 16.2,
        "runtime": 198,
        "original_language": "hi",
        "production_countries": [{"iso_3166_1": "IN", "name": "India"}],
        "status": "Released",
        "tagline": "The greatest star cast ever assembled – the greatest story ever told",
        "credits": {
            "cast": [
                {"id": 41, "name": "Amitabh Bachchan", "character": "Jai"},
                {"id": 42, "name": "Dharmendra", "character": "Veeru"},
                {"id": 43, "name": "Amjad Khan", "character": "Gabbar Singh"},
                {"id": 44, "name": "Hema Malini", "character": "Basanti"},
                {"id": 45, "name": "Sanjeev Kumar", "character": "Thakur Baldev Singh"}
            ],
            "crew": [{"id": 50, "name": "Ramesh Sippy", "job": "Director"}]
        }
    },
    {
        "id": 534780,
        "title": "Andhadhun",
        "original_title": "अंधाधुन",
        "overview": "A visually impaired pianist unwittingly becomes entangled in a web of murders and deception after witnessing the crime of a former film star.",
        "poster_path": "/dyhaB19AIC4PkYqJ6q2mFh8A060.jpg",
        "backdrop_path": "/1XG1yY59F7k2h6G4q7l9o7A94Q7.jpg",
        "genres": [{"id": 80, "name": "Crime"}, {"id": 53, "name": "Thriller"}, {"id": 35, "name": "Comedy"}],
        "genre_ids": [80, 53, 35],
        "release_date": "2018-10-05",
        "vote_average": 7.7,
        "vote_count": 560,
        "popularity": 22.3,
        "runtime": 139,
        "original_language": "hi",
        "production_countries": [{"iso_3166_1": "IN", "name": "India"}],
        "status": "Released",
        "tagline": "He can see what you cannot. But can he survive what he saw?",
        "credits": {
            "cast": [
                {"id": 51, "name": "Ayushmann Khurrana", "character": "Akash"},
                {"id": 52, "name": "Tabu", "character": "Simi"},
                {"id": 53, "name": "Radhika Apte", "character": "Sophie"}
            ],
            "crew": [{"id": 60, "name": "Sriram Raghavan", "job": "Director"}]
        }
    },
    {
        "id": 1111873,
        "title": "Stree 2: Sarkate Ka Aatank",
        "original_title": "स्त्री २",
        "overview": "The town of Chanderi is haunted once more, this time by a headless entity abducting women. Vicky and his companions must reunite with the mysterious Stree to defeat it.",
        "poster_path": "/mFjG9Vn7nU37j8G3h0r0L1b0w7X.jpg",
        "backdrop_path": "/34mK3a8gK8w7X9k0m1L8o9Q3q2N.jpg",
        "genres": [{"id": 35, "name": "Comedy"}, {"id": 27, "name": "Horror"}],
        "genre_ids": [35, 27],
        "release_date": "2024-08-15",
        "vote_average": 7.2,
        "vote_count": 380,
        "popularity": 62.1,
        "runtime": 147,
        "original_language": "hi",
        "production_countries": [{"iso_3166_1": "IN", "name": "India"}],
        "status": "Released",
        "tagline": "O Stree, Raksha Karna",
        "credits": {
            "cast": [
                {"id": 61, "name": "Rajkummar Rao", "character": "Vicky"},
                {"id": 62, "name": "Shraddha Kapoor", "character": "The Nameless Woman"},
                {"id": 63, "name": "Pankaj Tripathi", "character": "Rudra"},
                {"id": 64, "name": "Abhishek Banerjee", "character": "Jana"}
            ],
            "crew": [{"id": 70, "name": "Amar Kaushik", "job": "Director"}]
        }
    }
]

targets = ["ai-engine/data/raw", "ai-engine/app/data/raw"]
for target_dir in targets:
    os.makedirs(target_dir, exist_ok=True)
    for m in movies:
        mid = m["id"]
        out_path = os.path.join(target_dir, f"movie_{mid}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(m, f, indent=2)
        print(f"Wrote {out_path}")
