# Genre relationships graph with weights
# Formatted as Dict[str, List[Tuple[str, float]]]
GENRE_GRAPH = {
    "Science Fiction": [("Adventure", 0.9), ("Mystery", 0.7), ("Thriller", 0.6)],
    "Drama": [("History", 0.8), ("Biography", 0.7), ("War", 0.6)],
    "Comedy": [("Romance", 0.8), ("Family", 0.7)],
    "Horror": [("Thriller", 0.8), ("Mystery", 0.6)],
    "Adventure": [("Action", 0.9), ("Fantasy", 0.8), ("Science Fiction", 0.7)],
    "Action": [("Adventure", 0.9), ("Thriller", 0.8), ("Crime", 0.7)],
    "Thriller": [("Mystery", 0.8), ("Crime", 0.8), ("Horror", 0.6)],
    "Romance": [("Drama", 0.8), ("Comedy", 0.8)],
    "Mystery": [("Thriller", 0.9), ("Crime", 0.7), ("Science Fiction", 0.6)],
    "Fantasy": [("Adventure", 0.9), ("Family", 0.7)]
}

def get_adjacent_genres(genre: str) -> list:
    """
    Returns list of adjacent genres sorted by weight.
    """
    return GENRE_GRAPH.get(genre, [])
