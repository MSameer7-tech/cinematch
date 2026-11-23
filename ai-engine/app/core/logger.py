import logging
import os
from logging.handlers import RotatingFileHandler

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

def setup_logger(name: str, log_file: str, level=logging.INFO) -> logging.Logger:
    """To setup as many loggers as you want"""
    
    handler = RotatingFileHandler(
        os.path.join(LOG_DIR, log_file), 
        maxBytes=5*1024*1024, # 5MB 
        backupCount=3
    )
    handler.setFormatter(formatter)

    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Avoid duplicate logs if instantiated multiple times
    if not logger.handlers:
        logger.addHandler(handler)
        
        # Also log to console for development
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

    return logger

# Centralized Loggers
app_logger = setup_logger('application', 'application.log')
error_logger = setup_logger('errors', 'errors.log', level=logging.ERROR)
ai_logger = setup_logger('ai', 'ai.log')
rec_logger = setup_logger('recommendation', 'recommendation.log')
benchmark_logger = setup_logger('benchmark', 'benchmark.log')
