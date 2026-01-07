from dataclasses import dataclass
from typing import Any

@dataclass
class ServiceResponse:
	data: Any
	message: str
