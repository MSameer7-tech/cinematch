from app.content.models.homepage_models import HomepageContext, SectionPage

class BaseDiscoveryStrategy:
    async def generate(self, context: HomepageContext, page: int = 1, page_size: int = 20) -> SectionPage:
        """
        Generates a SectionPage of dictionaries representing movies for the section.
        Each movie dictionary must contain at least an 'id' key.
        """
        raise NotImplementedError
