class CineMatchException(Exception):
    """Base exception for CineMatch API"""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", status_code: int = 500):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)

class RecommendationException(CineMatchException):
    def __init__(self, message: str):
        super().__init__(message, code="RECOMMENDATION_ERROR", status_code=500)

class AIException(CineMatchException):
    def __init__(self, message: str):
        super().__init__(message, code="AI_ERROR", status_code=502)

class TMDBException(CineMatchException):
    def __init__(self, message: str):
        super().__init__(message, code="TMDB_ERROR", status_code=502)

class ValidationException(CineMatchException):
    def __init__(self, message: str):
        super().__init__(message, code="VALIDATION_ERROR", status_code=400)
