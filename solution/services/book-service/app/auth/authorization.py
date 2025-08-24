import logging
import os
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError
from typing import Annotated
from cachetools import TTLCache
from jose.utils import base64url_decode
from cryptography.hazmat.primitives.asymmetric import rsa

from app.auth.jwt_user import JwtUser

JWT_AUDIENCE=os.getenv("JWT_AUDIENCE")
JWKS_URL = os.getenv("JWKS_URL")
ALGORITHM = "RS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="not-used")

# Cache for JWKS
jwks_cache = TTLCache(maxsize=1, ttl=3600)

async def get_jwks():
    if 'keys' not in jwks_cache:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(JWKS_URL)
                response.raise_for_status()
                jwks_cache['keys'] = response.json()['keys']
                logging.info(f"JWKS_KEYS={jwks_cache['keys']}")

        except httpx.RequestError as e:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Could not connect to JWKS endpoint: {e}")
        
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"JWKS endpoint returned error: {e.response.text}")
        
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Unexpected error: {e}")
    return jwks_cache['keys']

def get_signing_key(jwks, kid: str):
    for key in jwks:
        if key["kid"] == kid:
            return key
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: unknown key ID")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> JwtUser:
    try:
        # Decode header to get `kid`
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token header")

        # Get signing key from JWKS
        jwks = await get_jwks()
        signing_key = get_signing_key(jwks, kid)

        # Convert to public key format for `python-jose`
        #public_key = jwt.construct_rsa_public_key(signing_key)
         # Build PEM-formatted public key
        public_key = build_rsa_key(signing_key)

        # Decode token
        payload = jwt.decode(token, public_key, algorithms=[ALGORITHM], audience=JWT_AUDIENCE)
        user_id = payload.get("sub")
        user_name = payload.get("name")
        user_email = payload.get("email")
        user_role = payload.get("role")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing subject in token")
        
        jwtUser = JwtUser(id=user_id, name=user_name, email=user_email, role=user_role)
        logging.info(f"INFO:   Token valid: {jwtUser}")
        return jwtUser
    
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token invalid: {str(e)}")

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

def is_admin(user: JwtUser) -> bool:
    return user.role == 'admin'
