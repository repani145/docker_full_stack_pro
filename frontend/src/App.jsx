import { useEffect, useState } from "react";

const API = "/api/products";

function App() {

  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Unable to load products");
      }

      const data = await response.json();
      setProducts(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add product
  const addProduct = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          price
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to add product");
      }

      setName("");
      setPrice("");

      await fetchProducts();

    } catch (err) {
      setError(err.message);
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Unable to delete product");
      }

      await fetchProducts();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      maxWidth: "600px",
      margin: "50px auto",
      fontFamily: "Arial"
    }}>

      <h1>Product Management</h1>

      <form onSubmit={addProduct}>

        <input
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <button type="submit">Add Product</button>

      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Products</h2>

      {products.map((product) => (
        <div key={product.id} style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "15px 0"
        }}>

          <span>
            {product.name} - ₹{product.price}
          </span>

          <button onClick={() => deleteProduct(product.id)}>
            Delete
          </button>

        </div>
      ))}

    </div>
  );
}

export default App;