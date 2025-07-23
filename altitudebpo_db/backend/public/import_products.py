import pandas as pd
import psycopg2

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="tech_products",
    user="postgres",
    password="your_password",   # <-- change this
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

# Load CSV
df = pd.read_csv("supplier_products.csv")

# Insert each row into the database
for _, row in df.iterrows():
    cursor.execute("""
        INSERT INTO products (sku, name, description, price, stock)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (sku) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            stock = EXCLUDED.stock,
            updated_at = CURRENT_TIMESTAMP
    """, (row['sku'], row['name'], row['description'], row['price'], row['stock']))

conn.commit()
cursor.close()
conn.close()

print("✅ Products imported successfully.")
