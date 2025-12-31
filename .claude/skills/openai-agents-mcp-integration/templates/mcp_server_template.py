"""
MCP Server Template - Expose Tools via FastMCP (Official MCP SDK)

Copy this template to create your own MCP server with custom tools.

Usage:
    1. Copy this file to your project's mcp_server directory as tools.py
    2. Implement your custom tools using @mcp.tool() decorator
    3. Update tool signatures and logic
    4. Create __init__.py and __main__.py (see below)
    5. Run with: python -m mcp_server

Requirements:
    pip install mcp  # Official MCP Python SDK (includes FastMCP)
"""

from typing import Optional
from mcp.server.fastmcp import FastMCP
from sqlmodel import Session

# Import your services/database here
# from src.db import get_session
# from src.services.my_service import MyService

# Create FastMCP server instance (part of official MCP SDK)
mcp = FastMCP("my-mcp-server")


# EXAMPLE TOOL 1: Simple data retrieval
@mcp.tool()
def get_items(
    user_id: str,
    filter: str = "all"
) -> dict:
    """
    Get items for user with optional filter.

    Args:
        user_id: User's unique identifier
        filter: Filter option (all, active, archived)

    Returns:
        Dict with items list and count
    """
    # TODO: Implement your logic here
    try:
        # Example: Get data from database
        # session = next(get_session())
        # items = MyService.get_items(session, user_id, filter)

        # Placeholder response
        items = [
            {"id": 1, "name": "Item 1"},
            {"id": 2, "name": "Item 2"},
        ]

        if not items:
            return {
                "items": [],
                "count": 0,
                "message": "No items found."
            }

        return {
            "items": items,
            "count": len(items),
            "filter": filter
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# EXAMPLE TOOL 2: Create/modify data
@mcp.tool()
def create_item(
    user_id: str,
    name: str,
    description: Optional[str] = None
) -> dict:
    """
    Create a new item for user.

    Args:
        user_id: User's unique identifier
        name: Item name (required)
        description: Optional item description

    Returns:
        Dict with created item details
    """
    # TODO: Implement your logic here
    try:
        # Example: Save to database
        # session = next(get_session())
        # item = MyService.create_item(
        #     session=session,
        #     user_id=user_id,
        #     name=name,
        #     description=description
        # )

        # Placeholder response
        return {
            "success": True,
            "item_id": 1,
            "name": name,
            "message": f"Item '{name}' created successfully."
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# EXAMPLE TOOL 3: Delete data
@mcp.tool()
def delete_item(
    user_id: str,
    item_id: str
) -> dict:
    """
    Delete an item permanently.

    Args:
        user_id: User's unique identifier
        item_id: ID of item to delete

    Returns:
        Dict with success status
    """
    # TODO: Implement your logic here
    try:
        # Example: Delete from database
        # session = next(get_session())
        # MyService.delete_item(
        #     session=session,
        #     user_id=user_id,
        #     item_id=item_id
        # )

        return {
            "success": True,
            "item_id": item_id,
            "message": "Item deleted successfully."
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# EXAMPLE TOOL 4: Update data
@mcp.tool()
def update_item(
    user_id: str,
    item_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None
) -> dict:
    """
    Update item details.

    Args:
        user_id: User's unique identifier
        item_id: ID of item to update
        name: New name (optional)
        description: New description (optional)

    Returns:
        Dict with updated item details
    """
    # TODO: Implement your logic here
    try:
        # Example: Update in database
        # session = next(get_session())
        # item = MyService.update_item(
        #     session=session,
        #     user_id=user_id,
        #     item_id=item_id,
        #     name=name,
        #     description=description
        # )

        return {
            "success": True,
            "item_id": item_id,
            "message": "Item updated successfully."
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# NOTE: FastMCP handles server startup automatically!
# Just create __main__.py with:
#
# """Entry point for MCP server."""
# from mcp_server.tools import mcp
#
# if __name__ == "__main__":
#     mcp.run()  # FastMCP handles everything!
