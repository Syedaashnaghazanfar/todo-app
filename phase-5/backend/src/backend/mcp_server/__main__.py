"""
Entry point for MCP server when run as module: python -m backend.mcp_server

This module starts the FastMCP server with stdio transport.
FastMCP handles all transport setup automatically.
"""

from backend.mcp_server.tools import mcp

if __name__ == "__main__":
    # FastMCP handles stdio transport automatically
    mcp.run()
