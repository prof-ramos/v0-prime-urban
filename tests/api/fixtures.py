"""
Factories para dados de teste do Payload CMS.

Este módulo fornece funções factory para criar dados de teste
para Properties, Leads, Users, etc.

Uso:
    from tests.api.fixtures import PropertyFactory, LeadFactory

    property_data = PropertyFactory.minimal()
    lead_data = LeadFactory.with_phone_and_email()
"""

from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import random


# =============================================================================
# FACTORY BASE
# =============================================================================

class BaseFactory:
    """Classe base para factories."""

    @classmethod
    def _generate_id(cls) -> str:
        """Gera um ID único para teste."""
        import uuid
        return str(uuid.uuid4())

    @classmethod
    def _generate_timestamp(cls) -> str:
        """Gera timestamp atual."""
        return datetime.utcnow().isoformat()

    @classmethod
    def _random_int(cls, min_val: int, max_val: int) -> int:
        """Gera inteiro aleatório."""
        return random.randint(min_val, max_val)


# =============================================================================
# PROPERTY FACTORY
# =============================================================================

class PropertyFactory(BaseFactory):
    """Factory para criar dados de testes de Properties."""

    # Dados de exemplo
    STREET_NAMES = [
        "Rua das Acácias", "Rua das Orquídeas", "Rua das Rosas",
        "Avenida das Nações", "Avenida Principal", "Rua Central",
        "Rua das Palmeiras", "Avenida do Comércio", "Rua do Comércio",
    ]
    NEIGHBORHOOD_NAMES = [
        "Asa Norte", "Asa Sul", "Lago Norte", "Lago Sul",
        "Nor", "Setor Bueno", "Sudoeste", "Candangolândia",
    ]

    @classmethod
    def minimal(
        cls,
        neighborhood_id: str,
        media_id: str,
        agent_id: str
    ) -> Dict[str, Any]:
        """
        Cria dados mínimos para uma propriedade.

        Args:
            neighborhood_id: ID do bairro (requerido)
            media_id: ID da imagem de destaque (requerido)
            agent_id: ID do agent responsável (requerido)

        Returns:
            Dict com dados mínimos da propriedade
        """
        return {
            "title": f"Apartamento Teste {cls._random_int(1000, 9999)}",
            "type": "sale",
            "category": "apartment",
            "status": "draft",
            "price": cls._random_int(300000, 2000000),
            "shortDescription": "Apartamento espaçoso em ótima localização",
            "fullDescription": {
                "root": {
                    "type": "root",
                    "format": "",
                    "indent": 0,
                    "version": 1,
                    "direction": "ltr",
                    "children": [
                        {
                            "type": "paragraph",
                            "format": "",
                            "indent": 0,
                            "version": 1,
                            "direction": "ltr",
                            "children": [
                                {
                                    "type": "text",
                                    "text": "Apartamento com 3 quartos, sendo 1 suíte, 2 banheiros, 2 vagas de garagem. Área gourmet, varanda gourmet. Próximo ao comércio e escolas.",
                                    "version": 1,
                                }
                            ],
                        }
                    ],
                }
            },
            "address": {
                "street": random.choice(cls.STREET_NAMES),
                "number": str(cls._random_int(1, 9999)),
                "complement": f"Apto {cls._random_int(101, 505)}",
                "neighborhood": neighborhood_id,
            },
            "featuredImage": media_id,
            "agent": agent_id,
        }

    @classmethod
    def complete(
        cls,
        neighborhood_id: str,
        media_id: str,
        agent_id: str
    ) -> Dict[str, Any]:
        """
        Cria dados completos para uma propriedade.

        Args:
            neighborhood_id: ID do bairro
            media_id: ID da imagem de destaque
            agent_id: ID do agent responsável

        Returns:
            Dict com dados completos da propriedade
        """
        base = cls.minimal(neighborhood_id, media_id, agent_id)

        base.update({
            "code": "",  # Será gerado automaticamente
            "slug": "",  # Será gerado automaticamente
            "reference": f"REF-{cls._random_int(10000, 99999)}",
            "rentalPrice": cls._random_int(1500, 8000) if random.choice([True, False]) else None,
            "condominiumFee": cls._random_int(300, 1500),
            "iptu": cls._random_int(100, 500),
            "privateArea": cls._random_int(50, 300),
            "totalArea": cls._random_int(60, 350),
            "bedrooms": cls._random_int(1, 4),
            "suites": cls._random_int(0, 2),
            "bathrooms": cls._random_int(1, 4),
            "parkingSpaces": cls._random_int(1, 3),
            "features": [
                "Piscina", "Academia", "Churrasqueira",
                "Salão de festas", "Portaria 24h", "Segurança 24h"
            ][:cls._random_int(2, 6)],
            "amenities": {
                "furnished": random.choice([True, False]),
                "airConditioning": random.choice([True, False]),
                "pool": random.choice([True, False]),
                "gym": random.choice([True, False]),
                "partyHall": random.choice([True, False]),
                "bbq": random.choice([True, False]),
            },
            "gallery": [media_id],  # Pode adicionar mais imagens
            "floor": cls._random_int(1, 20),
            "unitsPerFloor": cls._random_int(2, 8),
            "totalFloors": cls._random_int(10, 30),
            "yearBuilt": cls._random_int(2000, 2024),
            "propertyTax": cls._random_int(500, 3000),
            "isActive": True,
            "isFeatured": random.choice([True, False]),
            "acceptsPets": random.choice([True, False]),
            "solarOrientation": random.choice(["N", "S", "L", "O"]),
            "views": ["Lago", "Parque", "Cidade"][:cls._random_int(0, 3)],
        })

        return base

    @classmethod
    def for_sale(cls, neighborhood_id: str, media_id: str, agent_id: str) -> Dict[str, Any]:
        """Cria propriedade para venda."""
        data = cls.minimal(neighborhood_id, media_id, agent_id)
        data["type"] = "sale"
        return data

    @classmethod
    def for_rent(cls, neighborhood_id: str, media_id: str, agent_id: str) -> Dict[str, Any]:
        """Cria propriedade para locação."""
        data = cls.minimal(neighborhood_id, media_id, agent_id)
        data["type"] = "rent"
        data["rentalPrice"] = cls._random_int(1500, 8000)
        return data

    @classmethod
    def published(cls, neighborhood_id: str, media_id: str, agent_id: str) -> Dict[str, Any]:
        """Cria propriedade publicada."""
        data = cls.complete(neighborhood_id, media_id, agent_id)
        data["status"] = "published"
        return data

    @classmethod
    def with_invalid_price(cls, neighborhood_id: str, media_id: str, agent_id: str) -> Dict[str, Any]:
        """Cria propriedade com preço inválido (> 10 milhões)."""
        data = cls.minimal(neighborhood_id, media_id, agent_id)
        data["price"] = 15000000  # Acima do limite
        return data


