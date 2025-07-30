import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError
from pydantic import BaseModel
from typing import Annotated
import httpx
from cachetools import TTLCache
from jose.utils import base64url_decode
from cryptography.hazmat.primitives.asymmetric import rsa
#from cryptography.hazmat.primitives import serialization

JWKS_URL = os.getenv("JWKS_URL")
ALGORITHM = "RS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="not-used")

# Cache for JWKS
jwks_cache = TTLCache(maxsize=1, ttl=3600)

class AuthUser(BaseModel):
    id: str

async def get_jwks():
    if 'keys' not in jwks_cache:
        async with httpx.AsyncClient() as client:
            response = await client.get(JWKS_URL)
            response.raise_for_status()
            jwks_cache['keys'] = response.json()['keys']
    return jwks_cache['keys']

def get_signing_key(jwks, kid: str):
    for key in jwks:
        if key["kid"] == kid:
            return key
    raise HTTPException(status_code=401, detail="Invalid token: unknown key ID")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> AuthUser:
    try:
        # Decode header to get `kid`
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            raise HTTPException(status_code=401, detail="Invalid token header")

        # Get signing key from JWKS
        jwks = await get_jwks()
        signing_key = get_signing_key(jwks, kid)

        # Convert to public key format for `python-jose`
        #public_key = jwt.construct_rsa_public_key(signing_key)
         # Build PEM-formatted public key
        public_key = build_rsa_key(signing_key)

        # Decode token
        payload = jwt.decode(token, public_key, algorithms=[ALGORITHM], options={"verify_aud": False})
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Missing subject in token")
        return AuthUser(id=user_id)

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token invalid: {str(e)}")

def build_rsa_key(jwk):
    n = int.from_bytes(base64url_decode(jwk['n'].encode('utf-8')), 'big')
    e = int.from_bytes(base64url_decode(jwk['e'].encode('utf-8')), 'big')

    public_numbers = rsa.RSAPublicNumbers(e, n)
    public_key = public_numbers.public_key()
    return public_key
    # Convert to PEM if needed
    # pem = public_key.public_bytes(
    #     encoding=serialization.Encoding.PEM,
    #     format=serialization.PublicFormat.SubjectPublicKeyInfo
    # )
    # return pem
