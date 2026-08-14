import urllib.request
import json
import sys

base = "http://localhost:3000"

def get(path):
    with urllib.request.urlopen(base + path) as r:
        return json.loads(r.read())

def post(path, data):
    req = urllib.request.Request(base + path, data=json.dumps(data).encode(), method="POST")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def patch(path, data):
    req = urllib.request.Request(base + path, data=json.dumps(data).encode(), method="PATCH")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def delete(path):
    req = urllib.request.Request(base + path, method="DELETE")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

print("=" * 60)
print("COMPREHENSIVE API TEST")
print("=" * 60)

# 1. Products CRUD
print("\n1. Products CRUD:")
products = get("/api/admin/products")
print(f"   LIST: {len(products['products'])} products")

created = post("/api/admin/products", {
    "name": "Admin Test", "slug": "admin-test", "fabric": "pure-linen",
    "fabricLabel": "Pure Linen", "colorName": "Test", "colorSlug": "test",
    "swatch": "#000", "mrp": 3999, "price": 2999, "images": [],
    "sizes": ["S","M","L"], "summary": "test", "_stock": 10, "_status": "active"
})
print(f"   CREATE: {created['product']['name']}")

updated = patch("/api/admin/products/admin-test", {"price": 2599, "_stock": 99})
print(f"   UPDATE: price={updated['product']['price']}, stock={updated['product']['_stock']}")

deleted = delete("/api/admin/products/admin-test")
print(f"   DELETE: {deleted['deleted']}")

# 2. Categories
print("\n2. Categories:")
cats = get("/api/admin/categories")
print(f"   LIST: {len(cats['categories'])} categories")

# 3. Orders
print("\n3. Orders:")
orders = get("/api/admin/orders")
print(f"   LIST: {len(orders['orders'])} orders")

# 4. Customers
print("\n4. Customers:")
customers = get("/api/admin/customers")
print(f"   LIST: {len(customers['customers'])} customers")

# 5. Inquiries
print("\n5. Inquiries:")
inquiries = get("/api/admin/inquiries")
print(f"   LIST: {len(inquiries['inquiries'])} inquiries")

# 6. Stats
print("\n6. Stats:")
stats = get("/api/admin/stats")
print(f"   Revenue: {stats['totalRevenue']}, Orders: {stats['totalOrders']}, Customers: {stats['totalCustomers']}")

# 7. Monthly Revenue
print("\n7. Monthly Revenue:")
rev = get("/api/admin/monthly-revenue")
print(f"   {len(rev)} months of data")

# 8. Storefront
print("\n8. Storefront Shop API:")
shop = get("/api/shop/products?status=active")
print(f"   LIST: {len(shop['products'])} products")

# 9. Product Detail
print("\n9. Product Detail (no 404):")
detail = get("/api/products/linen-saree-01")
p = detail.get("product", {})
print(f"   {p.get('name')} - {p.get('_status')}")

# 10. Site Config
print("\n10. Site Config:")
config = get("/api/admin/site-config")
print(f"    Announcements: {len(config.get('announcements', []))}")

print("\n" + "=" * 60)
print("ALL TESTS PASSED")
print("=" * 60)