# =============================================================================
# LEAD FACTORY
# =============================================================================

class LeadFactory(BaseFactory):
    """Factory para criar dados de testes de Leads."""

    # Nomes de exemplo
    FIRST_NAMES = [
        "João", "Maria", "José", "Ana", "Carlos",
        "Fernanda", "Pedro", "Juliana", "Luiz", "Patrícia",
    ]
    LAST_NAMES = [
        "Silva", "Santos", "Oliveira", "Souza", "Lima",
        "Pereira", "Costa", "Ferreira", "Rodrigues", "Almeida",
    ]

    @classmethod
    def minimal(cls) -> Dict[str, Any]:
        """
        Cria dados mínimos para um lead.

        Returns:
            Dict com dados mínimos do lead
        """
        return {
            "name": f"{random.choice(cls.FIRST_NAMES)} {random.choice(cls.LAST_NAMES)}",
            "status": "new",
        }

    @classmethod
    def with_phone(cls) -> Dict[str, Any]:
        """Cria lead com telefone."""
        base = cls.minimal()
        base["phone"] = cls._random_phone()
        return base

    @classmethod
    def with_email(cls) -> Dict[str, Any]:
        """Cria lead com email."""
        base = cls.minimal()
        base["email"] = cls._random_email()
        return base

    @classmethod
    def with_phone_and_email(cls) -> Dict[str, Any]:
        """Cria lead com telefone e email (score máximo)."""
        base = cls.minimal()
        base["phone"] = cls._random_phone()
        base["email"] = cls._random_email()
        return base

    @classmethod
    def complete(cls) -> Dict[str, Any]:
        """Cria lead com todos os campos."""
        base = cls.with_phone_and_email()
        base.update({
            "source": random.choice(["website", "whatsapp", "instagram", "referral", "other"]),
            "status": random.choice([
                "new",
                "contacted",
                "qualified",
                "visit_scheduled",
                "proposal_sent",
                "negotiation",
                "closed_won",
                "closed_lost",
            ]),
            "priority": random.choice(["low", "medium", "high"]),
            "assignedTo": None,  # Será distribuído automaticamente
            "lastContactAt": None,
        })
        return base

    @classmethod
    def with_invalid_phone(cls) -> Dict[str, Any]:
        """Cria lead com telefone inválido."""
        base = cls.minimal()
        base["phone"] = "123"  # Inválido
        return base

    @classmethod
    def with_various_phone_formats(cls) -> List[str]:
        """Retorna lista de telefones em diversos formatos brasileiros."""
        return [
            "(61) 99999-9999",
            "61 99999 9999",
            "61999999999",
            "+55 61 99999-9999",
            "061 99999-9999",
            "(061) 99999-9999",
        ]

    @classmethod
    def _random_phone(cls) -> str:
        """Gera telefone aleatório no formato brasileiro."""
        ddd = ["61", "11", "21", "31", "41", "51", "71", "81"][random.randint(0, 7)]
        number = f"9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
        return f"({ddd}) {number}"

    @classmethod
    def _random_email(cls) -> str:
        """Gera email aleatório."""
        domains = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com"]
        raw_name = random.choice(cls.FIRST_NAMES).lower()
        ascii_name = ''.join(char for char in raw_name if char.isascii() and char.isalpha())
        if not ascii_name:
            ascii_name = "lead"
        name = f"{ascii_name}.{random.randint(100, 999)}"
        return f"{name}@{random.choice(domains)}"


