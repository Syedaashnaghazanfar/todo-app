import pytest
from src.utils.validators import (
    validate_title, validate_description, validate_uuid, validate_pagination
)
import uuid

def test_validate_title_valid():
    """Test validating valid titles"""
    assert validate_title("Test Task") == True
    assert validate_title("A") == True
    assert validate_title("x" * 255) == True

def test_validate_title_invalid():
    """Test validating invalid titles"""
    assert validate_title("") == False
    assert validate_title("   ") == False
    assert validate_title("x" * 256) == False
    assert validate_title(None) == False

def test_validate_description_valid():
    """Test validating valid descriptions"""
    assert validate_description(None) == True
    assert validate_description("") == True
    assert validate_description("A description") == True
    assert validate_description("x" * 5000) == True

def test_validate_description_invalid():
    """Test validating invalid descriptions"""
    assert validate_description("x" * 5001) == False
    assert validate_description(123) == False

def test_validate_uuid_valid():
    """Test validating valid UUIDs"""
    valid_uuid = str(uuid.uuid4())
    assert validate_uuid(valid_uuid) == True

def test_validate_uuid_invalid():
    """Test validating invalid UUIDs"""
    assert validate_uuid("not-a-uuid") == False
    assert validate_uuid("") == False
    assert validate_uuid(None) == False

def test_validate_pagination_valid():
    """Test validating valid pagination"""
    assert validate_pagination(1, 10) == True
    assert validate_pagination(5, 50) == True
    assert validate_pagination(1, 100) == True

def test_validate_pagination_invalid():
    """Test validating invalid pagination"""
    assert validate_pagination(0, 10) == False
    assert validate_pagination(1, 0) == False
    assert validate_pagination(1, 101) == False
