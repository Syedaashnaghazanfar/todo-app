import httpx
import json

r = httpx.get('http://localhost:8000/api/openapi.json')
data = r.json()

print("Available API Endpoints:")
print("="*60)
for path in sorted(data['paths'].keys()):
    methods = list(data['paths'][path].keys())
    print(f"{path:40} {', '.join(methods).upper()}")