# =============================================================================
# USER FACTORY
# =============================================================================

class UserFactory(BaseFactory):
    """Factory para criar dados de testes de Users."""

    @classmethod
    def admin(cls) -> Dict[str, Any]:
        """Cria dados para usuário admin."""
        return {
            "email": f"admin.test.{cls._random_int(1000, 9999)}@primeurban.test",
            "password": "TestAdminPass123!",
            "name": f"Admin Test {cls._random_int(1000, 9999)}",
            "role": "admin",
        }

    @classmethod
    def agent(cls) -> Dict[str, Any]:
        """Cria dados para usuário agent."""
        return {
            "email": f"agent.test.{cls._random_int(1000, 9999)}@primeurban.test",
            "password": "TestAgentPass123!",
            "name": f"Agent Test {cls._random_int(1000, 9999)}",
            "role": "agent",
        }

    @classmethod
    def minimal(cls, role: str = "agent") -> Dict[str, Any]:
        """Cria dados mínimos para usuário."""
        return {
            "email": f"{role}.test.{cls._random_int(1000, 9999)}@primeurban.test",
            "password": "TestPass123!",
            "name": f"{role.capitalize()} Test {cls._random_int(1000, 9999)}",
            "role": role,
        }


# =============================================================================
# NEIGHBORHOOD FACTORY
# =============================================================================

class NeighborhoodFactory(BaseFactory):
    """Factory para criar dados de testes de Neighborhoods."""

    ZONES = ["Norte", "Sul", "Leste", "Oeste"]

    @classmethod
    def minimal(cls) -> Dict[str, Any]:
        """Cria dados mínimos para bairro."""
        return {
            "name": f"Bairro Teste {cls._random_int(1000, 9999)}",
            "zone": random.choice(cls.ZONES),
        }

    @classmethod
    def complete(cls) -> Dict[str, Any]:
        """Cria dados completos para bairro."""
        base = cls.minimal()
        base.update({
            "description": f"Bairro residencial com ótima infraestrutura. Próximo a escolas, comércio e transporte público.",
            "averagePrice": cls._random_int(400000, 1800000),
            "features": [
                "Escolas próximas",
                "Comércio local",
                "Acesso fácil",
            ],
            "isActive": True,
        })
        return base


# =============================================================================
# MEDIA FACTORY
# =============================================================================

class MediaFactory(BaseFactory):
    """Factory para criar dados de testes de Media."""

    @classmethod
    def image_url(cls) -> str:
        """Retorna URL de imagem placeholder."""
        return f"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"


# =============================================================================
# DEAL FACTORY
# =============================================================================

class DealFactory(BaseFactory):
    """Factory para criar dados de testes de Deals."""

    STAGES = ["prospect", "visiting", "proposal", "negotiation", "closed", "lost"]

    @classmethod
    def minimal(cls, property_id: str, lead_id: str) -> Dict[str, Any]:
        """Cria dados mínimos para negócio."""
        return {
            "property": property_id,
            "lead": lead_id,
            "stage": "prospect",
            "agent": None,  # Será atribuído automaticamente
        }

    @classmethod
    def complete(cls, property_id: str, lead_id: str) -> Dict[str, Any]:
        """Cria dados completos para negócio."""
        base = cls.minimal(property_id, lead_id)
        base.update({
            "stage": random.choice(cls.STAGES),
            "finalPrice": None,
            "proposalDate": None,
            "closingDate": None,
            "commission": cls._random_int(3, 6),  # Porcentagem
            "notes": "Negócio gerado automaticamente para teste",
        })
        return base


# =============================================================================
# ACTIVITY FACTORY
# =============================================================================

class ActivityFactory(BaseFactory):
    """Factory para criar dados de testes de Activities."""

    TYPES = ["call", "email", "whatsapp", "visit", "meeting", "note"]

    @classmethod
    def minimal(cls, lead_id: str) -> Dict[str, Any]:
        """Cria dados mínimos para atividade."""
        return {
            "lead": lead_id,
            "type": random.choice(cls.TYPES),
            "description": "Atividade gerada automaticamente para teste",
        }

    @classmethod
    def with_notes(cls, lead_id: str, notes: str) -> Dict[str, Any]:
        """Cria atividade com notas específicas."""
        base = cls.minimal(lead_id)
        base["description"] = notes
        return base
